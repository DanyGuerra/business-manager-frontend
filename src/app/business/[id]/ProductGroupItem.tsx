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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

import { Edit2Icon, PlusIcon, ArrowUpRight, ChevronDown } from "lucide-react";
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
    const [isExpanded, setIsExpanded] = useState(true);

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
            <CardHeader className="bg-muted/30 px-5 py-4 border-b border-border/50">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={`/business/${businessId}/menus/${group.id}`}
                        className="group/link flex-1 flex flex-col justify-center gap-1 min-w-0 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-bold truncate group-hover/link:text-primary transition-colors">
                                {group.name}
                            </CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover/link:text-primary group-hover/link:opacity-100 group-hover/link:translate-x-0 shrink-0" />
                        </div>
                        {group.description && (
                            <CardDescription className="text-sm line-clamp-1 group-hover/link:text-muted-foreground/80 transition-colors">
                                {group.description}
                            </CardDescription>
                        )}
                    </Link>

                    {isEditMode && (
                        <div className="flex items-center gap-1.5 shrink-0">
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
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="flex flex-col h-full gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-widest flex items-center">
                                Productos
                            </h3>
                            <div className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs font-bold leading-none flex items-center justify-center border border-border/50 shadow-sm">
                                {products.length || 0}
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-8 px-3.5 gap-2 text-xs font-bold rounded-full border border-transparent hover:border-border transition-colors",
                                        isExpanded
                                            ? "bg-muted text-muted-foreground hover:bg-muted/80 shadow-sm"
                                            : "bg-primary/10 text-primary hover:bg-primary/20 shadow-sm"
                                    )}
                                >
                                    {isExpanded ? "Ocultar" : "Mostrar"}
                                    <ChevronDown className={cn("h-3.5 w-3.5", isExpanded ? "rotate-180" : "")} />
                                </Button>
                            </CollapsibleTrigger>
                            {isEditMode && (
                                <CustomDialog
                                    open={isCreateProductOpen}
                                    setOpen={setIsCreateProductOpen}
                                    modalTitle="Agregar producto"
                                    modalDescription="Agrega un producto para tu menú"
                                    trigger={
                                        <Button size="sm" className="h-8 gap-1.5 px-4 text-xs font-bold shadow-md rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:shadow-lg hover:-translate-y-0.5">
                                            <PlusIcon className="h-4 w-4" />
                                            <span>Nuevo Producto</span>
                                        </Button>
                                    }
                                >
                                    <FormProduct
                                        buttonTitle="Guardar"
                                        loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                                        handleSubmitButton={handleCreateProduct}
                                    ></FormProduct>
                                </CustomDialog>
                            )}
                        </div>
                    </div>

                    <CollapsibleContent>
                        <div className="pt-2">
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
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
