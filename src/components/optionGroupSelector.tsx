"use client";

import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { useState } from "react";
import { handleApiError } from "@/utils/handleApiError";
import { useOptionProductGroupApi } from "@/lib/useOptionProductGroupApi";
import { OptionGroup } from "@/lib/useOptionGroupApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type OptionGroupSelectorProps = {
  optionGroups: OptionGroup[];
  productId: string;
  setOpen: (open: boolean) => void;
  getBusiness: () => void;
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
      <ScrollArea className="h-[300px] w-[100%] rounded-md border p-4Í">
        <div className="flex flex-col gap-5">
          {optionGroups.length > 0 ? (
            optionGroups.map((og) => {
              return (
                <RadioGroup
                  key={og.id}
                  value={selectedGroupOption?.id ?? ""}
                  onValueChange={() => handleCheck(og)}
                  className="flex w-full gap-4"
                >
                  <Label key={og.id} htmlFor={og.id} className="w-full">
                    <div className="w-full">
                      <Card
                        className={`cursor-pointer transition-all border rounded-xl p-4 flex gap-3 items-start hover:border-primary/50 ${
                          selectedGroupOption?.id === og.id
                            ? "border-primary bg-primary/5"
                            : "border-muted"
                        }`}
                        onClick={() => handleCheck(og)}
                      >
                        <CardHeader className="w-full">
                          <CardTitle className="flex items-center justify-between gap-4">
                            <span>{og.name}</span>
                            <RadioGroupItem id={og.id} value={og.id} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                          {og.options ? (
                            og.options.map((o) => (
                              <span
                                className="rounded-md border p-2 text-sm"
                                key={o.id}
                              >
                                {o.name} {o.price > 0 && `+ $${o.price}`}
                              </span>
                            ))
                          ) : (
                            <></>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </Label>
                </RadioGroup>
              );
            })
          ) : (
            <div>No hay opciones</div>
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
