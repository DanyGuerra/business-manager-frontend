'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrdersApi, ConsumptionType, OrderStatus } from "@/lib/useOrdersApi";
import { useBusinessStore } from "@/store/businessStore";
import { OrderDetailsList } from "@/components/OrderDetailsList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Calendar, Clock, Utensils, ShoppingBag, Bike, DollarSign, PencilIcon, Printer, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, getStatusLabel, getStatusColor, cn, getConsumptionLabel } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import CustomDialog from "@/components/customDialog";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { useEditModeStore } from "@/store/editModeStore";
import FormOrder, { OrderValues } from "@/components/FormOrder";
import FormPayment, { PaymentValues } from "@/components/FormPayment";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { useOrdersStore } from "@/store/ordersStore";
import { Pencil } from "lucide-react";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { AddOrderItemsSheet } from "@/components/AddOrderItemsSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { printOrderTicket } from "@/utils/printTicket";

const getConsumptionIcon = (type: string) => {
    switch (type) {
        case ConsumptionType.DINE_IN:
            return <Utensils className="h-4 w-4" />;
        case ConsumptionType.TAKE_AWAY:
            return <ShoppingBag className="h-4 w-4" />;
        case ConsumptionType.DELIVERY:
            return <Bike className="h-4 w-4" />;
        default:
            return <ShoppingBag className="h-4 w-4" />;
    }
};

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const isMobile = useIsMobile();
    const apiOrders = useOrdersApi();
    const { businessId, business } = useBusinessStore();
    const { isEditMode } = useEditModeStore();
    const { removeOrder, updateOrder, activeOrder: order, setActiveOrder: setOrder } = useOrdersStore();
    const { startLoading, stopLoading } = useLoadingStore();

    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [openPay, setOpenPay] = useState(false);

    const orderId = params.orderId as string;

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || !businessId) return;

            try {
                setLoading(true);
                const { data } = await apiOrders.getOrderById(orderId, businessId);
                setOrder(data);
            } catch (error) {
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        return () => {
            setOrder(null);
        }
    }, [orderId, businessId, apiOrders, setOrder]);

    async function handleUpdateOrder(data: OrderValues) {
        if (!order) return;

        const payload = { ...data };
        delete payload.total;

        try {
            startLoading(LoadingsKeyEnum.UPDATE_ORDER);
            const { data: updatedOrder } = await apiOrders.updateOrder(order.id, payload, businessId);


            setOrder(updatedOrder);
            updateOrder(order.id, updatedOrder);
            toast.success("Orden actualizada correctamente", { style: toastSuccessStyle });
            setOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    }

    const handleCancelOrder = async () => {
        if (!order) return;
        try {
            startLoading(LoadingsKeyEnum.UPDATE_ORDER);
            const { data: updatedOrder } = await apiOrders.updateOrder(order.id, { status: OrderStatus.CANCELLED }, businessId);

            setOrder(updatedOrder);
            updateOrder(order.id, updatedOrder);
            toast.success("Orden cancelada", { style: toastSuccessStyle });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    };

    const handleDeleteOrder = async () => {
        if (!order) return;
        try {
            await apiOrders.deleteOrder(order.id, businessId);
            removeOrder(order.id);
            toast.success("Orden eliminada", { style: toastSuccessStyle });
            router.back();
        } catch (error) {
            handleApiError(error);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="h-24 bg-muted animate-pulse rounded-lg" />
                        <div className="h-64 bg-muted animate-pulse rounded-lg" />
                    </div>
                    <div className="h-64 bg-muted animate-pulse rounded-lg" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4 p-8 text-center">
                <div className="p-4 bg-muted rounded-full">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Orden no encontrada</h2>
                <p className="text-muted-foreground max-w-sm">
                    El pedido que buscas no existe o fue eliminado.
                </p>
                <Button onClick={() => router.back()} className="mt-4" variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
            </div>
        );
    }

    const date = new Date(order.created_at);
    const timeString = date.toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const scheduledTime = order.scheduled_at
        ? new Date(order.scheduled_at).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
        : null;



    return (
        <div className="flex flex-col h-full bg-muted/10">
            <div className="flex flex-col border-b bg-background px-4 py-4 md:px-6 md:py-5 gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 -ml-2 mt-0.5" aria-label="Volver">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Orden #{order.order_number}</h2>
                                    <Badge variant="outline" className={cn("text-[10px] h-5 px-2", getStatusColor(order.status))}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded break-all sm:break-normal">
                                    ID: {order.id}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 sm:mt-0">

                                {isEditMode && order.status !== OrderStatus.CANCELLED && (
                                    <DeleteDialogConfirmation
                                        title="Cancelar orden"
                                        description="¿Estás seguro de que deseas cancelar esta orden?"
                                        handleContinue={handleCancelOrder}
                                        trigger={
                                            <Button variant="outline" size="sm" className="h-8 gap-1.5 focus-visible:ring-0 bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm">
                                                <XCircle className="h-4 w-4" />
                                                <span className={cn(isMobile ? "hidden" : "inline")}>Cancelar orden</span>
                                            </Button>
                                        }
                                        confirmText="Sí, cancelar"
                                    />
                                )}

                                {isEditMode && (
                                    <>
                                        <CustomDialog
                                            open={open}
                                            setOpen={setOpen}
                                            modalTitle="Editar orden"
                                            modalDescription="Modifica los detalles de la orden"
                                            trigger={
                                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted transition-colors">
                                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                            }
                                        >
                                            <FormOrder
                                                buttonTitle="Guardar cambios"
                                                loadingKey={LoadingsKeyEnum.UPDATE_ORDER}
                                                handleSubmitButton={handleUpdateOrder}
                                                onSuccess={() => setOpen(false)}
                                                defaultValues={{
                                                    customer_name: order.customer_name,
                                                    amount_paid: order.amount_paid ? parseFloat(order.amount_paid) : null,
                                                    total: parseFloat(order.total),
                                                    notes: order.notes,
                                                    consumption_type: order.consumption_type as ConsumptionType,
                                                    scheduled_at: order.scheduled_at ? new Date(order.scheduled_at) : undefined,
                                                    table_number: order.table_number,
                                                    status: order.status as OrderStatus,
                                                }}
                                            />

                                        </CustomDialog>

                                        <DeleteDialogConfirmation
                                            title="Eliminar orden"
                                            description="¿Estás seguro de que deseas eliminar esta orden?"
                                            handleContinue={handleDeleteOrder}
                                        />

                                    </>
                                )}
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => printOrderTicket(order, business)}
                                    className="h-8 gap-1.5"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span className={cn(isMobile ? "hidden" : "inline")}>Imprimir</span>
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 opacity-70" />
                                <span className="text-[10px] uppercase opacity-70 font-semibold">Creado: </span>
                                <span className="text-[11px] font-bold leading-none">{timeString}</span>

                            </div>

                            {scheduledTime && (
                                <div className={cn(
                                    "flex gap-1.5 py-0.5 rounded-sm border",
                                    "bg-blue-50/50 border-blue-100/50 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                                )}>
                                    <Calendar className="h-3 w-3 opacity-90" />
                                    <span className="text-[10px] uppercase opacity-70 font-semibold">Fecha a entregar:</span>
                                    <span className="text-[11px] font-bold leading-none">{scheduledTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {/* Main Content - Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-semibold">
                                    Detalle del Pedido
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <AddOrderItemsSheet
                                        order={order}
                                        defaultView="cart"
                                        onSuccess={(updatedOrder) => {
                                            if (updatedOrder) setOrder(updatedOrder);
                                        }}
                                        trigger={
                                            <Button variant="default" size="sm" className="flex items-center justify-center gap-1 h-8 px-2">
                                                <PencilIcon className="h-4 w-4" />
                                                <span className={cn(isMobile ? "hidden" : "inline")}>Editar Orden</span>
                                            </Button>
                                        }
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <OrderDetailsList order={order} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Summary & Customer Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Información del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.customer_name || "Cliente General"}</p>
                                        <p className="text-muted-foreground text-xs">Cliente</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        {getConsumptionIcon(order.consumption_type)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{getConsumptionLabel(order.consumption_type)}</p>
                                        <p className="text-muted-foreground text-xs">Tipo de consumo</p>
                                    </div>
                                </div>
                                {order.table_number && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <span className="font-bold text-xs">#</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Mesa {order.table_number}</p>
                                                <p className="text-muted-foreground text-xs"># Mesa</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Resumen de Pago</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="text-xl font-bold">{formatCurrency(order.total)}</span>
                                </div>
                                {order.amount_paid ? (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Pagado</span>
                                            <span className="font-medium">{formatCurrency(order.amount_paid)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Cambio</span>
                                            <span className={cn(
                                                "font-medium",
                                                parseFloat(order.change || '0') < 0 ? "text-destructive" : "text-emerald-600"
                                            )}>
                                                {formatCurrency(order.change || '0')}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pt-2">
                                        <CustomDialog
                                            open={openPay}
                                            setOpen={setOpenPay}
                                            modalTitle="Pagar orden"
                                            modalDescription="Ingresa el monto"
                                            trigger={
                                                <Button className="font-bold w-full h-8 text-xs shadow-none bg-primary/90 hover:bg-primary" size="sm">
                                                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                                    Pagar Orden
                                                </Button>
                                            }
                                        >
                                            <FormPayment
                                                total={Number(order.total)}
                                                buttonTitle="Confirmar pago"
                                                loadingKey={LoadingsKeyEnum.UPDATE_ORDER}
                                                handleSubmitButton={(data: PaymentValues) => handleUpdateOrder({
                                                    amount_paid: parseFloat(data.amount_paid),
                                                } as OrderValues)}
                                                onSuccess={() => setOpenPay(false)}
                                                defaultValues={{
                                                    amount_paid: order.total.toString(),
                                                    total: parseFloat(order.total),
                                                }}
                                            />
                                        </CustomDialog>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div >
            </div >
        </div >
    );
}
