
'use client';

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, CreditCard, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Guide } from "@/types/guide";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "carts", "default", "cartItems");
  }, [db, user]);

  const { data: cartItems, isLoading } = useCollection<Guide>(cartQuery);

  const subtotal = cartItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

  function handleRemove(guideId: string) {
    if (!db || !user) return;
    const itemRef = doc(db, "users", user.uid, "carts", "default", "cartItems", guideId);
    deleteDocumentNonBlocking(itemRef);
    toast({
      title: "Item Removed",
      description: "The guide has been removed from your cart.",
    });
  }

  async function handleCheckout() {
    if (!db || !user || !cartItems || cartItems.length === 0) return;

    setIsCheckingOut(true);
    const batch = writeBatch(db);

    // 1. Move items to orders
    cartItems.forEach((item) => {
      const orderRef = doc(db, "users", user.uid, "orders", "all", "lineItems", item.id);
      batch.set(orderRef, {
        ...item,
        purchasedAt: serverTimestamp(),
      });

      // 2. Remove from cart
      const cartRef = doc(db, "users", user.uid, "carts", "default", "cartItems", item.id);
      batch.delete(cartRef);
    });

    try {
      await batch.commit();
      toast({
        title: "Purchase Successful!",
        description: "Your expert roadmaps are now available in your library.",
      });
      router.push("/library");
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "An error occurred during payment simulation.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-headline font-bold text-primary">Your Cart</h1>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <ShieldCheck className="w-4 h-4" /> Secure Session
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
              <p className="text-muted-foreground animate-pulse font-medium">Checking your shopping bag...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                {cartItems && cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-[32px] p-6 border flex gap-6 items-center shadow-sm hover:shadow-md transition-shadow group">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                          <span className="bg-muted px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{item.category}</span>
                          {item.country} • {item.visaType}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-headline font-bold text-2xl text-primary">${item.price}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemove(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/5 gap-2 font-bold"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-[40px] p-24 border border-dashed text-center space-y-8 shadow-inner bg-muted/5">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-headline font-bold text-primary">Your cart is empty</p>
                      <p className="text-muted-foreground">Select an expert guide to start your journey.</p>
                    </div>
                    <Link href="/guides">
                      <Button className="font-bold h-12 px-10 rounded-2xl shadow-lg">Browse Catalog</Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[40px] p-8 border shadow-2xl space-y-8 sticky top-32">
                  <h3 className="font-headline font-bold text-2xl">Order Summary</h3>
                  <div className="space-y-4 border-b pb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Subtotal ({cartItems?.length || 0} items)</span>
                      <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Tax</span>
                      <span className="font-bold text-lg text-emerald-600">$0.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-xl">Total</span>
                    <span className="font-headline font-bold text-3xl text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Button 
                      disabled={!cartItems || cartItems.length === 0 || isCheckingOut} 
                      onClick={handleCheckout}
                      className="w-full h-16 text-lg font-bold gap-3 rounded-2xl shadow-xl shadow-primary/20"
                    >
                      {isCheckingOut ? <Loader2 className="animate-spin" /> : <CreditCard className="w-5 h-5" />}
                      {isCheckingOut ? "Processing Payment..." : "Checkout Securely"}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest px-4">
                      By checking out, you get instant lifetime access to your technical roadmaps.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Money-back Guarantee
                    </div>
                    <div className="flex items-center gap-6 opacity-30 grayscale">
                      <Image src="https://picsum.photos/seed/visa/100/40" alt="Visa" width={40} height={20} />
                      <Image src="https://picsum.photos/seed/mastercard/100/40" alt="Mastercard" width={40} height={20} />
                      <Image src="https://picsum.photos/seed/stripe/100/40" alt="Stripe" width={40} height={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
