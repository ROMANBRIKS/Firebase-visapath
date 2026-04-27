'use client';

import { Navbar } from "@/components/Navbar";
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from "@/firebase";
import { doc, serverTimestamp, setDoc, deleteDoc, collection } from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShoppingCart, ShieldCheck, Download, Clock, Globe, ArrowLeft, Loader2, Volume2, Play, Pause, Headphones, Bell, BellOff, Languages } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Guide } from "@/types/guide";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState, useRef, useEffect } from "react";
import { generateAudioGuide } from "@/ai/flows/generate-audio-guide";
import { translateContent } from "@/ai/flows/translate-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { label: "English", value: "English" },
  { label: "Spanish (Español)", value: "Spanish" },
  { label: "Portuguese (Português)", value: "Portuguese" },
  { label: "Hindi (हिन्दी)", value: "Hindi" },
  { label: "Chinese (中文)", value: "Chinese" },
  { label: "Russian (Русский)", value: "Russian" },
  { label: "Arabic (العربية)", value: "Arabic" },
  { label: "French (Français)", value: "French" },
  { label: "German (Deutsch)", value: "German" }
];

export default function GuideDetailPage() {
  const { id } = useParams();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [translatedPitch, setTranslatedPitch] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const guideRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "visaGuides", id as string);
  }, [db, id]);

  const { data: guide, isLoading } = useDoc<Guide>(guideRef);

  // Watchlist check
  const watchlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "watchlist");
  }, [db, user]);
  const { data: watchlist } = useCollection(watchlistQuery);
  const isWatching = watchlist?.some(w => w.id === guide?.country.toLowerCase());

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  async function handleLanguageChange(lang: string) {
    setSelectedLanguage(lang);
    if (lang === "English") {
      setTranslatedPitch(null);
      return;
    }

    if (!guide) return;

    setIsTranslating(true);
    try {
      const response = await translateContent({
        text: guide.fullContent,
        targetLanguage: lang,
      });
      setTranslatedPitch(response.translatedText);
    } catch (err) {
      toast({ title: "Translation Engine Busy", description: "Please try again in 30s.", variant: "destructive" });
      setSelectedLanguage("English");
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleToggleWatch() {
    if (!db || !user || !guide) return;
    const watchRef = doc(db, "users", user.uid, "watchlist", guide.country.toLowerCase());
    
    if (isWatching) {
      await deleteDoc(watchRef);
      toast({ title: "Notifications Disabled", description: `You are no longer watching ${guide.country} policy changes.` });
    } else {
      await setDoc(watchRef, {
        id: guide.country.toLowerCase(),
        country: guide.country,
        visaType: guide.visaType,
        watchedAt: serverTimestamp(),
      });
      toast({ title: "Policy Watch Enabled", description: `We'll research 2024/2025 changes for ${guide.country} for you.` });
      router.push('/alerts');
    }
  }

  function handleAddToCart() {
    if (!db || !user || !guide) {
      toast({
        title: "Sign-in Required",
        description: "Please wait a moment while we set up your secure session.",
        variant: "destructive"
      });
      return;
    }

    const cartItemRef = doc(db, "users", user.uid, "carts", "default", "cartItems", guide.id);
    
    setDocumentNonBlocking(cartItemRef, {
      ...guide,
      addedAt: serverTimestamp(),
    }, { merge: true });

    toast({
      title: "Added to Cart",
      description: `${guide.title} has been added to your shopping bag.`,
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    setTimeout(() => router.push('/cart'), 500);
  }

  async function handlePlayAudio() {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          toast({ title: "Playback Error", description: "Browser blocked the audio. Please click again.", variant: "destructive" });
        });
      }
      return;
    }

    if (!guide) return;

    if (audioRef.current) {
      audioRef.current.play().then(() => audioRef.current?.pause()).catch(() => {});
    }

    setIsGeneratingAudio(true);
    try {
      const narrationText = `Expert roadmap for the ${guide.title}. This guide covers requirements for ${guide.country}. ${guide.shortDescription}. Prerequisites include: ${guide.prerequisites.slice(0, 3).join('. ')}.`;
      
      const { audioUri } = await generateAudioGuide({ text: narrationText });
      setAudioUrl(audioUri);
      
      if (audioRef.current) {
        audioRef.current.src = audioUri;
        audioRef.current.load();
        audioRef.current.oncanplaythrough = () => {
          audioRef.current?.play().catch((e) => {
            console.warn("Autoplay still restricted after generation", e);
            setIsPlaying(false);
          });
          if (audioRef.current) audioRef.current.oncanplaythrough = null;
        };
      }
    } catch (error: any) {
      console.error(error);
      const isQuota = error.message?.includes("429") || error.message?.includes("QUOTA");
      toast({
        title: isQuota ? "AI Narrator Busy" : "Audio Unavailable",
        description: isQuota ? "Too many requests. Please wait a minute." : "The AI narrator encountered a transient error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-[600px] w-full rounded-[40px]" />
          </div>
        </main>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 px-6 text-center">
          <h1 className="text-2xl font-bold">Guide not found</h1>
          <Link href="/guides"><Button variant="link">Back to Catalog</Button></Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} className="hidden" />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </Link>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px]">{guide.category}</Badge>
                  <Badge variant="outline" className="border-accent text-accent">{guide.country}</Badge>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary leading-tight flex-1">
                    {guide.title}
                  </h1>
                  <Button 
                    onClick={handleToggleWatch} 
                    variant={isWatching ? "secondary" : "outline"}
                    className={cn("h-14 px-8 rounded-2xl gap-3 font-bold border-2 shrink-0", isWatching && "bg-accent/10 text-accent border-accent")}
                  >
                    {isWatching ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    {isWatching ? "Watching Policies" : "Watch for Changes"}
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-[32px] p-6 flex items-center justify-between gap-6 shadow-xl border border-primary/5 ring-1 ring-black/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                        {isGeneratingAudio ? <Headphones className="w-5 h-5 text-primary animate-pulse" /> : <Volume2 className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm">AI Voice Roadmap</p>
                        <p className="text-[10px] text-muted-foreground">
                          {isGeneratingAudio ? "Generating..." : "30s expert summary"}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handlePlayAudio} disabled={isGeneratingAudio} size="sm" className="rounded-full w-10 h-10 p-0">
                      {isGeneratingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </Button>
                  </div>

                  <div className="bg-white rounded-[32px] p-6 flex items-center justify-between gap-6 shadow-xl border border-accent/5 ring-1 ring-black/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                        {isTranslating ? <Languages className="w-5 h-5 text-accent animate-pulse" /> : <Languages className="w-5 h-5 text-accent" />}
                      </div>
                      <div>
                        <p className="font-bold text-accent text-sm">Translate Pitch</p>
                        <p className="text-[10px] text-muted-foreground">Read in your native tongue</p>
                      </div>
                    </div>
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
                      <SelectTrigger className="w-[120px] h-10 rounded-xl border-none bg-muted/50 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => (
                          <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <p className="text-xl text-muted-foreground leading-relaxed">
                  {guide.shortDescription}
                </p>
                <div className="relative aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl">
                  <Image src={guide.imageUrl} alt={guide.title} fill priority className="object-cover" />
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
                  About this Guide
                  {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                </h2>
                <div className={cn(
                  "prose prose-blue max-w-none text-muted-foreground leading-relaxed whitespace-pre-line bg-white/50 p-8 rounded-3xl border transition-opacity duration-300",
                  isTranslating ? "opacity-50" : "opacity-100"
                )}>
                  {translatedPitch || guide.fullContent}
                </div>
              </section>

              {guide.tableOfContents && guide.tableOfContents.length > 0 && (
                <section className="bg-white rounded-[40px] p-10 border space-y-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-xl"><Download className="w-5 h-5 text-accent" /></div>
                    <h2 className="text-2xl font-headline font-bold">What's Inside</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {guide.tableOfContents.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/10 transition-colors">
                        <div className="bg-primary text-white font-bold w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-md">{idx + 1}</div>
                        <span className="text-sm font-bold text-primary/80 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                <div className="bg-white rounded-[40px] p-8 border shadow-2xl space-y-8">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Standard License</span>
                    <span className="text-4xl font-headline font-bold text-primary">${guide.price}</span>
                  </div>
                  <div className="space-y-4">
                    <Button onClick={handleAddToCart} className="w-full h-16 text-lg font-bold shadow-2xl shadow-primary/20 rounded-2xl gap-3">
                      <ShoppingCart className="w-6 h-6" /> Add to Cart
                    </Button>
                    <Button onClick={handleBuyNow} variant="outline" className="w-full h-14 font-bold rounded-2xl border-2">Buy Now</Button>
                  </div>
                  <div className="pt-8 border-t space-y-5">
                    {[
                      { icon: <Download className="w-4 h-4 text-accent" />, text: "Instant PDF Roadmap" },
                      { icon: <Clock className="w-4 h-4 text-accent" />, text: "2024 Policy Updates" },
                      { icon: <ShieldCheck className="w-4 h-4 text-accent" />, text: "Consular Officer Verified" },
                      { icon: <Headphones className="w-4 h-4 text-accent" />, text: "Unlimited Audio Summaries" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <div className="bg-accent/5 p-2 rounded-lg">{item.icon}</div>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/5 p-6 rounded-[32px] border-2 border-dashed border-accent/20 space-y-4">
                  <div className="flex items-center gap-2 text-accent font-bold">
                    <Bell className="w-4 h-4" /> Policy Watch
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Regulations for <b>{guide.country}</b> change frequently. Enable Policy Watch to receive AI-researched alerts on salary and form updates.
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-accent font-bold text-sm"
                    onClick={handleToggleWatch}
                  >
                    {isWatching ? "Review Watches →" : "Watch this country →"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
