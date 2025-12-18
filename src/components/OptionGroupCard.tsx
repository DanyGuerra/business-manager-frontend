"use client";

import { useEditModeStore } from "@/store/editModeStore";
import { useLoadingStore } from "@/store/loadingStore";

import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import CustomDialog from "@/components/customDialog";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import FormProductOptionGroup, {
    ProductOptionGroupValues,
} from "@/components/FormProductOptionGroup";
import FormOption, { OptionValues } from "@/components/formOption";
import OptionList from "@/app/business/[id]/OptionList";
import { LoadingsKeyEnum } from "@/store/loadingStore";
import { OptionGroup } from "@/lib/useOptionGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useProductOptionApi } from "@/lib/useOptionApi";
import {
    CreateOptionGroupDto,
    useOptionGroupApi,
} from "@/lib/useOptionGroupApi";
import { useOptionProductGroupApi } from "@/lib/useOptionProductGroupApi";
import { cn } from "@/lib/utils";

import { useState } from "react";

export type DialogType = "createGroup" | "addOption" | "editGroup" | null;

type OptionGroupCardProps = {
    og: OptionGroup;
    productId?: string;
};

export default function OptionGroupCard({
    og,
    productId,
}: OptionGroupCardProps) {
    const { isEditMode } = useEditModeStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { businessId } = useBusinessStore();
    const optionGroupApi = useOptionGroupApi();
    const productOptionGroupApi = useOptionProductGroupApi();
    const optionApi = useProductOptionApi();

    const [dialogOpen, setDialogOpen] = useState<DialogType>(null);
    const closeDialog = () => setDialogOpen(null);

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
            toast.success("Grupo de opciones actualizado correctamente", {
                style: toastSuccessStyle,
            });
            closeDialog();
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
        }
    }

    async function handleDeleteOptionGroup(optionGroupId: string) {

        try {
            await optionGroupApi.delete(
                businessId,
                optionGroupId,
            );
            toast.success("Se eliminó correctamente el grupo de opciones", {
                style: toastSuccessStyle,
            });
        } catch (error) {
            handleApiError(error);
        }
    }

    async function handleDeleteOptionGroupRelation(optionGroupId: string) {
        if (!productId) return;
        try {
            await productOptionGroupApi.delete(
                { product_id: productId, option_group_id: optionGroupId },
                businessId
            );
            toast.success("Se eliminó correctamente el grupo de opciones para este producto", {
                style: toastSuccessStyle,
            });
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
            toast.success("Opción creada correctamente", {
                style: toastSuccessStyle,
            });
            closeDialog();
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_OPTION);
        }
    }

    async function handleDeleteOption(optionId: string) {
        try {
            await optionApi.deleteProductOption(optionId, businessId);
            toast.success("Opción eliminada correctamente", {
                style: toastSuccessStyle,
            });
        } catch (error) {
            handleApiError(error);
        }
    }

    async function handleUpdateOption(
        optionId: string,
        data: OptionValues,
    ) {
        try {
            await optionApi.updateProductOption(optionId, businessId, {
                ...data,
                price: Number(data.price),
            });
            toast.success("Opción actualizada correctamente", {
                style: toastSuccessStyle,
            });
        } catch (error) {
            handleApiError(error);
        }
    }

    return (
        <div
            key={og.id}
            className={cn("group border rounded-lg p-4 space-y-4", isEditMode && "border-2 border-dashed border-primary/50 hover:border-primary/90")}
        >
            <div className="">
                <div className="flex items-start justify-between gap-2">
                    <div >
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold">{og.name}</h3>
                            <Badge
                                variant="outline"
                                className={
                                    og.available
                                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 transition-colors"
                                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors"
                                }
                            >
                                {og.available ? "Disponible" : "No disponible"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border shadow-sm">
                                <span className="font-medium text-foreground">Min:</span>
                                <span>{og.min_options}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border shadow-sm">
                                <span className="font-medium text-foreground">Max:</span>
                                <span>{og.max_options}</span>
                            </div>
                        </div>
                    </div>
                    {isEditMode && (
                        <div className="flex items-center gap-1 transition-opacity duration-200">
                            <CustomDialog
                                open={dialogOpen === "editGroup"}
                                setOpen={(isOpen) => setDialogOpen(isOpen ? "editGroup" : null)}
                                modalTitle="Editar grupo de opciones"
                                modalDescription={`Editar grupo de opcioones "${og.name}"`}
                                icon={<Pencil className="h-4 w-4" />}
                            >
                                <FormProductOptionGroup
                                    buttonTitle="Guardar"
                                    loadingKey={LoadingsKeyEnum.UPDATE_GROUP_OPTION}
                                    defaultValues={{
                                        ...og,
                                        max_options: String(og.max_options),
                                        min_options: String(og.min_options),
                                    }}
                                    handleSubmitButton={(data) =>
                                        handleEditGroupOption(data, og.id)
                                    }
                                />
                            </CustomDialog>
                            <DeleteDialogConfirmation
                                handleContinue={() => productId ? handleDeleteOptionGroupRelation(og.id) : handleDeleteOptionGroup(og.id)}
                                title="Eliminar grupo de opciones"
                                description={`¿Estás seguro de eliminar el grupo de opciones "${og.name}"?`}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="">
                <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        Opciones
                        <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-[10px]">
                            {og.options.length}
                        </span>
                    </div>
                    {isEditMode && (
                        <CustomDialog
                            open={dialogOpen === "addOption"}
                            setOpen={(isOpen) => setDialogOpen(isOpen ? "addOption" : null)}
                            modalTitle="Agregar una opción"
                            modalDescription={`Agregar opción al grupo "${og.name}"`}
                        >
                            <FormOption
                                buttonTitle="Agregar"
                                handleSubmitButton={(data) => handleCreateOption(data, og.id)}
                                loadingKey={LoadingsKeyEnum.CREATE_OPTION}
                            />
                        </CustomDialog>
                    )}
                </div>

                <OptionList
                    options={og.options}
                    onDelete={
                        (optionId) => handleDeleteOption(optionId)

                    }
                    onUpdate={
                        (optionId, data) => handleUpdateOption(optionId, data)

                    }
                />
            </div>
        </div>
    );
}
