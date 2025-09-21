"use client";

import FormBusiness, { CreateBusinessValues } from "@/components/formBusiness";
import { Business, useBusinessApi } from "@/lib/useBusinessApi";
import { toast } from "sonner";
import { toastErrorStyle, toastSuccessStyle } from "@/lib/toastStyles";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import BusinessCard from "@/components/businessCard";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import CustomDialog from "@/components/formCustomDialog";

export default function ProfilePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const businessApi = useBusinessApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const [open, setOpen] = useState<boolean>(false);

  async function getBusiness() {
    try {
      const { data } = await businessApi.getMyBusinesses();
      setBusinesses(data);
    } catch (error) {
      toast.error("Algo salió mal al cargar los negocios");
    }
  }

  async function handleSubmit(dataCreate: CreateBusinessValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_BUSINESS);
      await businessApi.createBusiness(dataCreate);
      await getBusiness();
      toast.success("Negocio creado con éxito", { style: toastSuccessStyle });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message, {
          style: toastErrorStyle,
        });
      } else {
        toast.error("Algo salió mal, intenta mas tarde", {
          style: toastErrorStyle,
        });
      }
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_BUSINESS);
      setOpen(false);
    }
  }

  useEffect(() => {
    getBusiness();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <section className="flex gap-4 items-center">
        <h1 className="text-2xl font-bold">Mis negocios</h1>
        <CustomDialog
          onOpenChange={setOpen}
          modalTitle="Crear negocio"
          modalDescription="Crea un negocio"
        >
          <FormBusiness
            buttonTitle="Crear"
            handleSubmitButton={handleSubmit}
            loadingKey={LoadingsKeyEnum.CREATE_BUSINESS}
          ></FormBusiness>
        </CustomDialog>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {businesses && businesses.length > 0
          ? businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
              ></BusinessCard>
            ))
          : "No hay negocios"}
      </section>
    </div>
  );
}
