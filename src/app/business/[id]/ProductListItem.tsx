"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/useBusinessApi";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2Icon, ShoppingCartIcon } from "lucide-react";
import ProductDetailSheet from "./ProductDetailSheet";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { UpdateProductDto, useProductApi } from "@/lib/useProductApi";
import { useBusinessStore } from "@/store/businessStore";
import { toast } from "sonner";
import { toastErrorStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useEditModeStore } from "@/store/editModeStore";
import { Option } from "@/lib/useOptionGroupApi";
import ProductOptionGroupItem from "./ProductOptionGroupItem";
import QuantitySelector from "./QuantitySelector";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";

type ProductListItemProps = {
    product: Product;
    onRefresh: () => void;
    forceViewMode?: boolean;
    onAddToCart?: (product: Product, options: Option[], quantity: number) => void;
};

export default function ProductListItem({ product, onRefresh, forceViewMode = false, onAddToCart }: ProductListItemProps) {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const { startLoading, stopLoading } = useLoadingStore();
    const { businessId } = useBusinessStore();
    const globalIsEditMode = useEditModeStore((state) => state.isEditMode);
    const isEditMode = forceViewMode ? false : globalIsEditMode;
    const productApi = useProductApi();

    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
    const [quantity, setQuantity] = useState(1);

    const totalPrice = useMemo(() => {
        let optionsTotal = 0;
        product.option_groups.forEach((group) => {
            const groupSelections = selectedOptions[group.id] || [];
            groupSelections.forEach((optId) => {
                const option = group.options.find((o) => o.id === optId);
                if (option) optionsTotal += option.price;
            });
        });
        return (product.base_price + optionsTotal) * quantity;
    }, [product, selectedOptions, quantity]);

    const isValidSelection = useMemo(() => {
        return product.option_groups.every((group) => {
            if (group.available === false) return true;

            const selections = selectedOptions[group.id] || [];
            return selections.length >= group.min_options && selections.length <= group.max_options;
        });
    }, [product.option_groups, selectedOptions]);

    function handleOptionSelect(groupId: string, optionId: string, isMulti: boolean, maxOptions: number) {
        const currentSelections = selectedOptions[groupId] || [];

        if (isMulti && !currentSelections.includes(optionId)) {
            if (currentSelections.length >= maxOptions) {
                toast.error(`Máximo ${maxOptions} opciones permitidas`, {
                    style: toastErrorStyle,
                });
                return;
            }
        }

        setSelectedOptions((prev) => {
            const currentSelections = prev[groupId] || [];
            let newSelections: string[];

            if (isMulti) {
                if (currentSelections.includes(optionId)) {
                    newSelections = currentSelections.filter((id) => id !== optionId);
                } else {
                    newSelections = [...currentSelections, optionId];
                }
            } else {
                if (currentSelections.includes(optionId)) {
                    newSelections = [];
                } else {
                    newSelections = [optionId];
                }
            }

            return { ...prev, [groupId]: newSelections };
        });
    }

    function handleAddToCart() {
        if (!isValidSelection) {
            toast.error("Selección incompleta de opciones", { style: toastErrorStyle });
            return;
        }

        const cartOptions: Option[] = [];
        product.option_groups.forEach((group) => {
            const selections = selectedOptions[group.id] || [];
            selections.forEach((optId) => {
                const option = group.options.find((o) => o.id === optId);
                if (option) {
                    cartOptions.push(option);
                }
            });
        });

        if (onAddToCart) {
            onAddToCart(product, cartOptions, quantity);
            toast.success("Producto agregado");
        }

        setSelectedOptions({});
        setQuantity(1);
    }

    async function handleDeleteProduct(productId: string) {
        try {
            await productApi.deleteProduct(productId, businessId);
            toast.success("Se eliminó el producto correctamente");
            onRefresh();
        } catch (error) {
            handleApiError(error);
        }
    }

    async function handleEditProduct(
        data: ProductValues,
        productId: string,
        businessId: string
    ) {
        const dataUpdate: UpdateProductDto = {
            name: data.name,
            available: data.available,
            description: data.description ?? "",
            base_price: Number(data.base_price),
        };
        try {
            startLoading(LoadingsKeyEnum.UPDATE_PRODUCT);
            await productApi.updateProduct(dataUpdate, productId, businessId);
            toast.success("Se actualizó el producto exitosamente");
            onRefresh();
        } catch (error) {
            handleApiError(error);
        } finally {
            setSelectedProductId(null);
            stopLoading(LoadingsKeyEnum.UPDATE_PRODUCT);
        }
    }

    return (
        <div className="group relative flex flex-col h-full rounded-xl border bg-card p-5 hover:shadow-lg transition-all duration-300">
            {!product.available && (
                <div className="absolute top-3 right-3">
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                        No disponible
                    </Badge>
                </div>
            )}

            <div className="mb-4 pr-16">
                <h3
                    className={cn(
                        "font-semibold text-lg leading-tight mb-1",
                        !product.available &&
                        "text-muted-foreground line-through decoration-muted-foreground/50"
                    )}
                >
                    {product.name}
                </h3>
                <p className="font-bold text-xl text-primary">${product.base_price}</p>
            </div>

            <div className="flex-1 mb-6">
                {product.description ? (
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                        {product.description}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        Sin descripción
                    </p>
                )}
            </div>

            {product.option_groups && product.option_groups.length > 0 && (
                <div className="mb-4 space-y-1.5 border-t pt-3">
                    {product.option_groups.map((group) => (
                        <ProductOptionGroupItem
                            key={group.id}
                            group={group}
                            selectedOptions={selectedOptions[group.id] || []}
                            onSelectOption={handleOptionSelect}
                            isEditMode={isEditMode}
                        />
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2 mt-auto">
                <ProductDetailSheet product={product} onRefresh={onRefresh} forceViewMode={forceViewMode} />

                {!isEditMode && product.available && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t mt-2">
                        <QuantitySelector
                            quantity={quantity}
                            onChange={setQuantity}
                        />
                        <Button
                            size="sm"
                            className="flex-1 h-8 text-xs gap-2"
                            onClick={handleAddToCart}
                            disabled={!isValidSelection}
                        >
                            <ShoppingCartIcon className="h-3.5 w-3.5" />
                            <span className="font-bold">${totalPrice}</span>
                        </Button>
                    </div>
                )}

                {isEditMode && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t mt-2">
                        <CustomDialog
                            open={selectedProductId === product.id}
                            setOpen={(isOpen) =>
                                setSelectedProductId(isOpen ? product.id : null)
                            }
                            modalTitle="Editar producto"
                            modalDescription="Edita el producto seleccionado"
                            icon={<Edit2Icon className="h-3.5 w-3.5" />}
                        >
                            <FormProduct
                                buttonTitle="Guardar cambios"
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


                        <DeleteDialogConfirmation title="Eliminar producto" description="¿Estás seguro de eliminar este producto?" handleContinue={() => handleDeleteProduct(product.id)}></DeleteDialogConfirmation>

                    </div>
                )}
            </div>
        </div>
    );
}
