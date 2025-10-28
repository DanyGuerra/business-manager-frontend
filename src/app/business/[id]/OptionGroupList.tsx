"use client";

import { useState, useEffect } from "react";
import OptionList from "./OptionList";
import CustomDialog from "@/components/customDialog";
import { Edit2, ListPlusIcon } from "lucide-react";
import FormProductOptionGroup, {
  ProductOptionGroupValues,
} from "@/components/FormProductOptionGroup";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { useOptionProductGroupApi } from "@/lib/useOptionProductGroupApi";
import {
  CreateOptionGroupDto,
  OptionGroup,
  useOptionGroupApi,
} from "@/lib/useOptionGroupApi";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import OptionGroupSelector from "@/components/optionGroupSelector";
import FormOption, { OptionValues } from "@/components/formOption";
import { useProductOptionApi } from "@/lib/useOptionApi";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { useEditModeStore } from "@/store/editModeStore";

type OptionGroupListProps = {
  optionGroups: OptionGroup[];
  productId: string;
  productGroupId: string;
};

type DialogType =
  | null
  | "createGroup"
  | "addExistingGroup"
  | { type: "addOption"; groupId: string }
  | { type: "editGroup"; groupId: string };

export default function OptionGroupList({
  optionGroups,
  productId,
}: OptionGroupListProps) {
  const [dialog, setDialog] = useState<DialogType>(null);
  const { isEditMode } = useEditModeStore();
  const [optionsGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const optionGroupApi = useOptionGroupApi();
  const productOptionGroupApi = useOptionProductGroupApi();
  const optionApi = useProductOptionApi();
  const { getBusiness } = useFetchBusiness();

  const closeDialog = () => setDialog(null);

  async function createOptionGroup(dataDto: ProductOptionGroupValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
      const dto: CreateOptionGroupDto = {
        ...dataDto,
        min_options: Number(dataDto.min_options),
        max_options: Number(dataDto.max_options),
      };
      const { data } = await optionGroupApi.create(dto, businessId);
      await productOptionGroupApi.create(
        { product_id: productId, option_group_id: data.id },
        businessId
      );
      await getBusiness(businessId);
      toast.success("Opción del producto creada correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
      closeDialog();
    }
  }

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
      await productOptionGroupApi.delete(
        { product_id: productId, option_group_id: optionGroupId },
        businessId
      );
      toast.success("Se eliminó correctamente el grupo de opciones", {
        style: toastSuccessStyle,
      });
      await getBusiness(businessId);
    } catch (error) {
      handleApiError(error);
    }
  }

  async function getOptionsGroupsById() {
    try {
      const { data } = await optionGroupApi.getByBusinessId(businessId);
      setOptionGroups(data);
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

  useEffect(() => {
    if (dialog === "addExistingGroup") getOptionsGroupsById();
  }, [dialog]);

  return (
    <>
      <div className="flex items-center justify-center gap-3 mt-3">
        <h1 className="text-md font-bold">Variantes del producto</h1>
        {isEditMode && (
          <div className="flex gap-1">
            <CustomDialog
              open={dialog === "addExistingGroup"}
              setOpen={(v) => setDialog(v ? "addExistingGroup" : null)}
              modalTitle="Agregar variante del producto"
              modalDescription="Agrega un grupo de opciones existente para este producto"
              icon={<ListPlusIcon />}
            >
              <OptionGroupSelector
                setOpen={() => closeDialog()}
                optionGroups={optionsGroups}
                productId={productId}
              />
            </CustomDialog>

            <CustomDialog
              open={dialog === "createGroup"}
              setOpen={(v) => setDialog(v ? "createGroup" : null)}
              modalTitle="Crear variante del producto"
              modalDescription="Crea un nuevo grupo de opciones para este producto"
            >
              <FormProductOptionGroup
                buttonTitle="Agregar"
                handleSubmitButton={createOptionGroup}
                loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION}
              />
            </CustomDialog>
          </div>
        )}
      </div>

      {optionGroups.length > 0 ? (
        <div className="flex flex-col gap-4 mt-2 space-y-1">
          {optionGroups.map((og) => (
            <div key={og.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <div
                    className={`font-semibold ${
                      !og.available ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {og.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{`Min: ${og.min_options} - Max: ${og.max_options}`}</div>
                </div>
                {isEditMode && (
                  <span className="flex gap-1">
                    {/* Create option */}
                    <CustomDialog
                      open={
                        typeof dialog === "object" &&
                        dialog?.type === "addOption" &&
                        dialog.groupId === og.id
                      }
                      setOpen={(v) =>
                        setDialog(
                          v ? { type: "addOption", groupId: og.id } : null
                        )
                      }
                      modalTitle="Agregar una opción"
                      modalDescription={`Agregar opción al grupo "${og.name}"`}
                    >
                      <FormOption
                        buttonTitle="Agregar"
                        handleSubmitButton={(data) =>
                          handleCreateOption(data, og.id)
                        }
                        loadingKey={LoadingsKeyEnum.CREATE_OPTION}
                      />
                    </CustomDialog>

                    {/* Edit group option */}
                    <CustomDialog
                      open={
                        typeof dialog === "object" &&
                        dialog?.type === "editGroup" &&
                        dialog.groupId === og.id
                      }
                      setOpen={(v) =>
                        setDialog(
                          v ? { type: "editGroup", groupId: og.id } : null
                        )
                      }
                      modalTitle="Editar grupo de opción"
                      icon={<Edit2 />}
                      modalDescription={`Editar grupo "${og.name}"`}
                    >
                      <FormProductOptionGroup
                        defaultValues={{
                          ...og,
                          min_options: `${og.min_options}`,
                          max_options: `${og.max_options}`,
                        }}
                        buttonTitle="Guardar"
                        handleSubmitButton={(data) =>
                          handleEditGroupOption(data, og.id)
                        }
                        loadingKey={LoadingsKeyEnum.UPDATE_GROUP_OPTION}
                      />
                    </CustomDialog>

                    {/* Delete group option */}
                    <DeleteDialogConfirmation
                      description={`Se eliminará grupo de opciones "${og.name}" del producto seleccionado`}
                      handleContinue={() => handleDeleteOptionGroup(og.id)}
                    />
                  </span>
                )}
              </div>

              <OptionList options={og.options} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-25">
          <span className="text-muted-foreground">No hay variantes</span>
        </div>
      )}
    </>
  );
}
