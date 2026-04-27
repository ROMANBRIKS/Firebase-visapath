
'use client';

import { Navbar } from "@/components/Navbar";
import { MemberSubNav } from "@/components/MemberSubNav";
import { GuideCard } from "@/components/GuideCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, Globe, Star, TrendingUp, Sparkles, MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Guide } from "@/types/guide";
import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const guidesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "visaGuides"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: guides, isLoading } = useCollection<Guide>(guidesQuery);

  // Filter guides based on search term and category
  const filteredGuides = useMemo(() => {
    if (!guides) return [];
    let result = guides;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => 
        g.title.toLowerCase().includes(term) || 
        g.country.toLowerCase().includes(term) || 
        g.visaType.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter(g => g.category === selectedCategory);
    }

    return result;
  }, [guides, searchTerm, selectedCategory]);

  // Identify Top Countries and their Visa Types
  const topCountryInfo = useMemo(() => {
    const popularNames = ["United States", "United Kingdom", "Schengen Area", "Canada", "Indonesia"];
    return popularNames.map(name => {
      const countryGuides = guides?.filter(g => g.country.includes(name)) || [];
      const types = Array.from(new Set(countryGuides.map(g => g.visaType)));
      return { name, count: countryGuides.length, types };
    }).filter(c => c.count > 0);
  }, [guides]);

  // Group filtered guides by country for the main list
  const groupedGuides = useMemo(() => {
    return filteredGuides.reduce((acc, guide) => {
      const country = guide.country || 'International';
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(guide);
      return acc;
    }, {} as Record<string, Guide[]>);
  }, [filteredGuides]);

  const countries = Object.keys(groupedGuides).sort();

  const categories = ["All", "Tourism", "Work", "Study", "Nomad", "Business"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {user && <MemberSubNav />}
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Visa Guide Catalog</h1>
              <p className="text-muted-foreground">Expert resources for every destination and travel purpose.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge 
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={cn(
                    "px-4 py-1 text-sm cursor-pointer transition-all",
                    selectedCategory === cat ? "shadow-md" : "bg-white hover:bg-primary/5"
                  )}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border mb-12 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search by country, visa type or purpose..." 
                className="pl-12 h-14 border-none bg-background focus-visible:ring-2 rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="lg" className="gap-2 h-14 rounded-2xl px-8 font-bold border-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-12">
              {[1, 2].map((group) => (
                <div key={group} className="space-y-6">
                  <Skeleton className="h-10 w-48 rounded-xl" />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-[32px]" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : countries.length > 0 ? (
            <div className="space-y-20">
              {/* Popular Destinations Summary */}
              {!searchTerm && selectedCategory === "All" && topCountryInfo.length > 0 && (
                <section className="mb-20">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-accent/10 p-2 rounded-xl">
                      <Star className="w-5 h-5 text-accent fill-accent" />
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-primary">Popular Destinations</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topCountryInfo.map((info) => (
                      <div key={info.name} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/5 p-2 rounded-lg">
                              <Globe className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-headline font-bold text-lg">{info.name}</h3>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                            {info.count} Guides
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Visa Types Offered:</p>
                          <div className="flex flex-wrap gap-2">
                            {info.types.map((type) => (
                              <Badge key={type} variant="outline" className="text-[11px] font-medium py-0 px-2 border-primary/20 bg-primary/5">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full mt-6 justify-between group-hover:bg-primary group-hover:text-white transition-colors"
                          onClick={() => setSearchTerm(info.name)}
                        >
                          Browse {info.name} <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-headline font-bold text-primary">Full Catalog</h2>
              </div>
              {countries.map((country) => (
                <section key={country} className="space-y-8">
                  <div className="flex items-center gap-3 border-b pb-6">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-headline font-bold text-primary">{country}</h2>
                      <p className="text-sm text-muted-foreground">Expert guides for {country} travel.</p>
                    </div>
                    <Badge variant="outline" className="ml-auto font-bold border-2">
                      {groupedGuides[country].length} Resources
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {groupedGuides[country].map((guide) => (
                      <GuideCard key={guide.id} guide={guide} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-24 border border-dashed text-center space-y-8 shadow-inner bg-muted/5">
              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <Globe className="w-12 h-12 text-primary opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-headline font-bold text-primary">No results found</h3>
                  <p className="text-muted-foreground text-lg">
                    {searchTerm 
                      ? `We couldn't find any visa guides matching "${searchTerm}". Try adjusting your search or category.` 
                      : "The database is currently empty. Please populate it from the dashboard."}
                  </p>
                </div>
                {!searchTerm && (
                  <Link href="/dashboard" className="inline-block">
                    <Button size="lg" className="font-bold h-14 px-10 gap-3 shadow-xl shadow-primary/20">
                      <Sparkles className="w-5 h-5" /> Seed Database
                    </Button>
                  </Link>
                )}
                {searchTerm && (
                  <Button variant="outline" size="lg" className="font-bold h-14 px-10" onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}>
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
