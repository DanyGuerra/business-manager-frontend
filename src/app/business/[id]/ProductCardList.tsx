"use client";

import { Product } from "@/lib/useBusinessApi";
import CustomDialog from "@/components/customDialog";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { toast } from "sonner";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import ProductListItem from "./ProductListItem";


type ProductCardListProps = {
    products: Product[];
    productGroupId: string;
};

export default function ProductCardList({ products, productGroupId }: ProductCardListProps) {
    const productApi = useProductApi();
    const { startLoading, stopLoading } = useLoadingStore();
    const { businessId } = useBusinessStore();
    const { getBusiness } = useFetchBusiness();

    async function handleCreateProduct(
        data: ProductValues,
        businessId: string,
        productGroupId: string
    ) {
        try {
            startLoading(LoadingsKeyEnum.CREATE_PRODUCT);
            const priceNumber = Number(data.base_price);
            const dataFormatted: CreateProductDto = {
                ...data,
                description: data.description ?? "",
                base_price: priceNumber,
                group_product_id: productGroupId,
            };

            await productApi.createProduct([dataFormatted], businessId);
            await getBusiness(businessId);
            toast.success("Producto creado", { style: toastSuccessStyle });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
        }
    }

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
                    <h3 className="text-lg font-medium">No hay productos</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Este menú aún no tiene productos agregados.
                    </p>

                    <CustomDialog
                        modalTitle="Agregar producto"
                        modalDescription="Agrega un producto para tu menú"
                        textButtonTrigger="Agregar producto"
                    >
                        <FormProduct
                            buttonTitle="Guardar"
                            loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                            handleSubmitButton={(data) =>
                                handleCreateProduct(data, businessId, productGroupId)
                            }
                        />
                    </CustomDialog>
                </div>
            )}
        </>
    );
}
