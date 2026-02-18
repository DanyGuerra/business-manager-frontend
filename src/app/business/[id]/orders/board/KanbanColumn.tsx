import { Order, OrderStatus } from "@/lib/useOrdersApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { OrderCard } from "@/components/OrderCard";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { SortableItem } from "./SortableItem";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Clock, Ghost, Flame, Bell, CheckCheck, ArrowDown } from "lucide-react";
import { OrderCardSkeleton } from "@/components/OrderCardSkeleton";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    title: string;
    status: OrderStatus;
    orders: Order[];
    colorScheme?: string;
    loading?: boolean;
}

const colorMap: Record<string, {
    active: string,
    border: string,
    icon: string,
    badge: string,
    title: string,
    headerBorder: string
}> = {
    violet: {
        active: 'bg-violet-500/5 ring-violet-500/30 border-violet-500/50',
        border: 'border-violet-200 dark:border-violet-800',
        icon: 'text-violet-600 dark:text-violet-400',
        badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        title: 'text-violet-700 dark:text-violet-300',
        headerBorder: 'border-b-violet-500'
    },
    yellow: {
        active: 'bg-yellow-500/5 ring-yellow-500/30 border-yellow-500/50',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        title: 'text-yellow-700 dark:text-yellow-300',
        headerBorder: 'border-b-yellow-500'
    },
    blue: {
        active: 'bg-blue-500/5 ring-blue-500/30 border-blue-500/50',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        title: 'text-blue-700 dark:text-blue-300',
        headerBorder: 'border-b-blue-500'
    },
    green: {
        active: 'bg-green-500/5 ring-green-500/30 border-green-500/50',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        title: 'text-green-700 dark:text-green-300',
        headerBorder: 'border-b-green-500'
    },
    primary: {
        active: 'bg-primary/5 ring-primary/30 border-primary/50',
        border: 'border-primary/20',
        icon: 'text-primary',
        badge: 'bg-primary/10 text-primary',
        title: 'text-primary',
        headerBorder: 'border-b-primary'
    }
};

const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return <Clock className="w-4 h-4" />;
        case OrderStatus.PREPARING: return <Flame className="w-4 h-4" />;
        case OrderStatus.READY: return <Bell className="w-4 h-4" />;
        case OrderStatus.COMPLETED: return <CheckCheck className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
    }
};

export function KanbanColumn({ title, status, orders, colorScheme = 'primary', loading }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });
    const { active, over } = useDndContext();

    const isOverItem = orders.some(order => order.id === over?.id);
    const isSourceColumn = orders.some(order => order.id === active?.id);
    const isActive = (isOver || isOverItem) && !isSourceColumn;

    const styles = colorMap[colorScheme] || colorMap.primary;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col h-full min-w-[300px] w-full rounded-xl border relative overflow-hidden",
                isActive
                    ? cn(styles.active, "ring-2 shadow-lg border-dashed")
                    : "bg-muted/40 hover:bg-muted/60 border-transparent hover:border-border/50"
            )}
        >
            <div className={cn(
                "p-4 flex justify-between items-center border-b backdrop-blur-xl bg-muted/80 rounded-t-xl transition-colors duration-300 relative z-9",
                isActive ? styles.headerBorder : "border-border/40"
            )}>
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "p-2 rounded-lg transition-colors duration-300",
                        orders.length > 0 ? "bg-background shadow-sm" : "bg-muted/50",
                        styles.icon
                    )}>
                        {getStatusIcon(status)}
                    </div>
                    <h3 className={cn(
                        "font-bold text-sm uppercase tracking-wider transition-colors duration-300",
                        isActive ? styles.title : "text-muted-foreground/90"
                    )}>
                        {title}
                    </h3>
                </div>
                <Badge
                    variant="secondary"
                    className={cn(
                        "h-6 px-2 min-w-[24px] flex items-center justify-center font-mono text-xs transition-colors duration-300",
                        orders.length > 0 ? styles.badge : ""
                    )}
                >
                    {loading ? "-" : orders.length}
                </Badge>
            </div>

            <ScrollArea className="flex-1 px-3">
                <SortableContext
                    items={orders.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className={cn(
                        "flex flex-col gap-3 py-3 min-h-[150px] transition-all duration-300",
                        isActive ? "blur-sm opacity-90" : ""
                    )}>
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
                                <div className={cn("p-4 rounded-full bg-muted/30 transition-colors duration-300", isActive ? "bg-background" : "")}>
                                    <Ghost className={cn("w-8 h-8 opacity-50 transition-colors duration-300", isActive ? styles.icon : "")} />
                                </div>
                                <span className="text-sm font-medium">Sin pedidos</span>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </ScrollArea>

            {isActive && (
                <div className={cn(
                    "absolute inset-0 z-8 flex items-start justify-center rounded-xl pointer-events-none pt-24 transition-all duration-300",
                    "bg-background/40"
                )}>
                    <div className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl border-2",
                        "bg-transparent",
                        styles.border,
                        styles.title
                    )}>
                        <ArrowDown className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-wider">Soltar aquí</span>
                    </div>
                </div>
            )}
        </div>
    );
}
