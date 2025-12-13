
import { Order, OrderStatus, ConsumptionType } from "@/lib/useOrdersApi";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, Utensils, Bike, User, Calendar, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
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

interface OrderCardProps {
    order: Order;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case OrderStatus.PENDING:
            return "bg-yellow-500 hover:bg-yellow-600";
        case OrderStatus.PREPARING:
            return "bg-blue-500 hover:bg-blue-600";
        case OrderStatus.READY:
            return "bg-green-500 hover:bg-green-600";
        case OrderStatus.COMPLETED:
            return "bg-slate-500 hover:bg-slate-600";
        default:
            return "bg-gray-500";
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case OrderStatus.PENDING:
            return "Pendiente";
        case OrderStatus.PREPARING:
            return "Preparando";
        case OrderStatus.READY:
            return "Listo";
        case OrderStatus.COMPLETED:
            return "Completado";
        default:
            return status;
    }
};

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

const getConsumptionLabel = (type: string) => {
    switch (type) {
        case ConsumptionType.DINE_IN:
            return "Comer Aquí";
        case ConsumptionType.TAKE_AWAY:
            return "Para Llevar";
        case ConsumptionType.DELIVERY:
            return "Domicilio";
        default:
            return type;
    }
};

import { useOrdersStore } from "@/store/ordersStore";

export function OrderCard({ order }: OrderCardProps) {
    const { isEditMode } = useEditModeStore();
    const { businessId } = useBusinessStore();
    const ordersApi = useOrdersApi();
    const { updateOrder, removeOrder } = useOrdersStore();
    const { startLoading, stopLoading } = useLoadingStore();

    const [open, setOpen] = useState(false);

    async function handleUpdateOrder(data: OrderValues) {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_ORDER);
            await ordersApi.updateOrder(order.id, data, businessId);
            updateOrder(order.id, {
                ...data,
                scheduled_at: data.scheduled_at?.toISOString() ?? null
            });
            toast.success("Orden actualizada correctamente", { style: toastSuccessStyle });
            setOpen(false);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    }

    const date = new Date(order.created_at);
    const timeString = date.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

    const scheduledTime = order.scheduled_at
        ? new Date(order.scheduled_at).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : "Ahora";

    return (
        <Card className={`w-full pt-8 hover:shadow-md transition-shadow duration-200 border-l-[3px] group relative overflow-hidden ${isEditMode ? 'border-dashed border-2 border-primary/40' : ''}`}
            style={!isEditMode ? { borderLeftColor: getStatusColor(order.status).replace('bg-', '').replace('hover:', '').split(' ')[0].replace('500', '600') } : undefined}>
            {!isEditMode && <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${getStatusColor(order.status)}`} />}

            <CardHeader className="p-3 pb-2 space-y-0 relative">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-0.5">Orden ID</span>
                            <div className="flex items-center gap-0.5">
                                <span className="text-muted-foreground/60 text-lg font-light leading-none">#</span>
                                <span className="font-bold text-xl text-foreground leading-none tracking-tight">{order.id.slice(0, 4)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex items-center text-muted-foreground text-[10px]">
                                <Clock className="h-3 w-3 mr-1.5 opacity-70" />
                                <span className="opacity-70 mr-1 font-medium">Creado:</span>
                                <span className="font-semibold">{timeString}</span>
                            </div>
                            <div className="flex items-center text-foreground/90 text-[10px]">
                                <Calendar className="h-3 w-3 mr-1.5 opacity-70 text-primary" />
                                <span className="opacity-70 mr-1 font-medium">Entrega:</span>
                                <span className="font-bold">{scheduledTime}</span>
                            </div>
                        </div>
                    </div>

                    {isEditMode ? (
                        <div className="flex items-center gap-2 absolute top-2 right-2">
                            <CustomDialog
                                open={open}
                                setOpen={setOpen}
                                modalTitle="Editar orden"
                                modalDescription="Modifica los detalles de la orden"
                                trigger={
                                    <Button variant="outline" size="icon" className="h-7 w-7">
                                        <Pencil className="h-3.5 w-3.5" />
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
                                        notes: order.notes,
                                        consumption_type: order.consumption_type as ConsumptionType,
                                        scheduled_at: order.scheduled_at ? new Date(order.scheduled_at) : undefined,
                                    }}
                                />
                            </CustomDialog>

                            <DeleteDialogConfirmation
                                title="Eliminar orden"
                                description="¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer."
                                handleContinue={async () => {
                                    try {
                                        await ordersApi.deleteOrder(order.id, businessId);
                                        removeOrder(order.id);
                                        toast.success("Orden eliminada correctamente", { style: toastSuccessStyle });
                                    } catch (error) {
                                        handleApiError(error);
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <Badge variant="outline" className={`${getStatusColor(order.status)}/10 text-foreground border-0 text-[11px] px-2 py-0.5 h-5 font-semibold capitalize`}>
                            {getStatusLabel(order.status)}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <Separator className="bg-primary/40 h-[3px]" />

            <CardContent className="p-3 text-sm">
                <OrderGroups order={order} />
            </CardContent>

            <CardFooter className="p-3 pt-2 bg-muted/5 flex justify-between items-center text-xs gap-8">
                <div className="flex flex-col gap-1 text-muted-foreground flex-1">
                    <div className="flex items-center gap-1.5 w-full">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium">{order.customer_name || "Cliente"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 w-full">
                        {getConsumptionIcon(order.consumption_type)}
                        <span className="font-medium">{getConsumptionLabel(order.consumption_type)}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {order.amount_paid && (
                        <div className="flex flex-col items-end text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <span>Paga con:</span>
                                <span className="font-medium text-foreground">{formatCurrency(order.amount_paid)}</span>
                            </div>
                            {order.change && (
                                <div className="flex items-center gap-1">
                                    <span>Cambio:</span>
                                    <span className={cn(
                                        "font-medium",
                                        parseFloat(order.change) < 0 ? "text-destructive" : "text-green-600"
                                    )}>
                                        {formatCurrency(order.change)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total</span>
                        <Badge variant="default" className="text-sm font-bold">
                            {formatCurrency(order.total)}
                        </Badge>
                    </div>
                </div>
            </CardFooter>
        </Card >
    );
}

