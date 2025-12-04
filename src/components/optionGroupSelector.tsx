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
import { Card } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { Badge } from "./ui/badge";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type OptionGroupSelectorProps = {
  optionGroups: OptionGroup[];
  productId: string;
  setOpen: (open: boolean) => void;
  className?: string;
};

export default function OptionGroupSelector({
  optionGroups = [],
  productId,
  setOpen,
  className,
}: OptionGroupSelectorProps) {
  const pgApi = useOptionProductGroupApi();
  const [selectedGroupOption, setSelectedGroupOption] =
    useState<OptionGroup | null>(null);

  const { businessId } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();

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

      await getBusiness(businessId);
      toast.success("Se agregó correctamente el grupo de opciones", {
        style: toastSuccessStyle,
      });
      setOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <ScrollArea className={cn("h-48 px-1", className)}>
        {optionGroups.length > 0 ? (
          <RadioGroup
            value={selectedGroupOption?.id ?? ""}
            className="flex flex-col gap-3 w-full"
          >
            {optionGroups.map((og) => {
              const isSelected = selectedGroupOption?.id === og.id;
              return (
                <Label
                  key={og.id}
                  htmlFor={og.id}
                  className="cursor-pointer w-full"
                  onClick={() => handleCheck(og)}
                >
                  <Card
                    className={`relative p-4 transition-all duration-200 border-2 w-full ${isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent bg-muted/30 hover:bg-muted/50"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Layers className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-semibold text-base">{og.name}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {og.options.length > 0 ? (
                            og.options.map((o) => (
                              <Badge
                                key={o.id}
                                variant="secondary"
                                className="font-normal text-xs bg-background/80 border"
                              >
                                {o.name}
                                {o.price > 0 && (
                                  <span className="ml-1 text-muted-foreground font-medium">
                                    +${o.price}
                                  </span>
                                )}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Sin opciones definidas
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-1">
                        <RadioGroupItem
                          value={og.id}
                          id={og.id}
                          className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
                        />
                      </div>
                    </div>
                  </Card>
                </Label>
              );
            })}
          </RadioGroup>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Layers className="h-6 w-6 opacity-50" />
            </div>
            <p className="text-sm font-medium">
              No hay grupos de opciones disponibles
            </p>
          </div>
        )}
      </ScrollArea>

      <div className="pt-2 border-t mt-auto">
        <Button
          disabled={!selectedGroupOption}
          className="w-full h-11 text-base shadow-sm cursor-pointer"
          onClick={handleAddOptionGroup}
        >
          Agregar grupo
        </Button>
      </div>
    </div>
  );
}
