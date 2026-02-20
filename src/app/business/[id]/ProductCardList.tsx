"use client";

import { Product } from "@/lib/useBusinessApi";
import ProductListItem from "./ProductListItem";
import { Option } from "@/lib/useOptionGroupApi";
import { Ghost } from "lucide-react";


type ProductCardListProps = {
    products: Product[];
    onRefresh: () => void;
    className?: string;
    forceViewMode?: boolean;
    onAddToCart?: (product: Product, options: Option[], quantity: number) => void;
};

export default function ProductCardList({ products, onRefresh, className, forceViewMode = false, onAddToCart }: ProductCardListProps) {
    return (
        <>
            {products.length ? (
                <div className={className || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                    {products.map((product) => (
                        <ProductListItem
                            key={product.id}
                            product={product}
                            onRefresh={onRefresh}
                            forceViewMode={forceViewMode}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                    <div className="p-4 rounded-full bg-muted/30 mb-3">
                        <Ghost className="w-10 h-10 opacity-40 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No se encontraron productos</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Agrega productos a tu menú para que puedas verlos aquí o ajusta los filtros de búsqueda.
                    </p>
                </div>
            )}
        </>
    );
}
