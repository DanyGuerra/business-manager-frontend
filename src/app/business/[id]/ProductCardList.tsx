"use client";

import { Product } from "@/lib/useBusinessApi";
import ProductListItem from "./ProductListItem";


type ProductCardListProps = {
    products: Product[];
    productGroupId: string;
};

export default function ProductCardList({ products }: ProductCardListProps) {



    return (
        <>
            {products.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <ProductListItem key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                    <h3 className="text-lg font-medium">No se encontraron productos</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Prueba ajustando los filtros o tu búsqueda para encontrar lo que necesitas.
                    </p>
                </div>
            )}
        </>
    );
}
