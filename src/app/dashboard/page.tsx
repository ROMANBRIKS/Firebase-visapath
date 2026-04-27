
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { 
  Sparkles, 
  ClipboardCheck, 
  Calculator, 
  Headphones, 
  Bell, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Star
} from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (auth && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  const memberTools = [
    {
      title: "Document Checklist",
      desc: "AI-audited list of required documents based on your specific professional profile.",
      href: "/checklist",
      icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
      color: "bg-primary/10",
      accent: "border-primary/20"
    },
    {
      title: "Relocation Budget",
      desc: "Research 2024/2025 visa fees, health surcharges, and local cost of living.",
      href: "/budget",
      icon: <Calculator className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50",
      accent: "border-emerald-200"
    },
    {
      title: "Interview Simulator",
      desc: "Practice with a strict AI Consular Officer and get a real-time success score.",
      href: "/simulator",
      icon: <Headphones className="w-6 h-6 text-accent" />,
      color: "bg-accent/10",
      accent: "border-accent/20"
    },
    {
      title: "Policy Alerts",
      desc: "Monitor your target destinations for regulatory changes and salary updates.",
      href: "/alerts",
      icon: <Bell className="w-6 h-6 text-orange-500" />,
      color: "bg-orange-50",
      accent: "border-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <MemberSubNav />
      <main className="flex-1 pb-20 px-6 pt-12">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Welcome Header */}
          <section className="bg-primary rounded-[48px] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[100px]" />
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest border border-white/20 backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4" /> Verified Member Access
                </div>
                <h1 className="text-5xl md:text-6xl font-headline font-bold leading-tight">
                  Welcome to <br />
                  <span className="text-accent">Mission Control</span>
                </h1>
                <p className="text-white/80 text-xl leading-relaxed">
                  Everything you need to master your international relocation. Use your specialized AI tools to prepare your application with expert precision.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/library">
                    <Button variant="secondary" className="h-14 px-8 font-bold rounded-2xl gap-2 shadow-xl">
                      My Library
                    </Button>
                  </Link>
                  <Link href="/guides">
                    <Button variant="outline" className="h-14 px-8 font-bold rounded-2xl border-2 bg-white/10 hover:bg-white/20">
                      Explore Catalog
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative w-80 h-80">
                <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse" />
                <div className="absolute inset-4 bg-white/5 rounded-full animate-pulse delay-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-32 h-32 text-accent opacity-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </div>
          </section>

          {/* AI Tools Grid */}
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-headline font-bold flex items-center gap-3 text-primary">
                <Sparkles className="w-8 h-8 text-accent fill-accent" />
                Relocation Toolkit
              </h2>
              <Badge variant="outline" className="px-4 py-1.5 font-bold text-muted-foreground border-2">
                4 Active AI Agents
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {memberTools.map((tool) => (
                <Link href={tool.href} key={tool.title} className="group">
                  <div className={`bg-white rounded-[40px] p-8 border-2 ${tool.accent} shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col space-y-6 group-hover:-translate-y-2`}>
                    <div className={`${tool.color} w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      {tool.icon}
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors">{tool.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {tool.desc}
                      </p>
                    </div>
                    <div className="pt-6 border-t flex items-center text-sm font-bold text-primary gap-2">
                      Launch Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* New Destination Research CTA */}
          <section className="bg-accent/5 rounded-[48px] p-12 border-2 border-dashed border-accent/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <div className="space-y-4">
                <h3 className="text-3xl font-headline font-bold text-primary flex items-center gap-3 justify-center md:justify-start">
                  <Globe className="w-8 h-8 text-accent" />
                  Target New Destinations?
                </h3>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Looking for a roadmap not yet in our catalog? Our AI Researcher can analyze any visa category in real-time.
                </p>
              </div>
              <Link href="/match">
                <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-2xl gap-3 shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90">
                  <Sparkles className="w-6 h-6" /> Start AI Matching
                </Button>
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
