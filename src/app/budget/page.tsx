
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { calculateRelocationBudget, CalculateRelocationBudgetOutput } from "@/ai/flows/calculate-relocation-budget";
import { Wallet, Loader2, Landmark, Home, Calculator, Coins, TrendingDown, Info, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BudgetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<CalculateRelocationBudgetOutput | null>(null);
  const [familySize, setFamilySize] = useState(1);
  const { toast } = useToast();

  async function handleCalculate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const input = {
      country: formData.get("country") as string,
      visaType: formData.get("visaType") as string,
      familySize: Number(formData.get("familySize")),
    };

    if (!input.country || !input.visaType) {
      toast({ title: "Incomplete", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await calculateRelocationBudget(input);
      setBudget(result);
      toast({ title: "Budget Calculated" });
    } catch (error) {
      toast({ title: "API Limit reached", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: budget?.currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <MemberSubNav />
      <main className="flex-1 pb-20 px-6 pt-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">Relocation Capital</h1>
            <p className="text-lg text-muted-foreground">
              Expert financial estimation for your move, including visa surcharges, housing deposits, and survival funds.
            </p>
          </div>

          {!budget ? (
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="bg-emerald-600 p-12 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Wallet className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-2">
                  <h2 className="text-2xl font-headline font-bold">Arrival Capital Estimator</h2>
                  <p className="text-white/80">Calculates mandatory 2024/2025 costs based on your family size.</p>
                </div>
              </div>
              <CardContent className="p-12">
                <form onSubmit={handleCalculate} className="grid md:grid-cols-3 gap-8 items-end">
                  <div className="space-y-3">
                    <Label className="font-bold">Destination</Label>
                    <Input name="country" placeholder="e.g. UK" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Visa Category</Label>
                    <Input name="visaType" placeholder="e.g. Skilled Worker" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Family Size</Label>
                    <Input 
                      name="familySize" 
                      type="number" 
                      min="1" 
                      max="10" 
                      defaultValue="1" 
                      onChange={(e) => setFamilySize(Number(e.target.value))}
                      className="h-12 rounded-xl" 
                    />
                  </div>
                  <div className="md:col-span-3 pt-6">
                    <Button type="submit" disabled={isLoading} className="w-full h-16 text-xl font-bold rounded-2xl gap-3 shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700">
                      {isLoading ? <Loader2 className="animate-spin" /> : <Calculator className="w-6 h-6" />}
                      {isLoading ? "Analyzing Regional Costs..." : "Calculate My Relocation Budget"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-primary rounded-[40px] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                  <div className="space-y-6">
                    <Badge className="bg-white/20 text-white border-none px-4 py-1">Total Estimated Capital</Badge>
                    <h2 className="text-6xl md:text-8xl font-headline font-bold">{formatCurrency(budget.totalEstimatedCapital)}</h2>
                    <p className="text-xl text-white/80 font-medium">Arrival fund for {familySize} {familySize > 1 ? 'members' : 'person'}.</p>
                  </div>
                  <Button variant="secondary" className="h-14 px-8 font-bold rounded-xl gap-2" onClick={() => setBudget(null)}>
                    <TrendingDown className="w-5 h-5" /> New Estimation
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {[
                  { title: "Official Fees", icon: <Landmark className="text-primary" />, items: budget.officialFees },
                  { title: "Survival Fund", icon: <Coins className="text-accent" />, items: budget.survivalFund },
                  { title: "Initial Housing", icon: <Home className="text-emerald-600" />, items: budget.housingCosts }
                ].map((section, idx) => (
                  <Card key={idx} className="rounded-[32px] border-none shadow-lg bg-white overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b p-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm">{section.icon}</div>
                        <CardTitle className="text-lg font-headline font-bold">{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-bold leading-none">{item.name}</p>
                            <p className="text-xs text-muted-foreground leading-tight">{item.description}</p>
                          </div>
                          <span className="font-bold text-sm whitespace-nowrap">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-accent/5 rounded-[40px] p-10 border-2 border-dashed border-accent/20 space-y-6">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-accent" />
                  <h3 className="text-2xl font-headline font-bold text-primary">Strategic Advice</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed italic">"{budget.expertNote}"</p>
                <div className="pt-4">
                  <Button variant="outline" className="rounded-xl font-bold border-accent text-accent gap-2" onClick={() => window.location.href = '/guides'}>
                    Check Technical Guides for Exact Fees <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
