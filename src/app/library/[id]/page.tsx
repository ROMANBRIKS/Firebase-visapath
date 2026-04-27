'use client';

import { Navbar } from "@/components/Navbar";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { Guide } from "@/types/guide";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  Printer, 
  Share2, 
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
  Send,
  X as CloseIcon,
  User,
  Languages
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { askSuccessAssistant } from "@/ai/flows/ai-success-assistant";
import { translateContent } from "@/ai/flows/translate-content";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

type ChatMessage = { role: 'user' | 'model'; text: string };

export default function RoadmapReaderPage() {
  const { id } = useParams();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [translatedRoadmap, setTranslatedRoadmap] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const purchaseRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return doc(db, "users", user.uid, "orders", "all", "lineItems", id as string);
  }, [db, user, id]);

  const { data: roadmap, isLoading, error } = useDoc<Guide>(purchaseRef);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatHistory, isChatOpen]);

  async function handleLanguageChange(lang: string) {
    setSelectedLanguage(lang);
    if (lang === "English") {
      setTranslatedRoadmap(null);
      return;
    }

    if (!roadmap) return;

    setIsTranslating(true);
    try {
      const response = await translateContent({
        text: roadmap.purchasedRoadmap,
        targetLanguage: lang,
      });
      setTranslatedRoadmap(response.translatedText);
      toast({ title: "Roadmap Translated", description: `You are now reading the roadmap in ${lang}.` });
    } catch (err) {
      toast({ title: "Translation Error", description: "AI engine is at capacity. Retrying in English.", variant: "destructive" });
      setSelectedLanguage("English");
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleSendMessage() {
    if (!userInput.trim() || isChatLoading || !roadmap) return;

    const newUserMessage: ChatMessage = { role: 'user', text: userInput };
    const updatedHistory = [...chatHistory, newUserMessage];
    
    setChatHistory(updatedHistory);
    setUserInput("");
    setIsChatLoading(true);

    try {
      const response = await askSuccessAssistant({
        roadmapContent: roadmap.purchasedRoadmap,
        question: userInput,
        history: chatHistory,
      });

      setChatHistory([...updatedHistory, { role: 'model', text: response.answer }]);
    } catch (err: any) {
      toast({
        title: "Assistant Unavailable",
        description: "The expert advisor is currently handling other cases. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChatLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-96 w-full rounded-[48px]" />
          </div>
        </main>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-48 px-6 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto opacity-20" />
            <h1 className="text-3xl font-headline font-bold text-primary">Unauthorized Access</h1>
            <p className="text-muted-foreground">This roadmap hasn't been purchased or doesn't exist in your library.</p>
            <Link href="/guides">
              <Button className="font-bold">Browse Catalog</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />
      
      {/* Reader Controls Bar */}
      <div className="fixed top-24 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/library">
              <Button variant="ghost" size="sm" className="gap-2 font-bold group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <div className="hidden lg:flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary truncate max-w-[200px]">{roadmap.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-xl mr-2">
              <Languages className="w-4 h-4 text-accent" />
              <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
                <SelectTrigger className="w-[110px] h-8 border-none bg-transparent text-xs font-bold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2 font-bold rounded-xl hidden sm:flex">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button size="sm" className="gap-2 font-bold rounded-xl shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-52 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Info */}
          <div className="bg-white rounded-[40px] p-10 border shadow-sm mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 -z-10 blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="space-y-6 relative z-10">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" /> Official 2024/2025 Strategy
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                  <Info className="w-3 h-3" /> Private Access
                </div>
                {selectedLanguage !== "English" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/10">
                    <Sparkles className="w-3 h-3" /> AI Translated: {selectedLanguage}
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary leading-tight">
                {roadmap.country} {roadmap.visaType} <br />
                <span className="text-accent">Strategic Master Roadmap</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                This technical document contains the exact steps, form IDs, and consular strategies verified by former immigration officers.
              </p>
            </div>
          </div>

          {/* Main Roadmap Content */}
          <div className="bg-white rounded-[48px] p-12 md:p-16 border shadow-2xl relative">
            {isTranslating && (
              <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-[48px]">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
                  <p className="font-headline font-bold text-accent">Translating Strategic Roadmap...</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden rotate-[-35deg]">
              <div className="text-[120px] font-headline font-bold text-primary whitespace-nowrap">
                VISAPATH EXCLUSIVE • VISAPATH EXCLUSIVE • VISAPATH EXCLUSIVE
              </div>
            </div>

            <div className="prose prose-slate max-w-none relative z-10">
              <div className="flex items-center gap-3 mb-12 pb-6 border-b">
                <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary m-0">Confidential Technical Data</h2>
                  <p className="text-sm text-muted-foreground font-medium m-0">Authorized for {user?.email || "verified purchaser"}</p>
                </div>
              </div>

              <div className="whitespace-pre-line text-slate-700 leading-relaxed font-body roadmap-content">
                {translatedRoadmap || roadmap.purchasedRoadmap}
              </div>
            </div>
            
            {/* Success Assistant CTA */}
            <div className="mt-20 pt-12 border-t text-center">
              <div className="bg-accent/5 rounded-[40px] p-10 border-2 border-dashed border-accent/20 space-y-6">
                <div className="bg-accent w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-accent/20">
                  <MessageSquare className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-primary">Need technical clarification?</h3>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Your purchase includes access to our **AI Success Assistant**, trained specifically on the latest {roadmap.country} regulations.
                </p>
                <Button 
                  onClick={() => setIsChatOpen(true)}
                  className="h-14 px-10 rounded-2xl bg-accent text-white font-bold gap-2 hover:scale-105 transition-all shadow-xl shadow-accent/20"
                >
                  <Sparkles className="w-5 h-5" /> Chat with Success Assistant
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
            © {new Date().getFullYear()} VisaPath Guides • Private & Confidential • Distribution Prohibited
          </div>
        </div>
      </main>

      {/* Success Assistant Chat Drawer */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full border-l shadow-2xl">
          <SheetHeader className="p-6 border-b bg-primary text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-white font-headline">Success Assistant</SheetTitle>
                  <SheetDescription className="text-white/80 text-xs">
                    Expert clarification for your {roadmap.visaType} guide.
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-6 pb-4">
              {chatHistory.length === 0 && (
                <div className="text-center space-y-4 py-8">
                  <div className="bg-muted/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto">
                    <Info className="w-8 h-8 text-primary/20" />
                  </div>
                  <p className="text-sm text-muted-foreground px-8 leading-relaxed">
                    "Hi! I'm your specialized assistant. Ask me anything about the requirements, forms, or strategy mentioned in this roadmap."
                  </p>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-accent text-white" : "bg-primary text-white"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed max-w-[85%]",
                    msg.role === 'user' 
                      ? "bg-accent/10 text-accent font-medium rounded-tr-none" 
                      : "bg-muted rounded-tl-none text-slate-700"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  <div className="h-12 w-32 bg-muted rounded-2xl rounded-tl-none" />
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-white mt-auto">
            <div className="flex gap-2">
              <Input 
                placeholder="Ask about forms, fees, or strategy..." 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="h-12 rounded-xl"
                disabled={isChatLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isChatLoading || !userInput.trim()}
                className="h-12 w-12 rounded-xl p-0"
              >
                {isChatLoading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <style jsx global>{`
        .roadmap-content h1, .roadmap-content h2, .roadmap-content h3 {
          font-family: var(--font-space-grotesk);
          color: hsl(var(--primary));
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }
        .roadmap-content h1 { font-size: 2rem; }
        .roadmap-content h2 { font-size: 1.5rem; border-left: 4px solid hsl(var(--accent)); padding-left: 1rem; }
        .roadmap-content h3 { font-size: 1.25rem; }
        .roadmap-content ul {
          list-style: none;
          padding-left: 0;
          margin: 1.5rem 0;
        }
        .roadmap-content li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.75rem;
        }
        .roadmap-content li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: hsl(var(--accent));
          font-weight: bold;
        }
        .roadmap-content strong {
          color: hsl(var(--primary));
          background: hsl(var(--primary) / 0.05);
          padding: 0 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
