"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ProductCardList from "../../ProductCardList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { ProductGroup, Product } from "@/lib/useBusinessApi";
import { handleApiError } from "@/utils/handleApiError";
import { useProductApi } from "@/lib/useProductApi";
import { useCartStore } from "@/store/cartStore";

import { Option } from "@/lib/useOptionGroupApi";
import { toast } from "sonner";

export default function MenuPage() {
    const params = useParams();
    const businessId = params.id as string;
    const menuId = params.menuId as string;

    const [productGroup, setProductGroup] = useState<ProductGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const { getProductGroup } = useProductGroupApi();
    const { addToCart } = useCartStore();
    const productApi = useProductApi();

    const handleAddToCart = (product: Product, options: Option[], quantity: number) => {
        addToCart(businessId, product, options, quantity);
        toast.success("Producto agregado al carrito");
    };

    const fetchMenu = useCallback(async () => {
        if (!businessId || !menuId) return;

        try {
            setLoading(true);
            const [groupResponse, productsResponse] = await Promise.all([
                getProductGroup(menuId, businessId),
                productApi.getProductsByProductGroupId(businessId, {
                    product_group_id: menuId
                })
            ]);

            setProductGroup(groupResponse.data);
            setProducts(productsResponse.data);
        } catch (error) {
            handleApiError(error)
        } finally {
            setLoading(false);
        }
    }, [businessId, menuId, getProductGroup, productApi]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!productGroup) {
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
                    <h1 className="text-2xl font-bold tracking-tight">{productGroup.name}</h1>
                    {productGroup.description && (
                        <p className="text-muted-foreground">{productGroup.description}</p>
                    )}
                </div>
            </div>

            <Separator />

            <ProductCardList
                products={products}
                onRefresh={fetchMenu}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
}
