"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessSidebar } from "@/components/BusinessSidebar";
import { useBusinessStore } from "@/store/businessStore";
import { useLoadingStore } from "@/store/loadingStore";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEditModeStore } from "@/store/editModeStore";
import { Edit2Icon, Store, MapPin } from "lucide-react";
import { useEffect, useCallback } from "react";
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


import { usePathname, useRouter } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CartDrawer from "@/components/CartDrawer";
import { useUserRolesStore } from "@/store/userRolesStore";
import { UserRolesBusiness } from "@/lib/useUserRolesBusiness";

interface BusinessLayoutClientProps {
    children: React.ReactNode;
    businessId: string;
    initialUserRoles: UserRolesBusiness[];
}

export default function BusinessLayoutClient({
    children,
    businessId,
    initialUserRoles,
}: BusinessLayoutClientProps) {
    const { business, setBusiness } = useBusinessStore();
    const { isEditMode, setEditMode } = useEditModeStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const businessApi = useBusinessApi();
    const pathname = usePathname();
    const router = useRouter();
    const { setUserRoles } = useUserRolesStore();
    const { canEdit, canDelete } = useUserRolesStore();

    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    useEffect(() => {
        setUserRoles(initialUserRoles);
    }, [initialUserRoles, setUserRoles]);

    const fetchBusiness = useCallback(async (businessId: string) => {
        try {
            startLoading(LoadingsKeyEnum.GET_BUSINESS);
            const { data } = await businessApi.getBusinessById(businessId);
            setBusiness(data);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.GET_BUSINESS);
        }
    }, [businessApi, setBusiness, startLoading, stopLoading]);

    useEffect(() => {
        fetchBusiness(businessId);
    }, [businessId, fetchBusiness]);

    const breadcrumbNameMap: { [key: string]: string } = {
        orders: "Pedidos",
        menus: "Menús",
        products: "Productos",
        "option-groups": "Grupos de Opciones",
        users: "Usuarios",
        board: "Tablero pedidos",
        dashboard: "Estadísticas",
    };

    const segments = pathname.split("/");
    const matchingKey = [...segments].reverse().find((key) => breadcrumbNameMap[key]);
    const pageName = matchingKey ? breadcrumbNameMap[matchingKey] : "";

    async function handleUpdateBusiness(
        data: CreateBusinessValues,
        businessId: string
    ) {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_BUSINESS);
            await businessApi.updateBusiness(businessId, data);

            const res = await businessApi.getBusinessById(businessId);
            setBusiness(res.data);

            toast.success("Se actualizó correctamente el negocio", {
                style: toastSuccessStyle,
            });
            fetchBusiness(businessId);
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsEditModalOpen(false);
            stopLoading(LoadingsKeyEnum.UPDATE_BUSINESS);
        }
    }

    async function handleDeleteBusiness() {
        try {
            await businessApi.deleteBusiness(businessId);

            toast.success("Se eliminó correctamente el negocio", {
                style: toastSuccessStyle,
            });

            router.push("/profile");
        } catch (error) {
            handleApiError(error);
        }
    }



    if (!business) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Skeleton className="h-[40px] w-[30%] rounded-full" />
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <BusinessSidebar businessId={businessId} />
            <SidebarInset className="min-w-0">
                <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 sticky top-14 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger className="-ml-1 cursor-pointer" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href={`/business/${businessId}`}>
                                    {business.name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{pageName}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-col gap-6 flex-1 w-full min-w-0">
                    <div className="w-full sticky top-[6.5rem] z-10 bg-background/50 backdrop-blur-sm px-4 py-2 border-b flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                                <Store className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-sm font-semibold tracking-tight truncate">
                                    {business?.name}
                                </h1>
                                {business.address?.trim() && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <p className="text-xs truncate">{business.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {isEditMode && (
                                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {canEdit() && <CustomDialog
                                        open={isEditModalOpen}
                                        setOpen={setIsEditModalOpen}
                                        modalTitle="Editar negocio"
                                        modalDescription="Edita los datos de tu negocio"
                                        icon={<Edit2Icon className="h-4 w-4" />}
                                        trigger={
                                            <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                                <Edit2Icon className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        }
                                    >
                                        <FormBusiness
                                            buttonTitle="Guardar"
                                            handleSubmitButton={(data) =>
                                                handleUpdateBusiness(data, businessId)
                                            }
                                            loadingKey={LoadingsKeyEnum.UPDATE_BUSINESS}
                                            defaultValues={{
                                                name: business?.name ?? "",
                                                address: business?.address,
                                            }}
                                        />
                                    </CustomDialog>}
                                    {canDelete() && <DeleteDialogConfirmation
                                        handleContinue={handleDeleteBusiness}
                                        title="Eliminar negocio"
                                        description="¿Estás seguro de eliminar el negocio?"
                                        confirmationKeyword={business.name}
                                    />}
                                    <Separator orientation="vertical" className="h-6 mx-1" />
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-mode-global"
                                    checked={isEditMode}
                                    onCheckedChange={setEditMode}
                                />
                                <Label htmlFor="edit-mode-global" className="text-xs font-medium leading-none cursor-pointer">
                                    Modo edición
                                </Label>
                            </div>
                        </div>
                    </div>

                    {children}
                </div>
            </SidebarInset>
            <CartDrawer />
        </SidebarProvider>
    );
}
