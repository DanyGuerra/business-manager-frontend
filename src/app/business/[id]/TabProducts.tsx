"use client";

import { useEffect, useState } from "react";
import { useProductApi } from "@/lib/useProductApi";
import { Product } from "@/lib/useBusinessApi";
import ProductCardList from "@/app/business/[id]/ProductCardList";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/utils/handleApiError";

type BusinessProductsListProps = {
    businessId: string;
};

export default function TabProducts({
    businessId,
}: BusinessProductsListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const productApi = useProductApi();


    async function getProducts() {
        try {
            setLoading(true);
            const { data } = await productApi.getProductsByBusinessId(businessId);
            setProducts(data);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        if (businessId) {
            getProducts();
        }
    }, [businessId]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                <h3 className="text-lg font-medium">No hay productos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Este negocio aún no tiene productos agregados.
                </p>
            </div>
        );
    }

    return <ProductCardList products={products} productGroupId="" />;
}
