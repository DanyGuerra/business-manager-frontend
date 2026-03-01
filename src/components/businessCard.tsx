import { Business } from "@/lib/useBusinessApi";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";
import { ChevronRight, MapPin, Store, Phone, ShieldCheck } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { Badge } from "./ui/badge";

type PropsBusinessCard = {
  business: Business;
};

export default function BusinessCard({ business }: PropsBusinessCard) {
  const router = useRouter();
  const { user } = useUser();

  const isOwner = user?.id === business.owner_id;

  function handleClick(businessId: string) {
    router.push(`business/${businessId}`);
  }

  return (
    <Card
      onClick={() => handleClick(business.id)}
      className="w-full cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 group relative overflow-hidden active:scale-[0.98]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {isOwner && (
        <Badge variant="secondary" className="absolute top-3 right-3 z-10 gap-1 px-1.5 py-0 text-[10px] sm:text-xs">
          <ShieldCheck className="h-3 w-3" />
          <span>Mi negocio</span>
        </Badge>
      )}
      <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 p-4 sm:p-5">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <CardTitle className="text-base sm:text-lg font-bold truncate group-hover:text-primary transition-colors pr-16">
            {business.name}
          </CardTitle>
          <CardDescription className="flex flex-col gap-1 text-xs sm:text-sm mt-1">
            {(business.phone) && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{business.phone}</span>
              </div>
            )}

            {(business.address || business.street || business.city) && (
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {[
                    business.street,
                    business.neighborhood,
                    business.city && business.state ? `${business.city}, ${business.state}` : business.city || business.state,
                    business.zipCode,
                    business.address
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </CardDescription>
        </div>

        <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground sm:opacity-0 sm:translate-x-2 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <ChevronRight className="h-5 w-5" />
        </div>
      </CardHeader>
    </Card>
  );
}
