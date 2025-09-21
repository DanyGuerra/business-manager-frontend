"use client";

import { Button } from "@/components/ui/button";
import { BusinessFull } from "@/lib/useBusinessApi";
import { Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ProductGroupList from "./ProductGroupList";
import FormProductGroup, {
  ProductGroupValues,
} from "@/components/FormProductGroup";
import { LoadingsKeyEnum } from "@/store/loadingStore";
import React, { useState } from "react";
import CustomDialog from "@/components/formCustomDialog";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { toastErrorStyle, toastSuccessStyle } from "@/lib/toastStyles";
import { useProductGroupApi } from "@/lib/useProductGroupApi";

export default function BusinessContent({
  business,
  getBusiness,
}: {
  business: BusinessFull;
  getBusiness: () => {};
}) {
  const [open, setOpen] = useState<boolean>(false);
  const productGroupApi = useProductGroupApi();

  const handleSubmitButton = async (data: ProductGroupValues) => {
    try {
      await productGroupApi.createProductGroup(data, business.id);
      await getBusiness();
      toast.error("Menú creado", { style: toastSuccessStyle });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message, { style: toastErrorStyle });
      } else {
        toast.error("Algo salió mal", { style: toastErrorStyle });
      }
    } finally {
      setOpen(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          {business.name}
        </h1>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Pencil />
        </Button>
      </div>
      <Separator></Separator>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <h2 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
            Menus
          </h2>
          <CustomDialog
            onOpenChange={setOpen}
            modalTitle="Crear menú"
            modalDescription="Crea un menú de productos para tu negocio"
          >
            <FormProductGroup
              buttonTitle="Crear"
              handleSubmitButton={handleSubmitButton}
              loadingKey={LoadingsKeyEnum.CREATE_BUSINESS}
            />
          </CustomDialog>
        </div>

        {business.productGroup.length > 0 ? (
          <ProductGroupList
            getBusiness={getBusiness}
            productGroups={business.productGroup}
          ></ProductGroupList>
        ) : (
          <div className="flex w-full h-100 items-center justify-center">
            <h1>No hay menus</h1>
          </div>
        )}
      </div>
    </section>
  );
}
