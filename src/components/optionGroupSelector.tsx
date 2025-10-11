"use client";

import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useState } from "react";
import { handleApiError } from "@/utils/handleApiError";
import { useOptionProductGroupApi } from "@/lib/useOptionProductGroupApi";
import { OptionGroup } from "@/lib/useOptionGroupApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";

type OptionGroupSelectorProps = {
  optionGroups: OptionGroup[];
  productId: string;
  setOpen: (open: boolean) => void;
  getBusiness: () => {};
};

export default function OptionGroupSelector({
  optionGroups = [],
  productId,
  setOpen,
  getBusiness,
}: OptionGroupSelectorProps) {
  const pgApi = useOptionProductGroupApi();
  const [selectedGroupOption, setSelectedGroupOption] =
    useState<OptionGroup | null>(null);

  function handleCheck(og: OptionGroup) {
    setSelectedGroupOption(og);
  }

  async function handleAddOptionGroup() {
    if (!selectedGroupOption) return;
    try {
      await pgApi.create(
        { option_group_id: selectedGroupOption.id, product_id: productId },
        selectedGroupOption.business_id
      );

      await getBusiness();
      toast.success("Se agregó correctamente el grupo de opciones", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(false);
    }
  }

  return (
    <section className="flex flex-col w-full gap-4">
      <ScrollArea className="h-[300px] w-[100%] rounded-md border p-4">
        <div className="p-2 flex flex-col gap-2">
          {optionGroups.length > 0 ? (
            optionGroups.map((og) => (
              <div key={og.id} className="flex gap-3">
                <Checkbox
                  checked={selectedGroupOption?.id === og.id}
                  onCheckedChange={() => handleCheck(og)}
                />
                <Label className="cursor-pointer">{og.name}</Label>
              </div>
            ))
          ) : (
            <h1>No hay grupos de opciones</h1>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-end">
        <Button
          disabled={!selectedGroupOption}
          className="cursor-pointer"
          onClick={handleAddOptionGroup}
        >
          Agregar
        </Button>
      </div>
    </section>
  );
}
