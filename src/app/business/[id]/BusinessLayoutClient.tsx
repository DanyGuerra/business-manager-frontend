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
import { Edit2Icon, Store } from "lucide-react";
import { useEffect, useCallback, useRef } from "react";
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
import { Order } from "@/lib/useOrdersApi";
import CartDrawer from "@/components/CartDrawer";
import { useUserRolesStore } from "@/store/userRolesStore";
import { UserRolesBusiness } from "@/lib/useUserRolesBusiness";
import { useSocket } from "@/context/SocketContext";

import { useOrdersStore } from "@/store/ordersStore";

import { NewOrderToast } from "@/components/NewOrderToast";


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
    const { setUserRoles, setCurrentBusinessId } = useUserRolesStore();
    const { canEdit, canDelete } = useUserRolesStore();
    const { socket, isConnected } = useSocket();
    const { setHighlightedOrderId } = useOrdersStore();

    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/sounds/notification.m4a');

        const unlockAudio = () => {
            if (audioRef.current) {
                audioRef.current.play().catch(() => { });
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    useEffect(() => {
        if (!socket || !isConnected || !businessId) return;

        socket.emit('joinBusiness', businessId);

        const handleOrderCreated = (orderData: Order) => {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }

            const orderId = orderData?.id;

            toast.custom(() => (
                <NewOrderToast
                    orderData={orderData}
                    onClick={() => {
                        if (orderId) {
                            if (!pathname.endsWith(`/orders/board`)) {
                                router.push(`/business/${businessId}/orders/board`);
                                setTimeout(() => {
                                    setHighlightedOrderId(orderId);

                                    const element = document.getElementById(`order-${orderId}`);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }

                                    setTimeout(() => setHighlightedOrderId(null), 8000);
                                }, 800);
                            } else {
                                setTimeout(() => {
                                    setHighlightedOrderId(orderId);

                                    const element = document.getElementById(`order-${orderId}`);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }

                                    setTimeout(() => setHighlightedOrderId(null), 8000);
                                }, 100);
                            }
                        }
                    }}
                />
            ), { duration: 5000 });
        };

        socket.on('orderCreated', handleOrderCreated);

        return () => {
            socket.emit('leaveBusiness', businessId);
            socket.off('orderCreated', handleOrderCreated);
        };
    }, [socket, isConnected, businessId, pathname, router, setHighlightedOrderId]);

    useEffect(() => {
        setCurrentBusinessId(businessId);
        if (initialUserRoles && initialUserRoles.length > 0) {
            setUserRoles(businessId, initialUserRoles);
        }
    }, [businessId, initialUserRoles, setCurrentBusinessId, setUserRoles]);

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
                <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b px-4 sticky top-14 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 cursor-pointer h-7 w-7" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList className="sm:gap-1">
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href={`/business/${businessId}`} className="text-xs font-semibold px-2 py-1 rounded-md transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <Store className="h-3 w-3 text-primary" />
                                            {business.name}
                                        </div>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-xs font-medium bg-muted/50 px-2 py-1 rounded-md">{pageName}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
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
                                            street: business?.street,
                                            neighborhood: business?.neighborhood,
                                            city: business?.city,
                                            state: business?.state,
                                            zipCode: business?.zipCode,
                                            phone: business?.phone,
                                        }}
                                    />
                                </CustomDialog>}
                                {canDelete() && <DeleteDialogConfirmation
                                    handleContinue={handleDeleteBusiness}
                                    title="Eliminar negocio"
                                    description="¿Estás seguro de eliminar el negocio?"
                                    confirmationKeyword={business.name}
                                />}
                                <Separator orientation="vertical" className="h-4 mx-1" />
                            </div>
                        )}
                        <div className="flex items-center space-x-1.5 bg-muted/30 px-2 py-1 rounded-md border text-xs">
                            <Switch
                                id="edit-mode-global"
                                checked={isEditMode}
                                onCheckedChange={setEditMode}
                                className="scale-75 data-[state=checked]:bg-primary"
                            />
                            <Label htmlFor="edit-mode-global" className="text-[10px] font-medium leading-none cursor-pointer uppercase tracking-wider text-muted-foreground">
                                Modo Edición
                            </Label>
                        </div>
                    </div>
                </header>
                <div className="flex flex-col gap-1 flex-1 w-full min-w-0">

                    <div className="py-2 px-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
            <CartDrawer />
        </SidebarProvider>
    );
}
