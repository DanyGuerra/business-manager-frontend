"use client";

import { useState } from "react";
import { useEditModeStore } from "@/store/editModeStore";
import { useLoadingStore } from "@/store/loadingStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import CustomDialog from "@/components/customDialog";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import FormProductOptionGroup, {
    ProductOptionGroupValues,
} from "@/components/FormProductOptionGroup";
import FormOption, { OptionValues } from "@/components/formOption";
import { LoadingsKeyEnum } from "@/store/loadingStore";
import { OptionGroup, CreateOptionGroupDto, useOptionGroupApi } from "@/lib/useOptionGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useProductOptionApi } from "@/lib/useOptionApi";
import { useOptionProductGroupApi } from "@/lib/useOptionProductGroupApi";

type ProductCardOptionGroupProps = {
    og: OptionGroup;
    productId: string;
};

export default function ProductCardOptionGroup({
    og,
    productId,
}: ProductCardOptionGroupProps) {
    const { isEditMode } = useEditModeStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { businessId } = useBusinessStore();
    const { getBusiness } = useFetchBusiness();
    const optionGroupApi = useOptionGroupApi();
    const productOptionGroupApi = useOptionProductGroupApi();
    const optionApi = useProductOptionApi();

    const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
    const [isAddOptionOpen, setIsAddOptionOpen] = useState(false);
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

    async function handleEditGroupOption(
        dataDto: ProductOptionGroupValues,
        optionGroupId: string
    ) {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
            const dto: CreateOptionGroupDto = {
                ...dataDto,
                min_options: Number(dataDto.min_options),
                max_options: Number(dataDto.max_options),
            };
            await optionGroupApi.update(dto, businessId, optionGroupId);
            await getBusiness(businessId);
            toast.success("Grupo de opciones actualizado", {
                style: toastSuccessStyle,
            });
            setIsEditGroupOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
        }
    }

    async function handleDeleteOptionGroupRelation(optionGroupId: string) {
        try {
            await productOptionGroupApi.delete(
                { product_id: productId, option_group_id: optionGroupId },
                businessId
            );
            toast.success("Grupo de opciones eliminado del producto", {
                style: toastSuccessStyle,
            });
            await getBusiness(businessId);
        } catch (error) {
            handleApiError(error);
        }
    }

    async function handleCreateOption(data: OptionValues, optionGroupId: string) {
        try {
            startLoading(LoadingsKeyEnum.CREATE_OPTION);
            await optionApi.createOption(businessId, {
                ...data,
                option_group_id: optionGroupId,
                price: Number(data.price),
            });
            await getBusiness(businessId);
            toast.success("Opción creada", {
                style: toastSuccessStyle,
            });
            setIsAddOptionOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_OPTION);
        }
    }

    async function handleUpdateOption(optionId: string, data: OptionValues) {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_OPTION);
            await optionApi.updateProductOption(optionId, businessId, {
                ...data,
                price: Number(data.price),
            });
            toast.success("Opción actualizada", {
                style: toastSuccessStyle,
            });
            await getBusiness(businessId);
            setEditingOptionId(null);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_OPTION);
        }
    }

    async function handleDeleteOption(optionId: string) {
        try {
            await optionApi.deleteProductOption(optionId, businessId);
            toast.success("Opción eliminada", {
                style: toastSuccessStyle,
            });
            await getBusiness(businessId);
        } catch (error) {
            handleApiError(error);
        }
    }

    return (
        <div className="flex flex-col gap-2 py-2 border-b border-border/40 last:border-0">
            {/* Header: Name + Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                        {og.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Min: {og.min_options}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Max: {og.max_options}
                    </span>
                </div>

                {isEditMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CustomDialog
                            open={isEditGroupOpen}
                            setOpen={setIsEditGroupOpen}
                            modalTitle="Editar grupo"
                            modalDescription={`Editar ${og.name}`}
                            trigger={
                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted">
                                    <Edit2Icon className="h-3 w-3" />
                                </Button>
                            }
                        >
                            <FormProductOptionGroup
                                buttonTitle="Guardar"
                                loadingKey={LoadingsKeyEnum.UPDATE_GROUP_OPTION}
                                defaultValues={{
                                    ...og,
                                    max_options: String(og.max_options),
                                    min_options: String(og.min_options),
                                }}
                                handleSubmitButton={(data) => handleEditGroupOption(data, og.id)}
                            />
                        </CustomDialog>

                        <DeleteDialogConfirmation
                            handleContinue={() => handleDeleteOptionGroupRelation(og.id)}
                            description="¿Quitar este grupo del producto?"
                        />
                    </div>
                )}
            </div>

            {/* Options List */}
            <div className="flex flex-wrap gap-1.5">
                {og.options.map((opt) => (
                    <div key={opt.id} className="relative group/option">
                        {isEditMode ? (
                            <CustomDialog
                                open={editingOptionId === opt.id}
                                setOpen={(open) => setEditingOptionId(open ? opt.id : null)}
                                modalTitle="Editar opción"
                                modalDescription={`Editar ${opt.name}`}
                                trigger={
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer hover:bg-muted transition-colors pr-1.5"
                                    >
                                        {opt.name} {opt.price > 0 && `(+$${opt.price})`}
                                    </Badge>
                                }
                            >
                                <div className="space-y-4">
                                    <FormOption
                                        defaultValues={{ ...opt, price: `${opt.price}` }}
                                        buttonTitle="Guardar"
                                        loadingKey={LoadingsKeyEnum.UPDATE_OPTION}
                                        handleSubmitButton={(data) => handleUpdateOption(opt.id, data)}
                                    />
                                    <div className="flex justify-end border-t pt-4">
                                        <DeleteDialogConfirmation
                                            handleContinue={() => handleDeleteOption(opt.id)}
                                            description="¿Eliminar esta opción permanentemente?"
                                        />
                                    </div>
                                </div>
                            </CustomDialog>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground bg-muted/20">
                                {opt.name} {opt.price > 0 && `(+$${opt.price})`}
                            </Badge>
                        )}
                    </div>
                ))}

                {/* Add Option Button */}
                {isEditMode && (
                    <CustomDialog
                        open={isAddOptionOpen}
                        setOpen={setIsAddOptionOpen}
                        modalTitle="Agregar opción"
                        modalDescription={`Agregar a ${og.name}`}
                        trigger={
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary/20 border-dashed border-primary/30 text-primary/70 gap-1 pl-1 pr-2"
                            >
                                <PlusIcon className="h-3 w-3" />
                                <span className="text-[10px]">Agregar</span>
                            </Badge>
                        }
                    >
                        <FormOption
                            buttonTitle="Agregar"
                            handleSubmitButton={(data) => handleCreateOption(data, og.id)}
                            loadingKey={LoadingsKeyEnum.CREATE_OPTION}
                        />
                    </CustomDialog>
                )}

                {og.options.length === 0 && !isEditMode && (
                    <span className="text-[10px] text-muted-foreground italic">Sin opciones</span>
                )}
            </div>
        </div>
    );
}
