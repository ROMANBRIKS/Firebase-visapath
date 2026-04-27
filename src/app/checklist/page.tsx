
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { generatePersonalizedChecklist, GeneratePersonalizedChecklistOutput } from "@/ai/flows/generate-personalized-checklist";
import { Sparkles, Loader2, ClipboardCheck, FileText, Info, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function ChecklistPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState<GeneratePersonalizedChecklistOutput | null>(null);
  const { toast } = useToast();

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const input = {
      visaType: formData.get("visaType") as string,
      country: formData.get("country") as string,
      userProfile: {
        nationality: formData.get("nationality") as string,
        education: formData.get("education") as string,
        experience: formData.get("experience") as string,
        currentSalary: formData.get("salary") as string,
      }
    };

    if (!input.visaType || !input.country || !input.userProfile.nationality) {
      toast({ title: "Setup Incomplete", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generatePersonalizedChecklist(input);
      setChecklist(result);
      toast({ title: "Checklist Ready" });
    } catch (error) {
      toast({ title: "Assistant Busy", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <MemberSubNav />
      <main className="flex-1 pb-20 px-6 pt-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">Personalized Checklist</h1>
            <p className="text-lg text-muted-foreground">
              Input your specific professional profile to generate a tailored document roadmap for your target visa.
            </p>
          </div>

          {!checklist ? (
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="bg-primary p-12 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ClipboardCheck className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-2">
                  <h2 className="text-2xl font-headline font-bold">Document Strategy Analysis</h2>
                  <p className="text-white/80">AI auditing of your profile against 2024/2025 regulations.</p>
                </div>
              </div>
              <CardContent className="p-12">
                <form onSubmit={handleGenerate} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="font-bold">Target Visa Type</Label>
                    <Input name="visaType" placeholder="e.g. Skilled Worker" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Destination Country</Label>
                    <Input name="country" placeholder="e.g. Germany" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Your Nationality</Label>
                    <Input name="nationality" placeholder="e.g. Indian" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Highest Education</Label>
                    <Input name="education" placeholder="e.g. Master's in CS" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Years of Experience</Label>
                    <Input name="experience" placeholder="e.g. 5 years" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Approximate Salary</Label>
                    <Input name="salary" placeholder="e.g. €50,000" className="h-12 rounded-xl" />
                  </div>
                  <div className="md:col-span-2 pt-6">
                    <Button type="submit" disabled={isLoading} className="w-full h-16 text-xl font-bold rounded-2xl gap-3 shadow-xl shadow-primary/20">
                      {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-6 h-6" />}
                      {isLoading ? "Running AI Audit..." : "Generate My Custom Checklist"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] border shadow-sm">
                <div className="space-y-1">
                  <h2 className="text-2xl font-headline font-bold text-primary">{checklist.title}</h2>
                  <p className="text-muted-foreground">{checklist.summary}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl gap-2 font-bold" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" /> Print
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2 font-bold" onClick={() => setChecklist(null)}>
                    New Audit
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {Array.from(new Set(checklist.items.map(i => i.category))).map((cat) => (
                  <Card key={cat} className="rounded-[32px] border shadow-md overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="text-lg font-headline font-bold flex items-center gap-2 text-primary">
                        <FileText className="w-5 h-5" />
                        {cat}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {checklist.items.filter(i => i.category === cat).map((item, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <Checkbox id={`item-${cat}-${idx}`} className="mt-1 h-5 w-5 rounded-md border-2" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`item-${cat}-${idx}`} className="font-bold text-sm leading-none cursor-pointer group-hover:text-primary transition-colors">
                                {item.name}
                              </label>
                              <Badge variant={item.status === 'Required' ? 'default' : 'secondary'} className="text-[10px] py-0 px-1.5 h-4">
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-accent/5 p-8 rounded-[40px] border-2 border-dashed border-accent/20 text-center space-y-4">
                <Info className="w-8 h-8 text-accent mx-auto" />
                <h3 className="text-xl font-headline font-bold text-primary">Need technical help with these documents?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our expert guides provide exact templates and form walkthroughs for every document listed above.
                </p>
                <Button className="rounded-xl font-bold bg-accent text-white" onClick={() => window.location.href = '/guides'}>
                  Browse Technical Guides
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
