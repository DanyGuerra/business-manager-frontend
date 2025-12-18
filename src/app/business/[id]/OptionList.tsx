"use client";

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
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OptionListProps = {
  options: Option[];
  onDelete?: (id: string) => Promise<void>;
  onUpdate?: (id: string, data: OptionValues) => Promise<void>;
};

export default function OptionList({
  options,
  onDelete,
  onUpdate,
}: OptionListProps) {
  const [open, setOpen] = useState<string | null>(null);
  const optionApi = useProductOptionApi();
  const { businessId } = useBusinessStore();
  const { isEditMode } = useEditModeStore();

  async function handleUpdateOption(
    productOptionId: string,
    data: OptionValues
  ) {
    if (onUpdate) {
      await onUpdate(productOptionId, data);
      setOpen(null);
      return;
    }
    try {
      await optionApi.updateProductOption(productOptionId, businessId, {
        ...data,
        price: Number(data.price),
      });
      toast.success("Opción actualizada correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(null);
    }
  }

  async function handleDeleteOption(productOptionId: string) {
    if (onDelete) {
      await onDelete(productOptionId);
      setOpen(null);
      return;
    }
    try {
      await optionApi.deleteProductOption(productOptionId, businessId);
      toast.success("Opción eliminada correctamente", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.length > 0 ? (
        options.map((opt) => {
          const badgeContent = (
            <span className={cn("flex items-center gap-1.5", !opt.available && "opacity-50 line-through decoration-destructive/50")}>
              {opt.name}
              {opt.price > 0 && (
                <span className="text-[10px] bg-background/20 px-1 rounded-sm">
                  +${opt.price}
                </span>
              )}
            </span>
          );

          if (isEditMode) {
            return (
              <CustomDialog
                key={opt.id}
                open={open === opt.id}
                setOpen={(o) => (o ? setOpen(opt.id) : setOpen(null))}
                modalTitle="Editar opción"
                modalDescription={`Editar la opción "${opt.name}"`}
                trigger={
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors py-1 px-2.5 text-sm font-normal border-transparent hover:border-primary/20 border"
                  >
                    {badgeContent}
                  </Badge>
                }
              >
                <div className="space-y-4">
                  <FormOption
                    defaultValues={{ ...opt, price: `${opt.price}` }}
                    buttonTitle="Guardar"
                    loadingKey={LoadingsKeyEnum.UPDATE_OPTION}
                    handleSubmitButton={(data: OptionValues) =>
                      handleUpdateOption(opt.id, data)
                    }
                  />
                  <div className="flex justify-end border-t pt-4">
                    <DeleteDialogConfirmation
                      description={`Esta acción eliminará permanentemente la opcion "${opt.name}"`}
                      handleContinue={() => handleDeleteOption(opt.id)}
                    />
                  </div>
                </div>
              </CustomDialog>
            );
          }

          return (
            <Badge
              key={opt.id}
              variant="outline"
              className="py-1 px-2.5 text-sm font-normal text-muted-foreground bg-background"
            >
              {badgeContent}
            </Badge>
          );
        })
      ) : (
        <div className="w-full flex items-center justify-center text-xs text-muted-foreground min-h-10 italic">
          <span>No hay opciones disponibles</span>
        </div>
      )}
    </div>
  );
}
