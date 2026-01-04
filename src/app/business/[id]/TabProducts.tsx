"use client";

import { useEffect, useState, useCallback } from "react";
import { useProductApi } from "@/lib/useProductApi";
import { Product } from "@/lib/useBusinessApi";
import ProductCardList from "@/app/business/[id]/ProductCardList";
import { handleApiError } from "@/utils/handleApiError";
import ProductListSkeleton from "@/components/ProductListSkeleton";
import { DataTableSearch } from "@/components/DataTableSearch";
import { DataTablePagination } from "@/components/DataTablePagination";
import { useCartStore } from "@/store/cartStore";

type BusinessProductsListProps = {
    businessId: string;
    refreshTrigger?: number;
};

export default function TabProducts({
    businessId,
    refreshTrigger = 0,
}: BusinessProductsListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const productApi = useProductApi();
    const { addToCart } = useCartStore();

    const getProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await productApi.getProductsByBusinessId(businessId, { page, limit, search });
            setProducts(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }, [businessId, page, limit, search, productApi]);

    useEffect(() => {
        if (businessId) {
            getProducts();
        }
    }, [businessId, getProducts, refreshTrigger]);

    return (
        <div className="flex flex-col gap-5">
            <DataTableSearch
                onSearch={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                placeholder="Buscar productos..."
                initialValue={search}
            />

            {loading ? (
                <ProductListSkeleton />
            ) : products.length === 0 && page === 1 && !search ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                    <h3 className="text-lg font-medium">No hay productos</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Este negocio aún no tiene productos agregados.
                    </p>
                </div>
            ) : (
                <>
                    <ProductCardList
                        products={products}
                        onRefresh={getProducts}
                        onAddToCart={(product, options, quantity) => addToCart(businessId, product, options, quantity)}
                    />

                    <DataTablePagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        limit={limit}
                        onLimitChange={(val) => {
                            setLimit(val);
                            setPage(1);
                        }}
                        totalItems={totalItems}
                        currentCount={products.length}
                        itemName="productos"
                    />
                </>
            )}
        </div>
    );
}
