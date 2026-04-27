
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Guide } from "@/types/guide";
import { BookOpen, ArrowRight, Loader2, Library, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function LibraryPage() {
  const { user } = useUser();
  const db = useFirestore();

  const libraryQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "orders", "all", "lineItems"), orderBy("purchasedAt", "desc"));
  }, [db, user]);

  const { data: purchasedGuides, isLoading } = useCollection<Guide & { purchasedAt: any }>(libraryQuery);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <MemberSubNav />
      <main className="flex-1 pb-20 px-6 pt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Secure Vault
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">Your Technical Library</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Immediate access to your expert technical roadmaps. Each guide contains verified strategic advice and phase-by-phase guidance.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
              <p className="text-muted-foreground animate-pulse font-medium">Unlocking your vault...</p>
            </div>
          ) : purchasedGuides && purchasedGuides.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {purchasedGuides.map((guide) => (
                <div key={guide.id} className="bg-white rounded-[40px] overflow-hidden border shadow-sm hover:shadow-2xl transition-all duration-500 group">
                  <div className="relative h-56 w-full">
                    <Image src={guide.imageUrl} alt={guide.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] uppercase font-bold mb-2">
                        {guide.category}
                      </Badge>
                      <h3 className="text-xl font-headline font-bold text-white line-clamp-1">{guide.title}</h3>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Globe className="w-4 h-4" /> {guide.country}
                      </div>
                      <div className="text-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Lifetime Access
                      </div>
                    </div>
                    <Link href={`/library/${guide.id}`}>
                      <Button className="w-full h-14 text-lg font-bold gap-3 rounded-2xl shadow-xl shadow-primary/10 group-hover:scale-[1.02] transition-transform">
                        <BookOpen className="w-5 h-5" /> Open Roadmap <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[48px] p-24 border border-dashed text-center space-y-8 shadow-inner bg-muted/5">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Library className="w-12 h-12 text-primary opacity-20" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-headline font-bold text-primary">Your library is empty</h3>
                <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Start by browsing our expert guides and secure your strategic path to success.
                </p>
              </div>
              <Link href="/guides" className="inline-block">
                <Button size="lg" className="font-bold h-14 px-12 gap-3 rounded-2xl shadow-2xl shadow-primary/20">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
