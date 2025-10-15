"use client";

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
import { useEffect, useState } from "react";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import OptionGroupSelector from "@/components/optionGroupSelector";
import FormOption, { OptionValues } from "@/components/formOption";
import { useProductOptionApi } from "@/lib/useOptionApi";

type OptionGroupListProps = {
  optionGroups: OptionGroup[];
  businessId: string;
  productId: string;
  productGroupId: string;
  getBusiness: () => void;
};

export default function OptionGroupList({
  optionGroups,
  businessId,
  productId,
  getBusiness,
  productGroupId,
}: OptionGroupListProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [openOptionGroup, setOpenOptionGroup] = useState<boolean>(false);
  const [openOption, setOpenOption] = useState<boolean>(false);
  const [openEditOption, setOpenEditOption] = useState<boolean>(false);
  const [optionsGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const { startLoading, stopLoading } = useLoadingStore();
  const optionGroupApi = useOptionGroupApi();
  const productOptionGroupApi = useOptionProductGroupApi();
  const optionApi = useProductOptionApi();

  async function createOptionGroup(dataDto: ProductOptionGroupValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
      const optionGrooupDto: CreateOptionGroupDto = {
        ...dataDto,
        min_options: Number(dataDto.min_options),
        max_options: Number(dataDto.max_options),
      };
      const { data } = await optionGroupApi.create(optionGrooupDto, businessId);

      await productOptionGroupApi.create(
        {
          product_id: productId,
          option_group_id: data.id,
        },
        businessId
      );

      await getBusiness();
      toast.success("Opción del producto creada correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(false);
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
    }
  }

  async function handleEditGroupOption(
    dataDto: ProductOptionGroupValues,
    optionGroupId: string
  ) {
    try {
      startLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
      const optionGrooupDto: CreateOptionGroupDto = {
        ...dataDto,
        min_options: Number(dataDto.min_options),
        max_options: Number(dataDto.max_options),
      };

      await optionGroupApi.update(optionGrooupDto, businessId, optionGroupId);
      await getBusiness();

      toast.success("Se actualizó correctamente el grupo de opciones", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.UPDATE_GROUP_OPTION);
      setOpenEditOption(false);
    }
  }

  async function handleDeleteOptionGroup(optionGroupId: string) {
    try {
      await productOptionGroupApi.delete(
        {
          product_id: productId,
          option_group_id: optionGroupId,
        },
        businessId
      );

      toast.success("Se eliminó correctamente el grupo de opciones", {
        style: toastSuccessStyle,
      });
      await getBusiness();
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

      await getBusiness();
      toast.success("Se creó la opción correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_OPTION);
    }
  }
  useEffect(() => {
    if (openOptionGroup) {
      getOptionsGroupsById();
    }
  }, [openOptionGroup]);

  return (
    <>
      <div className="flex items-center justify-center gap-3 mt-3">
        <h1 className="text-md font-bold">Variantes del producto</h1>
        <div className="flex gap-1">
          <CustomDialog
            open={openOptionGroup}
            setOpen={setOpenOptionGroup}
            modalTitle="Agregar variante del producto"
            modalDescription="Agrega un grupo de opciones existente para este producto"
            icon={<ListPlusIcon />}
          >
            <OptionGroupSelector
              setOpen={setOpenOptionGroup}
              optionGroups={optionsGroups}
              productId={productId}
              getBusiness={getBusiness}
            />
          </CustomDialog>
          <CustomDialog
            open={open}
            setOpen={setOpen}
            modalTitle="Crear variante del producto"
            modalDescription="Crea un nuevo grupo de opciones para este producto"
          >
            <FormProductOptionGroup
              buttonTitle="Agregar"
              handleSubmitButton={(data) => {
                createOptionGroup(data);
              }}
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION}
            />
          </CustomDialog>
        </div>
      </div>
      {optionGroups.length > 0 ? (
        <div className="flex flex-col gap-4 mt-2 space-y-1">
          {optionGroups.map((og) => (
            <div key={og.id}>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{og.name}</span>
                <CustomDialog
                  open={openOption}
                  setOpen={setOpenOption}
                  modalTitle="Agregar una opcion"
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
                <CustomDialog
                  open={openEditOption}
                  setOpen={setOpenEditOption}
                  modalTitle="Editar grupo opción"
                  icon={<Edit2 />}
                  modalDescription={`Editar grupo opción "${og.name}"`}
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
                <DeleteDialogConfirmation
                  description={`Se eliminará grupo de opciones "${og.name}" del producto seleccionado`}
                  handleContinue={() => handleDeleteOptionGroup(og.id)}
                />
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
