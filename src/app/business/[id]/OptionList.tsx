"use client";

import { useFetchBusiness } from "@/app/hooks/useBusiness";
import CustomDialog from "@/components/customDialog";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import FormOption, { OptionValues } from "@/components/formOption";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useProductOptionApi } from "@/lib/useOptionApi";
import { Option } from "@/lib/useOptionGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEditModeStore } from "@/store/editModeStore";
import { LoadingsKeyEnum } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type OptionListProps = {
  options: Option[];
};

export default function OptionList({ options }: OptionListProps) {
  const [open, setOpen] = useState<string | null>(null);
  const optionApi = useProductOptionApi();
  const { businessId } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();
  const { isEditMode } = useEditModeStore();

  async function handleUpdateOption(
    productOptionId: string,
    data: OptionValues
  ) {
    try {
      await optionApi.updateProductOption(productOptionId, businessId, {
        ...data,
        price: Number(data.price),
      });
      toast.success("Opción actualizada correctamente", {
        style: toastSuccessStyle,
      });
      await getBusiness(businessId);
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(null);
    }
  }

  async function handleDeleteOption(productOptionId: string) {
    try {
      await optionApi.deleteProductOption(productOptionId, businessId);
      toast.success("Opción eliminada correctamente", {
        style: toastSuccessStyle,
      });
      await getBusiness(businessId);
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.length > 0 ? (
        options.map((opt) => (
          <span
            key={opt.id}
            className="px-2 py-1 border rounded text-sm flex items-center gap-4"
          >
            <div
              className={`${
                !opt.available ? "line-through text-muted-foreground" : ""
              }`}
            >
              {opt.name} {opt.price > 0 && `+ $${opt.price}`}
            </div>
            {isEditMode && (
              <span className="flex gap-1">
                <CustomDialog
                  open={open === opt.id}
                  setOpen={(o) => (o ? setOpen(opt.id) : setOpen(null))}
                  modalTitle="Editar opción"
                  modalDescription={`Editar la opción "${opt.name}"`}
                  icon={<Pencil />}
                >
                  <FormOption
                    defaultValues={{ ...opt, price: `${opt.price}` }}
                    buttonTitle="Guardar"
                    loadingKey={LoadingsKeyEnum.UPDATE_OPTION}
                    handleSubmitButton={(data: OptionValues) =>
                      handleUpdateOption(opt.id, data)
                    }
                  />
                </CustomDialog>
                <DeleteDialogConfirmation
                  description={`Esta acción eliminará permanentemente la opcion "${opt.name}"`}
                  handleContinue={() => handleDeleteOption(opt.id)}
                />
              </span>
            )}
          </span>
        ))
      ) : (
        <div className="w-full flex items-center justify-center text-xs text-gray-400 min-h-10">
          <span>No hay opciones</span>
        </div>
      )}
    </div>
  );
}
