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
import { Edit2Icon, Store, MapPin, Bell } from "lucide-react";
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
                <div
                    className="group flex w-full sm:w-[356px] max-w-full items-start gap-4 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md transition-all hover:bg-card hover:shadow-primary/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:hover:shadow-primary/5 cursor-pointer"
                    onClick={() => {
                        if (orderId) {

                            if (!pathname.includes('board')) {
                                router.push(`/business/${businessId}/orders/board`);
                                setTimeout(() => {
                                    setHighlightedOrderId(orderId);

                                    const element = document.getElementById(`order-${orderId}`);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }

                                    setTimeout(() => setHighlightedOrderId(null), 8000);
                                }, 3500);
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
                >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 ring-2 ring-background">
                        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary opacity-60 duration-1000" />
                        <Bell className="h-6 w-6 text-primary-foreground fill-primary-foreground/20 transition-transform duration-500 group-hover:rotate-12" />
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5 pt-0.5 justify-center">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-bold text-sm text-foreground leading-tight tracking-tight">
                                ¡Nuevo Pedido!
                                {orderData.order_number && (
                                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                        #{orderData.order_number.toString().padStart(2, '0').slice(-2)}
                                    </span>
                                )}
                            </h3>
                            <span className="flex h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)] animate-pulse" />
                        </div>

                        <p className="text-[10px] text-primary/80 font-bold hover:underline mt-1 flex items-center gap-1 group-hover:text-primary transition-colors cursor-pointer">
                            VER EN EL TABLERO
                            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                        </p>
                    </div>
                </div>
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
                            <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                    <Store className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-sm font-semibold tracking-tight truncate flex items-center gap-2">
                                    {business?.name}
                                    {business?.phone && (
                                        <span className="text-xs font-normal text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm">
                                            {business.phone}
                                        </span>
                                    )}
                                </h1>
                                {(business.address || business.street || business.city) && (
                                    <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <p className="text-xs truncate">
                                            {[
                                                business.street,
                                                business.neighborhood,
                                                business.city && business.state ? `${business.city}, ${business.state}` : business.city || business.state,
                                                business.zipCode,
                                                business.address
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
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
