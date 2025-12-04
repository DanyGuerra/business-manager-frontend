"use client";

import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { useBusinessStore } from "@/store/businessStore";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import ProductCardList from "../../ProductCardList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function MenuPage() {
    const params = useParams();
    const businessId = params.id as string;
    const menuId = params.menuId as string;

    const { business } = useBusinessStore();
    const { getBusiness } = useFetchBusiness();

    useEffect(() => {
        if (!business) {
            getBusiness(businessId);
        }
    }, [business, businessId, getBusiness]);

    const currentMenu = useMemo(() => {
        return business?.product_group.find((group) => group.id === menuId);
    }, [business, menuId]);

    if (!business) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentMenu) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-xl font-semibold">Menú no encontrado</h2>
                <Button asChild variant="outline">
                    <Link href={`/business/${businessId}/menus`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al inicio
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href={`/business/${businessId}/menus`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{currentMenu.name}</h1>
                    {currentMenu.description && (
                        <p className="text-muted-foreground">{currentMenu.description}</p>
                    )}
                </div>
            </div>

            <Separator />

            <ProductCardList
                products={currentMenu.products}
                productGroupId={currentMenu.id}
            />
        </div>
    );
}
