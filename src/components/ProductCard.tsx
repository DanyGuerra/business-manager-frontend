"use client";

import { useState, useMemo } from "react";
import { Product } from "@/lib/useBusinessApi";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2Icon, PlusCircleIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditModeStore } from "@/store/editModeStore";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { UpdateProductDto, useProductApi } from "@/lib/useProductApi";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { toast } from "sonner";
import { toastErrorStyle, toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import ProductCardOptionGroup from "./ProductCardOptionGroup";
import { Separator } from "@/components/ui/separator";
import OptionGroupSelector from "@/components/optionGroupSelector";
import { useOptionGroupApi, OptionGroup, Option } from "@/lib/useOptionGroupApi";
import { useCartStore } from "@/store/cartStore";
import { Input } from "@/components/ui/input";

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

    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
    const [quantity, setQuantity] = useState(1);
    const addToCart = useCartStore((state) => state.addToCart);

    const totalPrice = useMemo(() => {
        let optionsTotal = 0;
        product.option_groups.forEach(group => {
            const groupSelections = selectedOptions[group.id] || [];
            groupSelections.forEach(optId => {
                const option = group.options.find(o => o.id === optId);
                if (option) optionsTotal += option.price;
            });
        });
        return (product.base_price + optionsTotal) * quantity;
    }, [product, selectedOptions, quantity]);


    const isValidSelection = useMemo(() => {
        return product.option_groups.every(group => {
            const selections = selectedOptions[group.id] || [];
            return selections.length >= group.min_options && selections.length <= group.max_options;
        });
    }, [product.option_groups, selectedOptions]);

    function handleOptionSelect(groupId: string, optionId: string, isMulti: boolean) {
        setSelectedOptions(prev => {
            const currentSelections = prev[groupId] || [];
            let newSelections: string[];

            if (isMulti) {
                if (currentSelections.includes(optionId)) {
                    newSelections = currentSelections.filter(id => id !== optionId);
                } else {
                    const group = product.option_groups.find(g => g.id === groupId);
                    if (group && currentSelections.length >= group.max_options) {
                        toast.error(`Máximo ${group.max_options} opciones permitidas`, {
                            style: toastErrorStyle,
                        });
                        return prev;
                    }
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
        if (!isValidSelection) return;

        const cartOptions: Option[] = [];
        product.option_groups.forEach(group => {
            const selections = selectedOptions[group.id] || [];
            selections.forEach(optId => {
                const option = group.options.find(o => o.id === optId);
                if (option) {
                    cartOptions.push(option);
                }
            });
        });

        addToCart(product, cartOptions, quantity);
        toast.success("Producto agregado al carrito", { style: toastSuccessStyle });

        setSelectedOptions({});
        setQuantity(1);
    }

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

    function onChangeQuantity(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        if (/^[0-9]*$/.test(value)) {
            setQuantity(Number(value));
        }
    }

    function onQuantityBlur(e: React.FocusEvent<HTMLInputElement>) {
        if (quantity <= 0) {
            setQuantity(1);
        }
    }

    return (
        <Card className="group relative flex flex-col h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20 px-6">
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
                    <div className="flex items-start justify-between gap-2">
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

            <CardContent className="flex-1 p-5 pt-0 space-y-4 flex flex-col">
                {product.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {product.description}
                    </p>
                )}

                <div className="flex flex-col gap-1">
                    {(product.description || product.option_groups.length > 0) && <Separator className="mb-5 opacity-50" />}


                    <div className="flex flex-col gap-4 pb-4">
                        {product.option_groups.map((group) => (
                            <ProductCardOptionGroup
                                key={group.id}
                                og={group}
                                productId={product.id}
                                selectedOptions={selectedOptions[group.id]}
                                onSelect={(optId, isMulti) => handleOptionSelect(group.id, optId, isMulti)}
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

                {/* Add to Cart Section */}
                {!isEditMode && product.available && (
                    <div className="pt-4 mt-auto space-y-3">
                        <Separator className="opacity-50" />
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center border rounded-md flex-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none cursor-pointer"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <MinusIcon className="h-3 w-3" />
                                </Button>
                                <Input
                                    type="text"
                                    value={quantity}
                                    onChange={onChangeQuantity}
                                    onBlur={(e) => onQuantityBlur(e)}
                                    className="h-8 border-0 p-0 text-center text-sm focus-visible:ring-0 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none cursor-pointer"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <PlusIcon className="h-3 w-3" />
                                </Button>
                            </div>
                            <Button
                                className="flex-1 gap-2 cursor-pointer"
                                disabled={!isValidSelection}
                                onClick={handleAddToCart}
                            >
                                <ShoppingCartIcon className="h-4 w-4" />
                                <span className="font-bold">${totalPrice}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
