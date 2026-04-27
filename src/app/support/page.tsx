
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, MessageSquare, LifeBuoy, HelpCircle, FileText, ShieldCheck, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export default function SupportPage() {
  const { toast } = useToast();
  const { user } = useUser();

  const faqs = [
    {
      question: "How do I access my purchased guides?",
      answer: "You can access your guides immediately after purchase via the 'My Library' section in your member dashboard. Each purchase grants lifetime access and automatic policy updates."
    },
    {
      question: "Are the visa requirements up to date?",
      answer: "Yes! Our AI-powered research lab monitors official government sources and consular updates daily. We strive to update our guides within 48 hours of any major regulatory changes for 2024 and 2025."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a 14-day, no-questions-asked money-back guarantee. If a technical roadmap doesn't provide the level of strategic detail you expected, simply contact our support team."
    },
    {
      question: "Can I suggest a new country or visa guide?",
      answer: "Absolutely! We prioritize our research based on user demand. Use the AI Matcher or contact form below to suggest a destination, and we'll notify you when it's added."
    },
    {
      question: "Is VisaPath affiliated with any government?",
      answer: "No. VisaPath Guides is an independent professional resource. We are not a government agency or a visa processing service. Our guides are for strategic preparation and educational purposes."
    }
  ];

  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Our support team will get back to you within 24 hours.",
    });
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {user && <MemberSubNav />}
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">How can we help?</h1>
            <p className="text-lg text-muted-foreground">
              Search our help center or reach out to our team of visa experts.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* FAQs Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-headline font-bold">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-b last:border-0">
                      <AccordionTrigger className="text-left font-bold hover:text-primary py-6">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="border-none bg-primary text-white shadow-xl rounded-3xl">
                  <CardHeader>
                    <MessageSquare className="w-8 h-8 mb-2" />
                    <CardTitle className="font-headline">Live Chat</CardTitle>
                    <CardDescription className="text-white/70">Typical response time: 5 mins</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary" className="w-full font-bold">Start Chat</Button>
                  </CardContent>
                </Card>
                <Card className="border-none bg-accent text-white shadow-xl rounded-3xl">
                  <CardHeader>
                    <LifeBuoy className="w-8 h-8 mb-2" />
                    <CardTitle className="font-headline">Knowledge Base</CardTitle>
                    <CardDescription className="text-white/70">Read technical documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary" className="w-full font-bold">Browse Docs</Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-3xl border shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <CardTitle className="font-headline">Email Us</CardTitle>
                  </div>
                  <CardDescription>
                    Fill out the form below and we'll respond as quickly as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Question about US B1 Visa" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="How can we help you today?" className="min-h-[120px]" required />
                    </div>
                    <Button type="submit" className="w-full font-bold h-12 gap-2">
                      <Send className="w-4 h-4" /> Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="bg-accent/5 rounded-3xl p-6 border border-accent/20 flex items-start gap-4">
                <ShieldCheck className="w-10 h-10 text-accent shrink-0" />
                <div>
                  <h4 className="font-bold text-accent mb-1">Expert Support</h4>
                  <p className="text-xs text-accent/80 leading-relaxed">
                    Our support agents are former travel consultants and visa specialists, not just call center operators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
