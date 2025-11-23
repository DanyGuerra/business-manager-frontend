"use client";

import { useState } from "react";
import { useEditModeStore } from "@/store/editModeStore";
import { useLoadingStore } from "@/store/loadingStore";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useProductOptionApi } from "@/lib/useOptionApi";
import {
    CreateOptionGroupDto,
    useOptionGroupApi,
} from "@/lib/useOptionGroupApi";
import { useOptionProductGroupApi } from "@/lib/useOptionProductGroupApi";

export type DialogType =
    | null
    | "createGroup"
    | { type: "addOption"; groupId: string }
    | { type: "editGroup"; groupId: string }

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
    const { getBusiness } = useFetchBusiness();
    const optionGroupApi = useOptionGroupApi();
    const productOptionGroupApi = useOptionProductGroupApi();
    const optionApi = useProductOptionApi();
    const [dialog, setDialog] = useState<DialogType>(null);

    const closeDialog = () => setDialog(null);

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
            toast.success("Grupo de opciones actualizado correctamente", {
                style: toastSuccessStyle,
            });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
            closeDialog();
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
            await getBusiness(businessId);
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
            toast.success("Opción creada correctamente", {
                style: toastSuccessStyle,
            });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_OPTION);
            closeDialog();
        }
    }

    async function handleDeleteOption(optionId: string, groupId: string) {
        try {
            await optionApi.deleteProductOption(optionId, businessId);
            toast.success("Opción eliminada correctamente", {
                style: toastSuccessStyle,
            });
            await getBusiness(businessId);
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
            await getBusiness(businessId);
        } catch (error) {
            handleApiError(error);
        }
    }

    return (
        <Card
            key={og.id}
            className="overflow-hidden transition-all hover:shadow-md border-muted/60"
        >
            <CardHeader className="bg-muted/10 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg font-semibold">{og.name}</CardTitle>
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
                        <CardDescription className="flex items-center gap-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border shadow-sm">
                                <span className="font-medium text-foreground">Min:</span>
                                <span>{og.min_options}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-md border shadow-sm">
                                <span className="font-medium text-foreground">Max:</span>
                                <span>{og.max_options}</span>
                            </div>
                        </CardDescription>
                    </div>
                    {isEditMode && (
                        <div className="flex items-center gap-1">
                            <CustomDialog
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
            </CardHeader>
            <CardContent className="p-4 pt-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Opciones
                            <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-[10px]">
                                {og.options.length}
                            </span>
                        </div>
                        {isEditMode && (
                            <CustomDialog
                                modalTitle="Agregar una opción"
                                modalDescription={`Agregar opción al grupo "${og.name}"`}
                                textButtonTrigger="Agregar opción"
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
                            (optionId) => handleDeleteOption(optionId, og.id)

                        }
                        onUpdate={
                            (optionId, data) => handleUpdateOption(optionId, data)

                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
}
