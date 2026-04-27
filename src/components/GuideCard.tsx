
import { Guide } from "@/types/guide";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Card className="overflow-hidden group flex flex-col h-full hover:shadow-xl transition-all duration-300 border-none bg-white">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={guide.imageUrl}
          alt={guide.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/90 text-primary hover:bg-white border-none shadow-sm">
            {guide.category}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
          <MapPin className="w-3 h-3 text-accent" />
          {guide.country}
        </div>
        <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-primary transition-colors">
          {guide.title}
        </h3>
      </CardHeader>
      <CardContent className="p-5 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {guide.shortDescription}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          Expert Verified
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
        <div className="text-xl font-bold text-primary">
          ${guide.price}
        </div>
        <Link href={`/guides/${guide.id}`}>
          <Button variant="secondary" size="sm" className="gap-2 group/btn">
            View Details
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
