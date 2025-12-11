import { Business } from "@/lib/useBusinessApi";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";
import { ChevronRight, MapPin, Store } from "lucide-react";

type PropsBusinessCard = {
  business: Business;
};

export default function BusinessCard({ business }: PropsBusinessCard) {
  const router = useRouter();

  function handleClick(businessId: string) {
    router.push(`business/${businessId}`);
  }

  return (
    <Card
      onClick={() => handleClick(business.id)}
      className="w-full cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="flex flex-row items-center gap-4 p-5">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Store className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
            {business.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{business.address}</span>
          </CardDescription>
        </div>

        <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
          <ChevronRight className="h-5 w-5" />
        </div>
      </CardHeader>
    </Card>
  );
}
