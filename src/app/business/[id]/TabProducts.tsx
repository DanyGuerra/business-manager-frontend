"use client";

import { useEffect, useState } from "react";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import { Product } from "@/lib/useBusinessApi";
import ProductCardList from "@/app/business/[id]/ProductCardList";
import { handleApiError } from "@/utils/handleApiError";
import ProductListSkeleton from "@/components/ProductListSkeleton";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { DataTableSearch } from "@/components/DataTableSearch";
import { DataTablePagination } from "@/components/DataTablePagination";

type BusinessProductsListProps = {
    businessId: string;
};

export default function TabProducts({
    businessId,
}: BusinessProductsListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const productApi = useProductApi();
    const { startLoading, stopLoading } = useLoadingStore();
    const { business } = useBusinessStore();
    const { getBusiness } = useFetchBusiness();

    async function getProducts() {
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
    }

    async function handleCreateProduct(data: ProductValues) {
        try {
            startLoading(LoadingsKeyEnum.CREATE_PRODUCT);
            const productDto: CreateProductDto = {
                ...data,
                base_price: Number(data.base_price),
                description: data.description ?? "",
                group_product_id: data.menuId ?? "",
            };

            await productApi.createProduct([productDto], businessId);
            await getProducts();
            await getBusiness(businessId);
            toast.success("Producto creado exitosamente", { style: toastSuccessStyle });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
        }
    }

    useEffect(() => {
        if (businessId) {
            getProducts();
        }
    }, [businessId, page, limit, search]);

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

                    <CustomDialog
                        modalTitle="Crear producto"
                        modalDescription="Agrega un nuevo producto a tu inventario"
                        textButtonTrigger="Crear primer producto"
                    >
                        <FormProduct
                            buttonTitle="Crear"
                            loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                            handleSubmitButton={handleCreateProduct}
                            menus={business?.product_group || []}
                        />
                    </CustomDialog>

                </div>
            ) : (
                <>
                    <ProductCardList products={products} productGroupId="" />

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
