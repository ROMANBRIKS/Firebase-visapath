
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { simulateInterview, InterviewSimulatorOutput } from "@/ai/flows/visa-interview-simulator";
import { generateAudioGuide } from "@/ai/flows/generate-audio-guide";
import { Sparkles, Loader2, MessageSquare, Send, RefreshCcw, Award, CheckCircle2, Headphones, Volume2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Message = { role: 'officer' | 'applicant'; text: string };

export default function SimulatorPage() {
  const [step, setStep] = useState<'setup' | 'chat' | 'results'>('setup');
  const [visaType, setVisaType] = useState("");
  const [destination, setDestination] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<InterviewSimulatorOutput | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  async function handleStart() {
    if (!visaType || !destination) {
      toast({ title: "Incomplete Setup", variant: "destructive" });
      return;
    }
    setStep('chat');
    await getNextQuestion([]);
  }

  async function getNextQuestion(currentHistory: Message[]) {
    setIsLoading(true);
    try {
      const response = await simulateInterview({ visaType, destination, history: currentHistory });
      
      if (response.nextQuestion) {
        const newMessage: Message = { role: 'officer', text: response.nextQuestion };
        setHistory([...currentHistory, newMessage]);
        narrateText(response.nextQuestion);
      }

      if (response.isEnded) {
        setResults(response);
        setStep('results');
      }
    } catch (error) {
      toast({ title: "Officer Busy", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    if (!userInput.trim() || isLoading) return;
    const newHistory: Message[] = [...history, { role: 'applicant', text: userInput }];
    setHistory(newHistory);
    setUserInput("");
    await getNextQuestion(newHistory);
  }

  async function narrateText(text: string) {
    try {
      const { audioUri } = await generateAudioGuide({ text });
      if (audioRef.current) {
        audioRef.current.src = audioUri;
        audioRef.current.play();
      }
    } catch (e) {
      console.warn("TTS failed");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <MemberSubNav />
      <audio ref={audioRef} className="hidden" />
      
      <main className="flex-1 pb-20 px-6 pt-12">
        <div className="max-w-4xl mx-auto">
          {step === 'setup' && (
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="bg-primary p-12 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Headphones className="w-32 h-32" /></div>
                <div className="relative z-10 space-y-4">
                  <h1 className="text-4xl font-headline font-bold">Interview Simulator</h1>
                  <p className="text-white/80 text-lg">Practice with our AI Consular Officer to build confidence.</p>
                </div>
              </div>
              <CardContent className="p-12 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="font-bold">Visa Type</Label>
                    <Select onValueChange={setVisaType}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Skilled Worker">Skilled Worker</SelectItem>
                        <SelectItem value="Student Visa">Student Visa</SelectItem>
                        <SelectItem value="Visitor Visa">Visitor Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Destination</Label>
                    <Input placeholder="e.g. USA" className="h-12 rounded-xl" value={destination} onChange={(e) => setDestination(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleStart} size="lg" className="w-full h-16 text-xl font-bold rounded-2xl gap-3 shadow-xl shadow-primary/20">
                  <Sparkles className="w-6 h-6" /> Start Simulation
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'chat' && (
            <div className="flex flex-col h-[70vh] gap-6">
              <div className="flex-1 bg-white rounded-[40px] border shadow-xl p-8 overflow-y-auto space-y-6">
                {history.map((msg, idx) => (
                  <div key={idx} className={cn("flex gap-4 max-w-[80%]", msg.role === 'applicant' ? "ml-auto flex-row-reverse" : "")}>
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", msg.role === 'officer' ? "bg-primary text-white" : "bg-accent text-white")}>
                      {msg.role === 'officer' ? <Volume2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                    </div>
                    <div className={cn("p-5 rounded-3xl text-sm leading-relaxed", msg.role === 'officer' ? "bg-muted/50 rounded-tl-none" : "bg-accent/10 text-accent font-medium rounded-tr-none")}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-[32px] border p-4 shadow-2xl flex gap-4">
                <Input placeholder="Respond to the officer..." className="h-14 border-none bg-transparent focus-visible:ring-0" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
                <Button onClick={handleSend} disabled={isLoading} className="h-14 px-8 rounded-2xl font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          )}

          {step === 'results' && results && (
            <Card className="border-none shadow-2xl overflow-hidden animate-in zoom-in duration-500">
              <div className="bg-accent p-12 text-white text-center space-y-6">
                <h1 className="text-4xl font-headline font-bold">Performance Audit</h1>
                <div className="text-6xl font-headline font-bold">{results.successScore}%</div>
                <Progress value={results.successScore} className="h-3 bg-white/20" />
              </div>
              <CardContent className="p-12 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xl font-headline font-bold flex items-center gap-2"><CheckCircle2 className="text-emerald-500" />Officer Feedback</h3>
                  <div className="bg-muted/30 p-8 rounded-3xl border italic">"{results.feedback}"</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => window.location.reload()} variant="outline" className="h-14 rounded-2xl font-bold border-2">Try Again</Button>
                  <Button onClick={() => window.location.href = '/guides'} className="h-14 rounded-2xl font-bold">Get Expert Guide</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
