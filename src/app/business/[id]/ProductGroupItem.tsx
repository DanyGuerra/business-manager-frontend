"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ProductGroup, Product } from "@/lib/useBusinessApi";
import Link from "next/link";

import CustomDialog from "@/components/customDialog";
import ProductCardList from "./ProductCardList";

import { Edit2Icon, PlusIcon, ArrowUpRight } from "lucide-react";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import FormProductGroup, {
    ProductGroupValues,
} from "@/components/FormProductGroup";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import { handleApiError } from "@/utils/handleApiError";
import { useCartStore } from "@/store/cartStore";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

type ProductGroupItemProps = {
    group: ProductGroup;
    businessId: string;
    isEditMode: boolean;
    onRefresh: () => void;
};


export default function ProductGroupItem({
    group: initialGroup,
    businessId,
    isEditMode,
    onRefresh,
}: ProductGroupItemProps) {
    const [group, setGroup] = useState<ProductGroup>(initialGroup);
    const apiProductGroup = useProductGroupApi();
    const apiProduct = useProductApi();
    const { stopLoading, startLoading } = useLoadingStore();

    const { addToCart } = useCartStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

    const fetchGroup = useCallback(async () => {
        try {
            const { data } = await apiProductGroup.getProductGroup(group.id, businessId);
            setGroup(data);
        } catch (error) {
            handleApiError(error);
        }
    }, [group.id, businessId, apiProductGroup]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await apiProduct.getProductsByProductGroupId(businessId, {
                product_group_id: group.id
            });
            setProducts(data);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }, [businessId, group.id, apiProduct]);

    useEffect(() => {
        fetchGroup();
        fetchProducts();
    }, [fetchGroup, fetchProducts]);

    async function handleDeleteProductGroup() {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
            const { message } = await apiProductGroup.deleteProductGroup(
                group.id,
                businessId
            );
            toast.success(message, { style: toastSuccessStyle });
            onRefresh();
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
        }
    }

    async function handleUpdateProductGroup(data: ProductGroupValues) {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
            await apiProductGroup.updateProductGroup(
                group.id,
                businessId,
                data
            );

            toast.success("Menú actualizado correctamente", {
                style: toastSuccessStyle,
            });
            fetchGroup();
            onRefresh();
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT_GROUP);
        }
    }

    async function handleCreateProduct(data: ProductValues) {
        try {
            startLoading(LoadingsKeyEnum.CREATE_PRODUCT);
            const priceNumber = Number(data.base_price);
            const dataFormatted: CreateProductDto = {
                ...data,
                description: data.description ?? "",
                base_price: priceNumber,
                group_product_id: group.id,
            };

            await apiProduct.createProduct([dataFormatted], businessId);
            toast.success("Producto creado", { style: toastSuccessStyle });
            fetchProducts();
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsCreateProductOpen(false);
            stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
        }
    }

    return (
        <Card
            className={cn(
                "group overflow-hidden transition-all hover:shadow-md border-muted bg-muted flex flex-col h-full",
                isEditMode &&
                "border-2 border-dashed border-primary/50 hover:border-primary/90"
            )}
        >
            <CardHeader className="bg-muted/20">
                <div className="flex items-start justify-between gap-1">
                    <Link
                        href={`/business/${businessId}/menus/${group.id}`}
                        className="group/link flex flex-col items-center gap-2 transition-colors hover:text-primary w-fit"
                    >
                        <div className="flex items-center align-start gap-2">
                            <CardTitle className="text-lg font-bold">{group.name}</CardTitle>
                            <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0" />
                        </div>
                        {group.description && (
                            <CardDescription className="text-sm line-clamp-2">
                                {group.description}
                            </CardDescription>
                        )}
                    </Link>
                    {isEditMode && (
                        <div className="flex items-center gap-1 shrink-0 transition-opacity duration-200  ">
                            <CustomDialog
                                modalTitle="Editar menú"
                                modalDescription="Edita el menú de productos"
                                icon={<Edit2Icon className="h-4 w-4" />}
                            >
                                <FormProductGroup
                                    buttonTitle="Guardar"
                                    loadingKey={LoadingsKeyEnum.UPDATE_PRODUCT_GROUP}
                                    handleSubmitButton={handleUpdateProductGroup}
                                    defaultValues={{
                                        ...group,
                                        description: group.description ?? "",
                                    }}
                                />
                            </CustomDialog>
                            <DeleteDialogConfirmation
                                handleContinue={handleDeleteProductGroup}
                                description="Esta acción no podrá ser revertida y eliminará completamente el menú seleccionado"
                            />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Productos
                        </h3>
                        <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                            {products.length || 0}
                        </span>
                    </div>
                    {isEditMode && (
                        <CustomDialog
                            open={isCreateProductOpen}
                            setOpen={setIsCreateProductOpen}
                            modalTitle="Agregar producto"
                            modalDescription="Agrega un producto para tu menú"
                            icon={<PlusIcon />}
                        >
                            <FormProduct
                                buttonTitle="Guardar"
                                loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                                handleSubmitButton={handleCreateProduct}
                            ></FormProduct>
                        </CustomDialog>
                    )}
                </div>
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <ProductCardList
                            products={products}
                            onRefresh={fetchProducts}
                            onAddToCart={(product, options, quantity) => addToCart(businessId, product, options, quantity)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
