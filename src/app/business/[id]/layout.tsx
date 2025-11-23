"use client";

import React, { useEffect } from "react";
import { BusinessSidebar } from "@/components/BusinessSidebar";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { useBusinessStore } from "@/store/businessStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadingStore } from "@/store/loadingStore";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useEditModeStore } from "@/store/editModeStore";
import { Edit2Icon, FilePenIcon, Store, MapPin } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import CustomDialog from "@/components/customDialog";
import FormBusiness, { CreateBusinessValues } from "@/components/formBusiness";
import { LoadingsKeyEnum } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessApi } from "@/lib/useBusinessApi";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { useRouter, usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { getBusiness } = useFetchBusiness();
  const { business } = useBusinessStore();
  const { loadings } = useLoadingStore();
  const { isEditMode, setEditMode } = useEditModeStore();
  const businessApi = useBusinessApi();
  const router = useRouter();
  const pathname = usePathname();

  const breadcrumbNameMap: { [key: string]: string } = {
    orders: "Pedidos",
    menus: "Menús",
    products: "Productos",
    "option-groups": "Grupos de Opciones",
    users: "Usuarios",
  };

  const segments = pathname.split("/");
  const lastSegment = segments[segments.length - 1];
  const pageName = breadcrumbNameMap[lastSegment] || "Dashboard";

  useEffect(() => {
    getBusiness(id);
  }, [id]);

  async function handleUpdateBusiness(
    data: CreateBusinessValues,
    businessId: string
  ) {
    try {
      await businessApi.updateBusiness(businessId, data);
      await getBusiness(businessId);

      toast.success("Se actualizó correctamente el negocio", {
        style: toastSuccessStyle,
      });
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleDeleteBusiness() {
    try {
      await businessApi.deleteBusiness(id);

      toast.success("Se eliminó correctamente el negocio", {
        style: toastSuccessStyle,
      });

      router.push("/profile");
    } catch (error) {
      handleApiError(error);
    }
  }

  if (loadings["getBusiness"]) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-[40px] w-[30%] rounded-full" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-muted-foreground text-2xl font-bold">
          No se encontró el negocio
        </h1>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <BusinessSidebar businessId={id} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-14 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/business/${id}`}>
                  Mi negocio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-col gap-6 p-6">
          <div className="w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:space-y-0 pb-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {business?.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground ml-1">
                  {business.address?.trim() ? (
                    <>
                      <MapPin className="h-4 w-4" />
                      <p>{business.address}</p>
                    </>
                  ) : null}
                </div>
              </div>


              <div className="flex items-center gap-3 self-end md:self-auto">
                {isEditMode && (
                  <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-4 duration-300">
                    <CustomDialog
                      modalTitle="Editar negocio"
                      modalDescription="Edita los datos de tu negocio"
                      icon={<Edit2Icon className="h-4 w-4" />}
                    >
                      <FormBusiness
                        buttonTitle="Guardar"
                        handleSubmitButton={(data) =>
                          handleUpdateBusiness(data, id)
                        }
                        loadingKey={LoadingsKeyEnum.UPDATE_BUSINESS}
                        defaultValues={{
                          name: business?.name ?? "",
                          address: business?.address,
                        }}
                      />
                    </CustomDialog>
                    <DeleteDialogConfirmation
                      handleContinue={handleDeleteBusiness}
                    />
                    <Separator orientation="vertical" className="h-6 mx-1" />
                  </div>
                )}
                <Toggle
                  className="cursor-pointer gap-2 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                  pressed={isEditMode}
                  onPressedChange={(state) => setEditMode(state)}
                  aria-label="Toggle edit mode"
                >
                  <FilePenIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Modo edición</span>
                </Toggle>
              </div>
            </div>
          </div>

          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
