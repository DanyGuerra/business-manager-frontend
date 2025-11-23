"use client";

import FormBusiness, { CreateBusinessValues } from "@/components/formBusiness";
import { Business, useBusinessApi } from "@/lib/useBusinessApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useEffect, useState } from "react";
import BusinessCard from "@/components/businessCard";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import CustomDialog from "@/components/customDialog";
import { handleApiError } from "@/utils/handleApiError";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Store,
  Mail,
  AtSign,
  Pencil,
  Lock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthApi } from "@/lib/useAuthApi";
import { User } from "@/app/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormUpdateName from "@/components/formUpdateName";
import FormUpdatePassword from "@/components/formUpdatePassword";

export default function ProfilePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const businessApi = useBusinessApi();
  const authApi = useAuthApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const [open, setOpen] = useState<boolean>(false);
  const [openPassword, setOpenPassword] = useState<boolean>(false);
  const [openName, setOpenName] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

  async function getUser() {
    try {
      setIsLoadingUser(true);
      const { data } = await authApi.getMe();
      setUser(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoadingUser(false);
    }
  }

  async function handleSubmit(dataCreate: CreateBusinessValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_BUSINESS);
      await businessApi.createBusiness(dataCreate);
      await getBusiness();
      toast.success("Negocio creado con éxito", { style: toastSuccessStyle });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_BUSINESS);
      setOpen(false);
    }
  }

  useEffect(() => {
    getBusiness();
    getUser();
  }, []);

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      <section className="flex flex-col space-y gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal
          </p>
        </div>
        {isLoadingUser ? (
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : user ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex flex-row items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CustomDialog
                      modalTitle="Actualizar nombre"
                      modalDescription="Ingresa el nuevo nombre"
                      open={openName}
                      setOpen={setOpenName}
                      icon={<Pencil className="h-4 w-4" />}
                    >
                      <FormUpdateName
                        defaultName={user.name}
                        onSuccess={(newName) => {
                          setUser({ ...user, name: newName });
                          setOpenName(false);
                        }}
                      />
                    </CustomDialog>
                  </div>
                </div>
              </div>
              <CustomDialog modalDescription="Ingresa tu contraseña actual y la nueva contraseña" modalTitle="Cambiar contraseña" trigger={<Button className='cursor-pointer' variant="outline">
                <Lock className="h-4 w-4" />
                Cambiar contraseña
              </Button>}>


                <FormUpdatePassword onSuccess={() => setOpenPassword(false)} />
              </CustomDialog>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Correo Electrónico
                  </p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 rounded-full bg-primary/10">
                  <AtSign className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Nombre de usuario
                  </p>
                  <p className="text-sm font-medium">{user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

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
          trigger={
            <Button className="w-full sm:w-auto gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Crear negocio
            </Button>
          }
        >
          <FormBusiness
            buttonTitle="Crear negocio"
            handleSubmitButton={handleSubmit}
            loadingKey={LoadingsKeyEnum.CREATE_BUSINESS}
          />
        </CustomDialog>
      </section>

      {
        isLoading ? (
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
        )
      }
    </div >
  );
}
