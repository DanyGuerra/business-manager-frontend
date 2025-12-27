
import { Order, ConsumptionType, OrderStatus } from "@/lib/useOrdersApi";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, Utensils, Bike, User, Calendar, Pencil, DollarSign } from "lucide-react";
import { formatCurrency, cn, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import CustomDialog from "./customDialog";
import { DeleteDialogConfirmation } from "./deleteDialogConfirmation";
import { useEditModeStore } from "@/store/editModeStore";
import { useBusinessStore } from "@/store/businessStore";
import { OrderGroups } from "./OrderGroups";
import FormOrder, { OrderValues } from "./FormOrder";
import { useOrdersApi } from "@/lib/useOrdersApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { handleApiError } from "@/utils/handleApiError";
import { useState } from "react";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useOrdersStore } from "@/store/ordersStore";
import { useGetOrders } from "@/app/hooks/useGetOrders";

interface OrderCardProps {
    order: Order;
}

const getConsumptionIcon = (type: string) => {
    switch (type) {
        case ConsumptionType.DINE_IN:
            return <Utensils className="h-3 w-3" />;
        case ConsumptionType.TAKE_AWAY:
            return <ShoppingBag className="h-3 w-3" />;
        case ConsumptionType.DELIVERY:
            return <Bike className="h-3 w-3" />;
        default:
            return <ShoppingBag className="h-3 w-3" />;
    }
};

const getConsumptionLabel = (type: string) => {
    switch (type) {
        case ConsumptionType.DINE_IN:
            return "Comer aqui";
        case ConsumptionType.TAKE_AWAY:
            return "Llevar";
        case ConsumptionType.DELIVERY:
            return "Domicilio";
        default:
            return type;
    }
};

export function OrderCard({ order }: OrderCardProps) {
    const { isEditMode } = useEditModeStore();
    const { businessId } = useBusinessStore();
    const ordersApi = useOrdersApi();
    const { updateOrder, removeOrder } = useOrdersStore();
    const { startLoading, stopLoading } = useLoadingStore();
    const { getOrders } = useGetOrders();

    const [open, setOpen] = useState(false);
    const [openPay, setOpenPay] = useState(false);

    async function handleUpdateOrder(data: OrderValues) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { total, ...rest } = data;
        try {
            startLoading(LoadingsKeyEnum.UPDATE_ORDER);
            await ordersApi.updateOrder(order.id, rest, businessId);
            updateOrder(order.id, {
                ...rest,
                amount_paid: rest.amount_paid?.toString() ?? null,
                scheduled_at: rest.scheduled_at?.toISOString() ?? null
            });
            toast.success("Orden actualizada correctamente", { style: toastSuccessStyle });
            getOrders();
            setOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    }

    async function handleCancelOrder() {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_ORDER);
            await ordersApi.updateOrder(order.id, { status: OrderStatus.CANCELLED }, businessId);
            getOrders();
            toast.success("Orden cancelada correctamente", { style: toastSuccessStyle });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    }

    const date = new Date(order.created_at);
    const timeString = date.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
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
        <Card className={cn(
            "w-full transition-all duration-300 group relative overflow-hidden bg-white dark:bg-card",
            isEditMode ? 'border-dashed border-2 border-primary/20 shadow-none' : 'border border-border/40 shadow-sm hover:shadow-md hover:border-border/60'
        )}>
            {!isEditMode && (
                <div className={cn("absolute left-0 top-0 bottom-0 w-[2px] transition-colors", getStatusColor(order.status))} />
            )}
            <CardHeader className="p-3 pb-1 space-y-0 relative">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground tracking-tight"># {order.order_number.toString().slice(-2)}</span>
                    </div>

                    {isEditMode ? (
                        <div className="flex items-center gap-1 absolute top-2 right-2">
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
                                        amount_paid: order.amount_paid ? parseFloat(order.amount_paid) : parseFloat(order.total),
                                        total: parseFloat(order.total),
                                        notes: order.notes,
                                        consumption_type: order.consumption_type as ConsumptionType,
                                        scheduled_at: order.scheduled_at ? new Date(order.scheduled_at) : undefined,
                                        table_number: order.table_number,
                                    }}
                                />
                            </CustomDialog>

                            <DeleteDialogConfirmation
                                title="Eliminar orden"
                                description="¿Estás seguro de que deseas eliminar esta orden?"
                                handleContinue={async () => {
                                    try {
                                        await ordersApi.deleteOrder(order.id, businessId);
                                        removeOrder(order.id);
                                        toast.success("Orden eliminada", { style: toastSuccessStyle });
                                    } catch (error) {
                                        handleApiError(error);
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <Badge variant="outline" className={cn(
                            "text-[9px] px-1.5 py-0 h-4 font-normal capitalize border-border/60 text-muted-foreground",
                        )}>
                            {getStatusLabel(order.status)}
                        </Badge>
                    )}
                </div>
                {!isEditMode && (
                    <div className="flex flex-col">
                        <div className={cn(
                            "flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border",
                            "bg-muted/10 border-border/30 text-muted-foreground"
                        )}>
                            <Clock className="h-3 w-3 opacity-70" />
                            <span className="text-[9px] uppercase opacity-70">Creado:</span>
                            <span className="text-[10px] font-medium leading-none">{timeString}</span>
                        </div>

                        {scheduledTime && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border",
                                "bg-blue-50/50 border-blue-100/50 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                            )}>
                                <Calendar className="h-3 w-3 opacity-90" />
                                <span className="text-[9px] uppercase opacity-70 font-semibold">Entrega:</span>
                                <span className="text-[10px] font-bold leading-none">{scheduledTime}</span>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex flex-col gap-1 w-full text-[10px] text-muted-foreground mt-2 pt-2 border-t border-dashed border-border/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                                <User className="h-3 w-3 opacity-70" />
                                <span className="font-medium truncate">{order.customer_name || "Cliente"}</span>
                            </div>
                            <span className="opacity-30">|</span>
                            <div className="flex items-center gap-1">
                                {getConsumptionIcon(order.consumption_type)}
                                <span>{getConsumptionLabel(order.consumption_type)}</span>
                                {order.consumption_type === ConsumptionType.DINE_IN && order.table_number && (
                                    <span className="ml-1 font-medium"> (Mesa: {order.table_number})</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {order.user?.name && (
                        <div className="flex items-center gap-1 text-[9px] opacity-80">
                            <User className="h-2.5 w-2.5 opacity-50" />
                            <span>Atendido por: {order.user.name}</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-3 py-1.5 text-xs">
                <OrderGroups order={order} />
            </CardContent>

            <CardFooter className="p-3 pt-1 flex flex-col gap-2">


                <div className="flex items-center justify-between w-full border-t border-dashed border-border/40 pt-2 mt-0.5">
                    <div className="flex items-center gap-2 text-[10px]">
                        {order.amount_paid && (
                            <>
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">Pagado:</span>
                                    <span className="font-medium">{formatCurrency(order.amount_paid)}</span>
                                </div>
                                {order.change && (
                                    <div className="flex gap-1">
                                        <span className="text-muted-foreground">Cambio:</span>
                                        <span className={cn(
                                            "font-medium",
                                            parseFloat(order.change) < 0 ? "text-destructive" : "text-emerald-600"
                                        )}>
                                            {formatCurrency(order.change)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <span className="text-sm font-bold text-foreground">{formatCurrency(order.total)}</span>
                </div>
            </CardFooter>

            {!order.amount_paid && !isEditMode && (
                <div className="px-3 pb-3 pt-0">
                    <CustomDialog
                        open={openPay}
                        setOpen={setOpenPay}
                        modalTitle="Pagar orden"
                        modalDescription="Ingresa el monto"
                        trigger={
                            <Button className="font-bold w-full h-7 text-[12px] font-medium shadow-none bg-primary/90 hover:bg-primary" size="sm">
                                <DollarSign className="h-3 w-3 mr-1.5" />
                                Pagar
                            </Button>
                        }
                    >
                        <FormOrder
                            buttonTitle="Confirmar pago"
                            loadingKey={LoadingsKeyEnum.UPDATE_ORDER}
                            handleSubmitButton={handleUpdateOrder}
                            onSuccess={() => setOpenPay(false)}
                            defaultValues={{
                                customer_name: order.customer_name,
                                amount_paid: parseFloat(order.total),
                                total: parseFloat(order.total),
                                notes: order.notes,
                                consumption_type: order.consumption_type as ConsumptionType,
                                scheduled_at: order.scheduled_at ? new Date(order.scheduled_at) : undefined,
                            }}
                        />
                    </CustomDialog>
                </div>
            )}

            {isEditMode && (
                <div className="px-3 pb-3 pt-0">
                    <DeleteDialogConfirmation
                        title="Cancelar orden"
                        description="¿Cancelar orden?"
                        confirmText="Cancelar"
                        trigger={
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-7 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all text-[10px]"
                            >
                                Cancelar Orden
                            </Button>
                        }
                        handleContinue={handleCancelOrder}
                    />
                </div>
            )}
        </Card>
    );
}
