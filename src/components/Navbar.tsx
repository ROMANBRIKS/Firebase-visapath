
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, User, Menu, X, Library, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 h-20 flex items-center",
        isScrolled ? "bg-white shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Globe className="text-white w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">
            VisaPath<span className="text-accent">Guides</span>
          </span>
        </Link>

        {/* Global Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/guides"
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary",
              pathname === "/guides" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Catalog
          </Link>
          <Link
            href="/support"
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary",
              pathname === "/support" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Support
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 rounded-xl border-2 font-bold shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
                Member Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20">
                <User className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-xl p-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            <Link href="/guides" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold p-2">Catalog</Link>
            <Link href="/match" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold p-2">AI Matcher</Link>
            <Link href="/library" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold p-2">My Library</Link>
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold p-2">Account</Link>
            <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold p-2">Support</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
