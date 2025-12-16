import { Order, OrderStatus } from "@/lib/useOrdersApi";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatCurrency, getStatusColor, timeAgo } from "@/lib/utils";

interface KanbanCardProps {
    order: Order;
}

export function KanbanCard({ order }: KanbanCardProps) {
    const timeColor = order.status === OrderStatus.PENDING ? "text-red-500" : "text-muted-foreground";

    return (
        <Card className="w-full hover:shadow-md transition-all cursor-pointer border-l-4"
            style={{ borderLeftColor: getStatusColor(order.status).replace('bg-', '').replace('hover:', '').split(' ')[0].replace('500', '600') }}
        >
            <CardHeader className="p-3 pb-2 space-y-0">
                <div className="flex justify-between items-start">
                    <span className="font-bold text-sm">#{order.id.slice(0, 4)}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                        {order.consumption_type === 'dine_in' ? 'Mesa' :
                            order.consumption_type === 'take_away' ? 'Llevar' : 'Domicilio'}
                    </Badge>
                </div>
                <CardTitle className="text-sm font-medium pt-1 truncate">
                    {order.customer_name || "Cliente"}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 py-2 text-xs text-muted-foreground">
                <div className="flex justify-between items-center">
                    <span>{order.itemGroups.reduce((acc, g) => acc + g.items.length, 0)} ítems</span>
                    <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
                </div>
            </CardContent>
            <CardFooter className="p-3 pt-2 text-[10px] text-muted-foreground flex justify-between">
                <div className="flex items-center gap-1">
                    <Clock className={`h-3 w-3 ${timeColor}`} />
                    <span className={timeColor}>{timeAgo(new Date(order.created_at))}</span>
                </div>
            </CardFooter>
        </Card>
    );
}
