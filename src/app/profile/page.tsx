"use client";

import FormBusiness, { CreateBusinessValues } from "@/components/formBusiness";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useBusinessApi } from "@/lib/useBusinessApi";
import { toast } from "sonner";
import { toastErrorStyle, toastSuccessStyle } from "@/lib/toastStyles";
import { useState } from "react";
import { AxiosError } from "axios";

export default function ProfilePage() {
  const [open, setOpen] = useState(false);
  const businessApi = useBusinessApi();

  async function handleSubmit(dataCreate: CreateBusinessValues) {
    try {
      await businessApi.createBusiness(dataCreate);
      toast.success("Negocio creado con éxito", { style: toastSuccessStyle });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.message, {
          style: toastErrorStyle,
        });
      } else {
        toast.error("Algo salió mal, intenta mas tarde", {
          style: toastErrorStyle,
        });
      }
    } finally {
      setOpen(false);
    }
  }

  return (
    <section className="flex gap-4 items-center">
      <div>Mis negocios</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="size-8 cursor-pointer">
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear negocio</DialogTitle>
            <DialogDescription>
              Crea un negocio y guardalo en tu perfil
            </DialogDescription>
          </DialogHeader>
          <FormBusiness
            buttonTitle="Crear"
            handleSubmitButton={handleSubmit}
          ></FormBusiness>
        </DialogContent>
      </Dialog>
    </section>
  );
}
