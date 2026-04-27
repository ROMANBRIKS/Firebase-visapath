
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Globe, 
  ShoppingCart, 
  Library, 
  Headphones, 
  ClipboardCheck, 
  Calculator, 
  Bell, 
  Sparkles, 
  HelpCircle, 
  Search,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export function MemberSubNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "carts", "default", "cartItems");
  }, [db, user]);

  const { data: cartItems } = useCollection(cartQuery);

  // If no user, we don't show the member subnav unless on public catalog pages
  // But generally, this subnav is for signed-in members.
  if (!user && pathname !== '/guides' && pathname !== '/support' && pathname !== '/match') {
    return null;
  }

  const subLinks = [
    { name: "Dash", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Catalog", href: "/guides", icon: <Search className="w-4 h-4" /> },
    { name: "AI Matcher", href: "/match", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Checklist", href: "/checklist", icon: <ClipboardCheck className="w-4 h-4" /> },
    { name: "Budget", href: "/budget", icon: <Calculator className="w-4 h-4" /> },
    { name: "Simulator", href: "/simulator", icon: <Headphones className="w-4 h-4" /> },
    { name: "Alerts", href: "/alerts", icon: <Bell className="w-4 h-4" /> },
    { name: "My Library", href: "/library", icon: <Library className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b sticky top-20 z-40 px-6 py-2.5 hidden md:block transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">
        {subLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "text-xs font-bold transition-all flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary/5",
              pathname === link.href 
                ? "text-primary bg-primary/10 shadow-sm" 
                : "text-slate-500 hover:text-primary"
            )}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
        <div className="h-5 w-px bg-slate-200 mx-1" />
        <Link
          href="/cart"
          className={cn(
            "text-xs font-bold transition-all flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary/5 relative",
            pathname === "/cart" 
              ? "text-primary bg-primary/10" 
              : "text-slate-500 hover:text-primary"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartItems && cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {cartItems.length}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
