"use client";

import React, { useRef } from "react";
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
import { useRouter, usePathname } from "next/navigation";
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
    const router = useRouter();
    const pathname = usePathname();
    const { setUserRoles } = useUserRolesStore();

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            setUserRoles(initialUserRoles);
            initialized.current = true;
        }
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
    };

    const segments = pathname.split("/");
    const lastSegment = segments[segments.length - 1];
    const pageName = breadcrumbNameMap[lastSegment] || "Dashboard";

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
        } catch (error) {
            handleApiError(error);
        } finally {
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
        <SidebarProvider>
            <BusinessSidebar businessId={businessId} />
            <SidebarInset className="min-w-0">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-14 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    <div className="w-full sticky top-[7.5rem] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 border-b ">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:space-y-0">
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
                                                    handleUpdateBusiness(data, businessId)
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
                                            title="Eliminar negocio"
                                            description="¿Estás seguro de eliminar el negocio?"
                                            confirmationKeyword={business.name}
                                        />
                                        <Separator orientation="vertical" className="h-6 mx-1" />
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="edit-mode-global"
                                        checked={isEditMode}
                                        onCheckedChange={setEditMode}
                                    />
                                    <Label htmlFor="edit-mode-global" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Modo edición
                                    </Label>
                                </div>
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
