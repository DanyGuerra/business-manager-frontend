"use client";

import { useEffect, useState } from "react";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import { Product } from "@/lib/useBusinessApi";
import ProductCardList from "@/app/business/[id]/ProductCardList";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/utils/handleApiError";
import { useEditModeStore } from "@/store/editModeStore";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";

type BusinessProductsListProps = {
    businessId: string;
};

export default function TabProducts({
    businessId,
}: BusinessProductsListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const productApi = useProductApi();
    const { isEditMode } = useEditModeStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { business } = useBusinessStore();
    const { getBusiness } = useFetchBusiness();

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
            await getBusiness(businessId); // Refresh business to update menus if needed
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

    return (
        <div className="flex flex-col gap-5">
            {products.length === 0 ? (
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
                <ProductCardList products={products} productGroupId="" />
            )}
        </div>
    );
}
