
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Bell, Loader2, Globe, ShieldCheck, Zap, X, Info, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { generatePolicyUpdates, GeneratePolicyUpdatesOutput } from "@/ai/flows/generate-policy-updates";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type WatchItem = { id: string; country: string; visaType: string; watchedAt: any };

export default function AlertsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedWatch, setSelectedWatch] = useState<WatchItem | null>(null);
  const [updates, setUpdates] = useState<GeneratePolicyUpdatesOutput | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  const watchQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "watchlist"), orderBy("watchedAt", "desc"));
  }, [db, user]);

  const { data: watchlist, isLoading: isLoadingWatch } = useCollection<WatchItem>(watchQuery);

  async function fetchUpdates(item: WatchItem) {
    setSelectedWatch(item);
    setIsResearching(true);
    setUpdates(null);
    try {
      const result = await generatePolicyUpdates({ country: item.country, visaType: item.visaType });
      setUpdates(result);
    } catch (err) {
      toast({ title: "Policy Feed Busy", variant: "destructive" });
    } finally {
      setIsResearching(false);
    }
  }

  function handleUnwatch(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!db || !user) return;
    deleteDoc(doc(db, "users", user.uid, "watchlist", id));
    if (selectedWatch?.id === id) {
      setSelectedWatch(null);
      setUpdates(null);
    }
    toast({ title: "Removed from Watchlist" });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <MemberSubNav />
      <main className="flex-1 pb-20 px-6 pt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                <Bell className="w-3 h-3" /> Monitoring Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">Policy Watch</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Real-time research into 2024/2025 regulatory changes for your target destinations.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[40px] p-8 border shadow-sm space-y-6 sticky top-48">
                <h2 className="text-xl font-headline font-bold flex items-center gap-2 text-primary">
                  <Globe className="w-5 h-5" /> Your Watchlist
                </h2>
                {isLoadingWatch ? (
                  <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : watchlist && watchlist.length > 0 ? (
                  <div className="space-y-3">
                    {watchlist.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => fetchUpdates(item)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer group relative",
                          selectedWatch?.id === item.id 
                            ? "bg-primary text-white border-primary shadow-lg scale-[1.02]" 
                            : "bg-white hover:border-primary/50"
                        )}
                      >
                        <button 
                          onClick={(e) => handleUnwatch(e, item.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded-full transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="font-bold line-clamp-1">{item.country}</p>
                        <p className={cn("text-xs font-medium opacity-70")}>{item.visaType}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4 bg-muted/5 rounded-3xl border border-dashed">
                    <p className="text-sm text-muted-foreground px-4">Your watchlist is empty.</p>
                    <Link href="/guides"><Button variant="outline" size="sm" className="rounded-xl font-bold">Browse Guides</Button></Link>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              {!selectedWatch ? (
                <div className="bg-white rounded-[48px] p-24 border border-dashed text-center space-y-8 shadow-inner bg-muted/5 flex flex-col items-center">
                  <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-2xl">
                    <Zap className="w-12 h-12 text-primary opacity-20" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-primary">Select a destination</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">Click a country from your watchlist to trigger a real-time AI scan.</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-primary rounded-[40px] p-10 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2">
                      <Badge className="bg-white/20 text-white border-none">Active Scan: {selectedWatch.country}</Badge>
                      <h2 className="text-3xl font-headline font-bold">{selectedWatch.visaType} Updates</h2>
                    </div>
                    {isResearching && (
                      <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl animate-pulse">
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span className="font-bold text-sm">Researching Global Policies...</span>
                      </div>
                    )}
                  </div>

                  {updates && (
                    <div className="bg-accent/5 rounded-[32px] p-8 border-2 border-dashed border-accent/20 flex gap-6 items-start">
                      <div className="bg-accent p-3 rounded-2xl shrink-0"><TrendingUp className="text-white w-6 h-6" /></div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-headline font-bold text-primary">Strategic Landscape</h4>
                        <p className="text-muted-foreground leading-relaxed italic">"{updates.expertSummary}"</p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6">
                    {updates?.updates.map((upd, idx) => (
                      <Card key={idx} className="rounded-[32px] border shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-6">
                          <div className="space-y-1">
                            <CardTitle className="text-lg font-headline font-bold text-primary">{upd.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 font-medium"><ShieldCheck className="w-3 h-3" /> Effective: {upd.date}</CardDescription>
                          </div>
                          <Badge variant={upd.impactLevel === 'High' ? 'destructive' : 'default'}>{upd.impactLevel} Impact</Badge>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                          <p className="text-slate-700 leading-relaxed font-medium">{upd.description}</p>
                          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex gap-4 items-start">
                            <AlertTriangle className="text-emerald-600 w-5 h-5 mt-1" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Recommended Action</p>
                              <p className="text-sm font-bold text-emerald-900">{upd.actionRequired}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
