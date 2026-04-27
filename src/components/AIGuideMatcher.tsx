
"use client";

import { useState } from "react";
import { aiMatchedVisaGuideRecommendation } from "@/ai/flows/ai-matched-visa-guide-recommendation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, MapPin, Plane, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function AIGuideMatcher() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input = {
      originCountry: formData.get("origin") as string,
      destinationCountry: formData.get("destination") as string,
      travelIntent: formData.get("intent") as string,
    };

    if (!input.originCountry || !input.destinationCountry || !input.travelIntent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to get your personalized recommendations.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await aiMatchedVisaGuideRecommendation(input);
      setResults(response.recommendedGuides || []);
      if (response.recommendedGuides.length === 0) {
        toast({
          title: "No Exact Matches",
          description: "We couldn't find a specific guide, but we've provided general advice.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch recommendations. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleViewInCatalog(country: string) {
    router.push(`/guides?search=${encodeURIComponent(country)}`);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="border-none shadow-2xl bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 fill-white" />
            <h2 className="text-2xl font-headline font-bold">AI Visa Matcher</h2>
          </div>
          <p className="text-white/80 max-w-2xl">
            Tell us your situation and our AI will recommend the exact guides you need to succeed.
          </p>
        </div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="origin" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Origin Country
              </Label>
              <Input id="origin" name="origin" placeholder="e.g. India" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary" />
                Destination
              </Label>
              <Input id="destination" name="destination" placeholder="e.g. USA" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intent" className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Travel Purpose
              </Label>
              <Input id="intent" name="intent" placeholder="e.g. Tourism, Study" className="bg-background" />
            </div>
            <div className="md:col-span-3 pt-4">
              <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? "Analyzing Requirements..." : "Find My Guide"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2 text-primary px-4">
            <CheckCircle2 className="text-emerald-500" />
            Your Personalized Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {results.map((rec, idx) => (
              <Card key={idx} className="border-l-4 border-l-accent bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">{rec.title}</CardTitle>
                  <CardDescription className="text-accent font-medium">Visa Type: {rec.visaType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec.reasonForRecommendation}
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 mt-4 text-primary font-bold"
                    onClick={() => handleViewInCatalog(rec.visaType)}
                  >
                    Browse Catalog & Purchase &rarr;
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
