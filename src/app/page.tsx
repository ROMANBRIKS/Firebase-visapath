
'use client';

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { GuideCard } from "@/components/GuideCard";
import { ShieldCheck, Zap, Globe, ArrowRight, CheckCircle, Loader2, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { Guide } from "@/types/guide";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const db = useFirestore();

  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "visaGuides"), limit(3), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: featuredGuides, isLoading } = useCollection<Guide>(featuredQuery);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-travel')?.imageUrl || "https://picsum.photos/seed/travel-main/800/800";

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VisaPath Guides",
    "url": "https://visapath-guides.web.app",
    "logo": "https://visapath-guides.web.app/logo.png",
    "description": "Expert-authored visa acquisition guides for high-skilled professionals and global travelers.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://visapath-guides.web.app/guides?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -z-10 rounded-bl-[300px] blur-3xl opacity-50" />
          
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                <Star className="w-4 h-4 fill-primary" />
                Trusted by 50,000+ Global Travelers
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-primary">
                Your Global Career <span className="text-accent">Starts Here</span>.
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Expert-authored visa guides for Working, Studying, and Relocating. 
                Get step-by-step roadmaps for the UK, USA, Canada, and beyond.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/guides">
                  <Button size="lg" className="px-10 h-16 text-lg font-bold shadow-2xl shadow-primary/30 rounded-2xl">
                    Browse All Guides
                  </Button>
                </Link>
                <Link href="/match">
                  <Button size="lg" variant="outline" className="px-10 h-16 text-lg font-bold border-2 rounded-2xl bg-white/50 backdrop-blur-sm">
                    Find My Path <Sparkles className="ml-2 w-5 h-5 text-accent" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-muted overflow-hidden relative">
                      <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="Visa applicant" width={40} height={40} className="object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    +50k
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-bold text-primary">4.9/5</span> from verified applications
                </div>
              </div>
            </div>
            
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
              <div className="relative aspect-square max-w-[550px] mx-auto group">
                <div className="absolute inset-0 bg-accent/20 rounded-[40px] rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/10 rounded-[40px] -rotate-3 group-hover:-rotate-6 transition-transform duration-500" />
                <Image
                  src={heroImage}
                  alt="Professional global traveler navigating international relocation"
                  fill
                  priority
                  className="object-cover rounded-[40px] shadow-2xl relative"
                  data-ai-hint="professional traveler"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-primary/10 animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-2xl">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Visa Status</p>
                      <p className="text-lg font-headline font-bold text-primary">Approved!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white border-y">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <ShieldCheck className="w-8 h-8 text-primary" />,
                  title: "Expert Verified",
                  desc: "Authored by former consular officers and immigration experts with 20+ years of experience."
                },
                {
                  icon: <Zap className="w-8 h-8 text-primary" />,
                  title: "Instant Access",
                  desc: "Secure checkout with immediate PDF downloads. Start your application in minutes."
                },
                {
                  icon: <Globe className="w-8 h-8 text-primary" />,
                  title: "Global Updates",
                  desc: "We monitor policy changes daily. Get lifetime updates for every guide you purchase."
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4 p-8 rounded-[32px] hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/5 w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-headline font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Guides Section */}
        <section className="py-24 bg-background/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                  Hot Destinations
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Popular Visa Resources</h2>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Our most requested guides for professional relocation, high-skilled work permits, and nomad life.
                </p>
              </div>
              <Link href="/guides">
                <Button variant="ghost" className="h-14 px-8 gap-2 font-bold text-primary hover:bg-primary/5 group">
                  Explore Full Catalog <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-[32px]" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : featuredGuides && featuredGuides.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredGuides.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] p-20 border border-dashed text-center space-y-6">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="w-10 h-10 text-muted-foreground opacity-30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-headline font-bold text-primary">The catalog is ready to be filled</h3>
                  <p className="text-muted-foreground max-sm mx-auto">
                    Visit the dashboard to seed your database with professional UK, USA, and Canada guides.
                  </p>
                </div>
                <Link href="/dashboard" className="inline-block">
                  <Button className="font-bold h-12 px-8 shadow-lg">Go to Dashboard</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* AI CTA Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-primary rounded-[48px] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(59,130,246,0.3)]">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full translate-x-1/2 translate-y-1/2 blur-[100px]" />
              
              <div className="relative z-10 space-y-10">
                <div className="bg-white/10 w-fit mx-auto px-6 py-2 rounded-full backdrop-blur-md border border-white/20 text-sm font-bold tracking-widest uppercase">
                  Powered by Google Gemini
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-bold">Confused by Visa Regulations?</h2>
                <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Our AI Agent analyzes your unique profile to recommend the exact visa guide you need. 
                  Skip the government paperwork confusion and get a personalized path in seconds.
                </p>
                <Link href="/match" className="inline-block pt-4">
                  <Button size="lg" variant="secondary" className="h-16 px-16 text-xl font-bold shadow-2xl rounded-2xl hover:scale-105 transition-transform">
                    Get AI Recommendation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-primary p-2.5 rounded-xl">
                  <Globe className="text-white w-7 h-7" />
                </div>
                <span className="font-headline font-bold text-3xl tracking-tight text-primary">
                  VisaPath<span className="text-accent">Guides</span>
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm text-lg leading-relaxed">
                Empowering high-skilled professionals and travelers with expert-level visa intelligence. Your journey starts with the right information.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="font-headline font-bold text-primary text-xl">Quick Links</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="/guides" className="hover:text-primary transition-colors font-medium">Browse Catalog</Link></li>
                <li><Link href="/match" className="hover:text-primary transition-colors font-medium">AI Matcher</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors font-medium">Support Center</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-headline font-bold text-primary text-xl">Legal</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors font-medium">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors font-medium">Terms of Service</Link></li>
                <li><Link href="/refunds" className="hover:text-primary transition-colors font-medium">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t text-center text-muted-foreground/60 text-sm font-medium">
            © {new Date().getFullYear()} VisaPath Guides. All rights reserved. 
            <p className="mt-2 text-[10px] uppercase tracking-widest">Independent Resource • Not Affiliated with Government Agencies</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
