"use client";

import { useState } from "react";
import { Product } from "@/lib/useBusinessApi";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2Icon, PlusCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditModeStore } from "@/store/editModeStore";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { UpdateProductDto, useProductApi } from "@/lib/useProductApi";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import ProductCardOptionGroup from "./ProductCardOptionGroup";
import { Separator } from "@/components/ui/separator";
import OptionGroupSelector from "@/components/optionGroupSelector";
import { useOptionGroupApi, OptionGroup } from "@/lib/useOptionGroupApi";

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLinkGroupOpen, setIsLinkGroupOpen] = useState(false);
    const { isEditMode } = useEditModeStore();
    const productApi = useProductApi();
    const optionGroupApi = useOptionGroupApi();
    const { startLoading, stopLoading } = useLoadingStore();
    const { businessId } = useBusinessStore();
    const { getBusiness } = useFetchBusiness();
    const [allOptionGroups, setAllOptionGroups] = useState<OptionGroup[]>([]);

    async function handleEditProduct(
        data: ProductValues,
        productId: string,
        businessId: string
    ) {
        const dataUpdate: UpdateProductDto = {
            ...data,
            description: data.description ?? "",
            base_price: Number(data.base_price),
        };
        try {
            startLoading(LoadingsKeyEnum.UPDATE_PRODUCT);
            await productApi.updateProduct(dataUpdate, productId, businessId);
            await getBusiness(businessId);
            toast.success("Se actualizó el producto exitosamente", {
                style: toastSuccessStyle,
            });
            setIsEditOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT);
        }
    }

    async function handleDeleteProduct(productId: string) {
        try {
            await productApi.deleteProduct(productId, businessId);
            await getBusiness(businessId);
            toast.success("Se eliminó el producto correctamente", {
                style: toastSuccessStyle,
            });
        } catch (error) {
            handleApiError(error);
        }
    }

    async function handleOpenLinkDialog() {
        try {
            const { data } = await optionGroupApi.getByBusinessId(businessId);
            setAllOptionGroups(data);
            setIsLinkGroupOpen(true);
        } catch (error) {
            handleApiError(error);
        }
    }

    return (
        <Card className="group relative flex flex-col h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20 px-6">
            {/* Edit Actions - Absolute Positioned */}
            {isEditMode && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <CustomDialog
                        open={isEditOpen}
                        setOpen={setIsEditOpen}
                        modalTitle="Editar producto"
                        modalDescription="Edita el producto seleccionado"
                        trigger={
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 shadow-sm hover:bg-background"
                            >
                                <Edit2Icon className="h-4 w-4" />
                            </Button>
                        }
                    >
                        <FormProduct
                            buttonTitle="Guardar"
                            handleSubmitButton={(data) =>
                                handleEditProduct(data, product.id, businessId)
                            }
                            loadingKey={LoadingsKeyEnum.UPDATE_PRODUCT}
                            defaultValues={{
                                ...product,
                                base_price: `${product.base_price}`,
                            }}
                        />
                    </CustomDialog>
                    <DeleteDialogConfirmation
                        handleContinue={() => handleDeleteProduct(product.id)}
                        description="Esta acción no podrá ser revertida."
                    />
                </div>
            )}

            <CardHeader className="p-5 pb-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle
                            className={cn(
                                "text-lg font-bold leading-tight tracking-tight text-foreground",
                                !product.available && "text-muted-foreground line-through decoration-destructive/50"
                            )}
                        >
                            {product.name}
                        </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm font-bold text-primary px-2.5 py-0.5 bg-primary/10 hover:bg-primary/20 border-transparent">
                            ${product.base_price}
                        </Badge>
                        {!product.available && (
                            <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-medium">
                                No disponible
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-5 pt-0 space-y-4">
                {product.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {product.description}
                    </p>
                )}

                <div className="pt-2">
                    {(product.description || product.option_groups.length > 0) && <Separator className="mb-4 opacity-50" />}

                    {/* Minimalist Option Groups Display */}
                    <div className="space-y-1">
                        {product.option_groups.map((group) => (
                            <ProductCardOptionGroup
                                key={group.id}
                                og={group}
                                productId={product.id}
                            />
                        ))}

                        {product.option_groups.length === 0 && !isEditMode && (
                            <p className="text-center text-xs text-muted-foreground">Sin variantes configuradas</p>
                        )}

                        {isEditMode && (
                            <div className="pt-2">
                                <CustomDialog
                                    open={isLinkGroupOpen}
                                    setOpen={setIsLinkGroupOpen}
                                    modalTitle="Vincular variante"
                                    modalDescription="Selecciona un grupo de opciones existente"
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-8 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 gap-2 cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleOpenLinkDialog();
                                            }}
                                        >
                                            <PlusCircleIcon className="h-3.5 w-3.5" />
                                            Vincular Variante
                                        </Button>
                                    }
                                >
                                    <OptionGroupSelector
                                        setOpen={() => setIsLinkGroupOpen(false)}
                                        optionGroups={allOptionGroups}
                                        productId={product.id}
                                    />
                                </CustomDialog>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
