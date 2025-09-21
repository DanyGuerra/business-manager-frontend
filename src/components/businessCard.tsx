import { Business } from "@/lib/useBusinessApi";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";

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
      className="w-full cursor-pointer hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
    >
      <CardHeader>
        <CardTitle>{business.name}</CardTitle>
        <CardDescription>{business.address}</CardDescription>
      </CardHeader>
    </Card>
  );
}
