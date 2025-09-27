"use client";

import { OptionGroup } from "@/lib/useBusinessApi";
import OptionList from "./OptionList";
import CustomDialog from "@/components/customDialog";
import { ListPlusIcon } from "lucide-react";

type OptionGroupListProps = {
  optionGroups: OptionGroup[];
};

export default function OptionGroupList({
  optionGroups,
}: OptionGroupListProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-3 mt-3">
        <h1 className="text-sm font-bold">Variantes del producto</h1>
        <div className="flex gap-1">
          <CustomDialog
            modalTitle="Agregar variante del producto"
            modalDescription="Agrega un grupo de opciones existente para este producto"
            icon={<ListPlusIcon />}
          >
            <></>
          </CustomDialog>
          <CustomDialog
            modalTitle="Crear variante del producto"
            modalDescription="Crea un nuevo grupo de opciones para este producto"
          >
            <></>
          </CustomDialog>
        </div>
      </div>
      {optionGroups.length > 0 ? (
        <div className="mt-2 space-y-1">
          {optionGroups.map((og) => (
            <div key={og.id}>
              <p className="font-semibold">{og.name}</p>
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
