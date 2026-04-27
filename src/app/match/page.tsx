
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { AIGuideMatcher } from "@/components/AIGuideMatcher";
import { useUser } from "@/firebase";

export default function MatchPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {user && <MemberSubNav />}
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Find Your Path</h1>
            <p className="text-lg text-muted-foreground">
              Don't spend hours researching government sites. Our AI agent knows the latest regulations and can point you to the right guide instantly.
            </p>
          </div>
          
          <AIGuideMatcher />
          
          <div className="mt-20 grid md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <div className="space-y-2">
              <h4 className="font-bold text-primary text-lg">1. Input Details</h4>
              <p className="text-sm text-muted-foreground italic">Origin, destination, and intent</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-primary text-lg">2. AI Analysis</h4>
              <p className="text-sm text-muted-foreground italic">Scanning current regulations</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-primary text-lg">3. Get Results</h4>
              <p className="text-sm text-muted-foreground italic">Perfect guide recommendations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
