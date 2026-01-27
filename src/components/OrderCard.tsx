
import { Order, ConsumptionType, OrderStatus } from "@/lib/useOrdersApi";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, Utensils, Bike, User, Calendar, Pencil, DollarSign, Eye, GripHorizontal, ChevronDown } from "lucide-react";
import { formatCurrency, cn, getStatusColor, getStatusLabel, getConsumptionLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import CustomDialog from "./customDialog";
import { DeleteDialogConfirmation } from "./deleteDialogConfirmation";
import { useEditModeStore } from "@/store/editModeStore";
import { useBusinessStore } from "@/store/businessStore";
import { OrderGroups } from "./OrderGroups";
import FormOrder, { OrderValues } from "./FormOrder";
import FormPayment, { PaymentValues } from "./FormPayment";
import { useOrdersApi } from "@/lib/useOrdersApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { handleApiError } from "@/utils/handleApiError";
import { useContext, useState } from "react";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useOrdersStore } from "@/store/ordersStore";
import { SortableItemContext } from "@/app/business/[id]/orders/board/SortableItem";

interface OrderCardProps {
    order: Order;
    onOrderUpdate?: () => void;
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

export function OrderCard({ order, onOrderUpdate }: OrderCardProps) {
    const { isEditMode } = useEditModeStore();
    const { businessId } = useBusinessStore();
    const ordersApi = useOrdersApi();
    const { updateOrder, removeOrder } = useOrdersStore();
    const { startLoading, stopLoading } = useLoadingStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { attributes, listeners } = useContext<any>(SortableItemContext) || {};

    const [open, setOpen] = useState(false);
    const [openPay, setOpenPay] = useState(false);
    const [isItemsOpen, setIsItemsOpen] = useState(true);

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
            if (onOrderUpdate) onOrderUpdate();
            setOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    }

    async function handleOrderPayment(data: PaymentValues) {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_ORDER);
            await ordersApi.updateOrder(order.id, { amount_paid: parseFloat(data.amount_paid) }, businessId);
            updateOrder(order.id, {
                ...order,
                amount_paid: data.amount_paid,
            });
            toast.success("Pago registrado correctamente", { style: toastSuccessStyle });
            if (onOrderUpdate) onOrderUpdate();
            setOpenPay(false);
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
            if (onOrderUpdate) onOrderUpdate();
            toast.success("Orden cancelada correctamente", { style: toastSuccessStyle });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    }

    const date = new Date(order.created_at);
    const timeString = format(date, "d MMM yyyy • h:mm a", { locale: es });

    const scheduledTime = order.scheduled_at
        ? format(new Date(order.scheduled_at), "d MMM yyyy • h:mm a", { locale: es })
        : null;

    const totalItems = order.itemGroups.reduce((acc, group) =>
        acc + group.items.reduce((acc2, item) => acc2 + item.quantity, 0), 0
    );

    return (
        <Card className={cn(
            "w-full transition-all pt-8 duration-300 group relative overflow-hidden bg-white dark:bg-card",
            isEditMode ? 'border-dashed border-2 border-primary/20 shadow-none' : 'border border-border/40 shadow-sm hover:shadow-md hover:border-border/60'
        )}>
            {!isEditMode && (
                <div className={cn("absolute left-0 top-0 bottom-0 w-[2px] transition-colors", getStatusColor(order.status))} />
            )}

            {!isEditMode && listeners && (
                <div
                    {...listeners}
                    {...attributes}
                    className="h-10 w-full flex items-center justify-center absolute left-1/2 -translate-x-1/2 -top-1 cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted/50 rounded-md transition-colors z-10 touch-none"
                >
                    <GripHorizontal className="h-4 w-4 text-muted-foreground hover:text-muted-foreground/60" />
                </div>
            )}
            <CardHeader className="p-2.5 pb-1 space-y-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground tracking-tight"># {order?.order_number?.toString().slice(-2)}</span>
                        <Badge variant="outline" className={cn(
                            "text-[10px] px-2 py-0.5 h-5 font-semibold capitalize border max-w-[100px] truncate flex justify-center items-center shadow-sm",
                            getStatusColor(order.status)
                        )}>
                            {getStatusLabel(order.status)}
                        </Badge>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2.5 text-[10px] font-bold text-primary hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-black transition-all rounded-full ml-2 border border-primary shadow-sm"
                        asChild
                    >
                        <a href={`/business/${businessId}/orders/${order.id}`}>
                            <Eye className="h-3 w-3" />
                            Detalles
                        </a>
                    </Button>

                </div>
                {isEditMode && (
                    <div className="flex items-center gap-1 absolute top-1 right-2.5">
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
                )}

                <div className="flex flex-col flex-wrap">
                    <div className={cn(
                        "flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border",
                        "bg-muted/10 border-border/30 text-muted-foreground"
                    )}>
                        <Clock className="h-3 w-3 opacity-70" />
                        <span className="text-[9px] uppercase opacity-70">Creado:</span>
                        <span className="text-[10px] font-medium leading-none capitalize">{timeString}</span>
                    </div>

                    {scheduledTime && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border",
                            "bg-blue-50/50 border-blue-100/50 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                        )}>
                            <Calendar className="h-3 w-3 opacity-90" />
                            <span className="text-[9px] uppercase opacity-70 font-semibold">Entrega:</span>
                            <span className="text-[10px] font-bold leading-none capitalize">{scheduledTime}</span>
                        </div>
                    )}

                    {order.user?.name && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-1.5 py-0.5 text-muted-foreground",
                        )}>
                            <span className="text-[9px] opacity-70 font-medium">Atendido por:</span>
                            <span className="text-[10px] font-bold leading-none capitalize truncate max-w-[80px]">{order.user.name}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col w-full mt-2 pt-2 border-t border-dashed border-border/50 gap-1.5">
                    <div className="flex items-center w-full">
                        <div className="flex items-center gap-2 min-w-0 p-1 border rounded-md w-full bg-muted">
                            <div className="h-5 w-5 rounded-full bg-background flex items-center justify-center shrink-0 border border-border/60 shadow-sm">
                                <User className="h-3 w-3 text-primary/80" />
                            </div>
                            <span className="text-xs font-bold text-foreground truncate capitalize tracking-tight" title={order.customer_name || "Cliente"}>
                                {order.customer_name || "Cliente"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1 bg-muted/20 px-1.5 py-0.5 rounded border border-border/30">
                            {getConsumptionIcon(order.consumption_type)}
                            <span className="font-medium">{getConsumptionLabel(order.consumption_type)}</span>
                        </div>

                        {order.consumption_type === ConsumptionType.DINE_IN && order.table_number && (
                            <div className="flex items-center gap-1 bg-muted/20 px-1.5 py-0.5 rounded border border-border/30">
                                <span className="font-medium">Mesa</span>
                                <span className="font-bold text-foreground">{order.table_number}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <Collapsible open={isItemsOpen} onOpenChange={setIsItemsOpen}>
                <div className="px-2 pb-1">
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full h-7 mt-1 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 bg-muted/50 border border-transparent hover:border-primary/20 shadow-sm transition-all rounded-md gap-2"
                        >
                            {isItemsOpen ? "Ocultar Productos" : `Ver Productos (${totalItems})`}
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isItemsOpen && "rotate-180")} />
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="animate-slide-down">
                    <CardContent className="px-2.5 py-1 text-xs">
                        <OrderGroups order={order} />
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>

            <CardFooter className="px-2.5 pt-1 flex flex-col gap-1.5">


                <div className="flex flex-col gap-1.5 w-full border-t border-dashed border-border/40 pt-2 mt-0">
                    {order.amount_paid ? (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">Pagado</span>
                                <span className="font-medium">{formatCurrency(order.amount_paid)}</span>
                            </div>
                            {order.change && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Cambio</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-bold py-0 h-5 border-0",
                                            parseFloat(order.change) < 0
                                                ? "bg-destructive/10 text-destructive"
                                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        )}
                                    >
                                        {formatCurrency(order.change)}
                                    </Badge>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-1 mt-1 border-t border-border/30">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total</span>
                                <span className="text-lg font-bold leading-none">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</span>
                            <span className="text-lg font-bold">
                                {formatCurrency(order.total)}
                            </span>
                        </div>
                    )}
                </div>
            </CardFooter>

            <div className="px-2.5 pb-2.5 pt-0 flex flex-col gap-1.5">
                {!order.amount_paid && !isEditMode && (
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
                        <FormPayment
                            buttonTitle="Confirmar pago"
                            total={parseFloat(order.total)}
                            loadingKey={LoadingsKeyEnum.UPDATE_ORDER}
                            handleSubmitButton={handleOrderPayment}
                            onSuccess={() => setOpenPay(false)}
                            defaultValues={{
                                amount_paid: order.total.toString(),
                                total: parseFloat(order.total),
                            }}
                        />
                    </CustomDialog>
                )}



                <div className="flex flex-col gap-1.5">
                    {isEditMode && (
                        <DeleteDialogConfirmation
                            title="Cancelar orden"
                            description="¿Estás seguro de cancelar esta orden?"
                            confirmText="Continuar"
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
                    )}
                </div>
            </div>
        </Card >
    );
}
