
import { Order, OrderStatus, ConsumptionType, useOrdersApi } from "@/lib/useOrdersApi";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, Utensils, Bike, User, FileText, Calendar, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import CustomDialog from "./customDialog";
import { DeleteDialogConfirmation } from "./deleteDialogConfirmation";
import { useEditModeStore } from "@/store/editModeStore";
import { useBusinessStore } from "@/store/businessStore";

interface OrderCardProps {
    order: Order;
    onDelete: (orderId: string, businessId: string) => void;
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

export function OrderCard({ order, onDelete }: OrderCardProps) {
    const { isEditMode } = useEditModeStore();
    const { businessId } = useBusinessStore();

    const date = new Date(order.created_at);
    const timeString = date.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

    const scheduledTime = order.scheduled_at
        ? new Date(order.scheduled_at).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : "Ahora";

    return (
        <Card className={`w-full pt-8 hover:shadow-md transition-shadow duration-200 border-l-[3px] group relative overflow-hidden ${isEditMode ? 'border-dashed border-2' : ''}`}
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
                                modalTitle="Editar orden"
                                modalDescription="Modifica los detalles de la orden"
                                trigger={
                                    <Button variant="outline" size="icon" className="h-7 w-7">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                }
                            >
                                <div className="p-4"></div>
                            </CustomDialog>

                            <DeleteDialogConfirmation
                                title="Eliminar orden"
                                description="¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer."
                                handleContinue={async () => {
                                    onDelete(order.id, businessId);
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

            <Separator className="opacity-30" />

            <CardContent className="p-3 text-sm">
                <div className="flex flex-col gap-3">
                    {order.itemGroups.flatMap(g => g.items).map((item, index) => (
                        <div key={item.id + index} className="flex items-start gap-2.5 pb-2 border-b border-border/40 last:border-0 last:pb-0">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-xs font-bold text-primary shadow-sm mt-0.5">
                                {item.quantity}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-semibold text-base text-foreground leading-tight">
                                        {item.product.name}
                                    </span>
                                    <span className="text-xs font-bold text-foreground/90 whitespace-nowrap">
                                        {formatCurrency(item.item_total)}
                                    </span>
                                </div>
                                {item.grouped_options && Object.keys(item.grouped_options).length > 0 && (
                                    <div className="flex flex-col gap-1 mt-1 text-[12px]">
                                        {Object.entries(item.grouped_options).map(([groupName, options]) => (
                                            <div key={groupName} className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-muted-foreground/60">{groupName}:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {options.map((opt, i) => (
                                                        <Badge
                                                            key={`${groupName}-${i}`}
                                                            variant="outline"
                                                            className="flex items-baseline rounded-full px-2 py-0.5 h-auto min-h-[20px] font-medium bg-primary/10 text-primary border-primary/20 shadow-sm hover:bg-primary/15 transition-colors"
                                                        >
                                                            {opt.name}
                                                            {opt.price > 0 && (
                                                                <span className="ml-1 text-[10px] font-bold text-primary/60">
                                                                    + {formatCurrency(opt.price)}
                                                                </span>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {order.notes && (
                        <div className="mt-2 flex gap-2 bg-amber-50/80 dark:bg-amber-950/20 p-2 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Nota</span>
                                <p className="text-xs text-foreground/80 leading-snug">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <Separator className="opacity-40" />

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
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total</span>
                    <span className="font-bold text-lg text-primary leading-none">
                        {formatCurrency(order.total)}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}

