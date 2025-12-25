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
import { Badge } from "./ui/badge";
import { Layers, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { useBusinessStore } from "@/store/businessStore";

type OptionGroupSelectorProps = {
  optionGroups: OptionGroup[];
  productId: string;
  setOpen: (open: boolean) => void;
  className?: string;
  onRefresh?: () => void;
};

export default function OptionGroupSelector({
  optionGroups = [],
  productId,
  setOpen,
  className,
  onRefresh,
}: OptionGroupSelectorProps) {
  const pgApi = useOptionProductGroupApi();
  const { businessId } = useBusinessStore();
  const [selectedGroupOption, setSelectedGroupOption] =
    useState<OptionGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  function handleCheck(og: OptionGroup) {
    setSelectedGroupOption(og);
  }

  async function handleAddOptionGroup() {
    if (!selectedGroupOption) return;
    try {
      await pgApi.create(
        { option_group_id: selectedGroupOption.id, product_id: productId },
        businessId,
      );

      toast.success("Se agregó correctamente el grupo de opciones", {
        style: toastSuccessStyle,
      });
      setOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      handleApiError(error);
    }
  }

  const filteredOptionGroups = optionGroups.filter((og) =>
    og.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar grupo de opciones..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className={cn("h-[400px] px-1", className)}>
        {filteredOptionGroups.length > 0 ? (
          <RadioGroup
            value={selectedGroupOption?.id ?? ""}
            className="flex flex-col gap-3 w-full"
          >
            {filteredOptionGroups.map((og) => {
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
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
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
          className="w-full h-11 text-base shadow-sm"
          onClick={handleAddOptionGroup}
        >
          Agregar grupo
        </Button>
      </div>
    </div>
  );
}
