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
import OptionGroupSelector from "@/components/optionGroupSelector";
import { useProductOptionApi } from "@/lib/useOptionApi";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { useEditModeStore } from "@/store/editModeStore";
import OptionGroupCard from "@/components/OptionGroupCard";

type OptionGroupListProps = {
  optionGroups: OptionGroup[];
  productId: string;
  productGroupId: string;
};

import { DialogType as CardDialogType } from "@/components/OptionGroupCard";

type DialogType = CardDialogType | "addExistingGroup";

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



  async function getOptionsGroupsById() {
    try {
      const { data } = await optionGroupApi.getByBusinessId(businessId);
      setOptionGroups(data);
    } catch (error) {
      handleApiError(error);
    }
  }


  useEffect(() => {
    if (dialog === "addExistingGroup") getOptionsGroupsById();
  }, [dialog]);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-2">
        <h1 className="text-lg font-bold">Variantes del producto</h1>
        {isEditMode && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CustomDialog
              open={dialog === "addExistingGroup"}
              setOpen={(v) => setDialog(v ? "addExistingGroup" : null)}
              modalTitle="Agregar variante del producto"
              modalDescription="Agrega un grupo de opciones existente para este producto"
              icon={<ListPlusIcon className="h-4 w-4" />}
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
        <div className="grid gap-6">
          {optionGroups.map((og) => (
            <OptionGroupCard
              key={og.id}
              og={og}
              productId={productId}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
          <p className="text-muted-foreground">No hay variantes configuradas para este producto</p>
        </div>
      )}
    </div>
  );
}
