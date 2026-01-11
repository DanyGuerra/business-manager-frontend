import { Order, OrderStatus } from "@/lib/useOrdersApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { OrderCard } from "@/components/OrderCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableItem } from "./SortableItem";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Clock, ChefHat, CheckCircle2, Flag, Ghost } from "lucide-react";
import { OrderCardSkeleton } from "@/components/OrderCardSkeleton";

interface KanbanColumnProps {
    title: string;
    status: OrderStatus;
    orders: Order[];
    color?: string;
    headerColor?: string;
}

const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return <Clock className="w-4 h-4" />;
        case OrderStatus.PREPARING: return <ChefHat className="w-4 h-4" />;
        case OrderStatus.READY: return <CheckCircle2 className="w-4 h-4" />;
        case OrderStatus.COMPLETED: return <Flag className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
    }
};

export function KanbanColumn({ title, status, orders, color, loading }: KanbanColumnProps & { loading?: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col h-full min-w-[380px] w-full rounded-xl border transition-all duration-300 ${isOver
                ? 'bg-primary/5 ring-2 ring-primary/20 border-primary/50'
                : 'bg-muted/40 hover:bg-muted/60 border-transparent hover:border-border/50'
                }`}
        >
            <div className={`p-4 flex justify-between items-center border-b border-border/40 backdrop-blur-xl bg-muted/80 rounded-t-xl ${color ? color.replace('border-l-', 'border-b-') : ''}`}>
                <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${orders.length > 0 ? 'bg-background shadow-sm' : 'bg-muted/50'}`}>
                        {getStatusIcon(status)}
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground/90">
                        {title}
                    </h3>
                </div>
                <Badge variant={orders.length > 0 ? "default" : "secondary"} className="h-6 px-2 min-w-[24px] flex items-center justify-center font-mono text-xs">
                    {loading ? "-" : orders.length}
                </Badge>
            </div>

            <ScrollArea className="flex-1 px-3">
                <SortableContext
                    items={orders.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-3 py-3 min-h-[150px]">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <OrderCardSkeleton key={i} />
                            ))
                        ) : orders.map(order => (
                            <SortableItem key={order.id} id={order.id}>
                                <OrderCard order={order} />
                            </SortableItem>
                        ))}
                        {!loading && orders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground/40 gap-3">
                                <div className="p-4 rounded-full bg-muted/30">
                                    <Ghost className="w-8 h-8 opacity-50" />
                                </div>
                                <span className="text-sm font-medium">Sin pedidos</span>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </ScrollArea>
        </div>
    );
}
