"use client";

import CustomDialog from "@/components/customDialog";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OptionGroup, useOptionGroupApi } from "@/lib/useOptionGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { handleApiError } from "@/utils/handleApiError";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

export default function TabOptionGroups() {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const optionGroupApi = useOptionGroupApi();
  const { businessId } = useBusinessStore();

  async function getOptionsGroups() {
    try {
      const { data } = await optionGroupApi.getByBusinessId(businessId);
      setOptionGroups(data);
      console.log(data);
    } catch (error) {
      handleApiError(error);
    }
  }

  useEffect(() => {
    getOptionsGroups();
  }, []);

  return (
    <div className="grid py-4 grid-cols-1 gap-4 sm:grid-cols-2">
      {optionGroups.map((og) => {
        return (
          <Card key={og.id}>
            <CardHeader className="w-full">
              <CardTitle className="flex items-center justify-between">
                <span>{og.name}</span>
                <span>
                  <CustomDialog
                    modalTitle="Editar grupo de opciones"
                    modalDescription={`Editar grupo de opcioones "${og.name}"`}
                    icon={<Pencil />}
                  >
                    <></>
                  </CustomDialog>
                  <DeleteDialogConfirmation handleContinue={() => {}} />
                </span>
              </CardTitle>
              <CardDescription className="flex gap-2 items-center">
                <Badge
                  className={
                    og.available
                      ? "bg-green-100 text-green-700 border-green-300 text-xs"
                      : "bg-red-100 text-red-700 border-red-300 text-xs"
                  }
                >
                  {og.available ? "Disponible" : "No disponible"}
                </Badge>
                <div>Maximo: {og.max_options}</div>
                <div>Minimo: {og.min_options}</div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-wrap gap-2 w-full">
              <div>
                {og.options.length > 0 ? (
                  og.options.map((o) => (
                    <span className="rounded-md border p-2 text-sm" key={o.id}>
                      {o.name} {o.price > 0 && `+ $${o.price}`}
                    </span>
                  ))
                ) : (
                  <div className="p-2 flex justify-center items-center w-full text-muted-foreground">
                    <div className="w-full">No hay opciones</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
