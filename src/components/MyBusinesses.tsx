"use client";

import { useEffect, useState } from "react";
import { Business, useBusinessApi } from "@/lib/useBusinessApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import CustomDialog from "@/components/customDialog";
import FormBusiness, { CreateBusinessValues } from "@/components/formBusiness";
import BusinessCard from "@/components/businessCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Store } from "lucide-react";


export default function MyBusinesses() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState<boolean>(false);
    const businessApi = useBusinessApi();
    const { startLoading, stopLoading } = useLoadingStore();

    async function getBusiness() {
        try {
            setIsLoading(true);
            const { data } = await businessApi.getMyBusinesses();
            setBusinesses(data);
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateBusiness(dataCreate: CreateBusinessValues) {
        try {
            startLoading(LoadingsKeyEnum.CREATE_BUSINESS);
            await businessApi.createBusiness(dataCreate);
            await getBusiness();
            toast.success("Negocio creado con éxito", { style: toastSuccessStyle });
            setOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_BUSINESS);
        }
    }

    useEffect(() => {
        getBusiness();
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Mis negocios</h1>
                    <p className="text-muted-foreground">
                        Gestiona y administra tus negocios desde aquí.
                    </p>
                </div>
                <CustomDialog
                    modalTitle="Crear negocio"
                    modalDescription="Ingresa los datos para registrar un nuevo negocio"
                    open={open}
                    setOpen={setOpen}
                    trigger={
                        <Button className="w-full sm:w-auto gap-2 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            Crear negocio
                        </Button>
                    }
                >
                    <FormBusiness
                        buttonTitle="Crear negocio"
                        handleSubmitButton={handleCreateBusiness}
                        loadingKey={LoadingsKeyEnum.CREATE_BUSINESS}
                    />
                </CustomDialog>
            </section>

            {isLoading ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[125px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </section>
            ) : businesses && businesses.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {businesses.map((business) => (
                        <BusinessCard key={business.id} business={business} />
                    ))}
                </section>
            ) : (
                <section className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                        <Store className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No tienes negocios aún</h2>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Comienza creando tu primer negocio para empezar a gestionar tus productos y ventas.
                    </p>
                    <Button onClick={() => setOpen(true)} variant="outline" className="gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        Crear mi primer negocio
                    </Button>
                </section>
            )}
        </div>
    );

}
