import { Order } from "@/lib/useOrdersApi";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OrderItemGroup } from "./OrderItemGroup";

interface OrderDetailsProps {
    order: Order;
}

export function OrderGroups({ order }: OrderDetailsProps) {
    return (
        <div className="flex flex-col gap-4">
            {order.itemGroups.map((group) => {
                const isGroupReady = group.items.length > 0 && group.items.every((item) => item.is_ready);

                return (
                    <div key={group.id}>
                        <Collapsible className="w-full border rounded-md bg-muted/50 p-2" defaultOpen>
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground ${isGroupReady ? "line-through decoration-1 opacity-50" : ""}`}>
                                            {group.name}
                                        </span>
                                        <Badge variant={isGroupReady ? "outline" : "secondary"} className={`text-[10px] h-5 ${isGroupReady ? "line-through decoration-1 opacity-50" : ""}`}>
                                            {group.items.length} items
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold text-muted-foreground/80 ${isGroupReady ? "line-through decoration-1 opacity-50" : ""}`}>
                                            {formatCurrency(group.subtotal)}
                                        </span>

                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                            <span className="sr-only">Toggle {group.name}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="pt-3">
                                    <OrderItemGroup group={group} orderId={order.id} enableReadyToggle={true} />
                                    <div className="flex justify-end items-center mt-2 pt-2 border-t border-dashed border-muted/60">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                                                Subtotal {group.name}
                                            </span>
                                            <span className="text-sm font-bold text-foreground/80">
                                                {formatCurrency(group.subtotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                );
            })}

            {order.notes && (
                <div className="mt-2 flex gap-2 bg-muted/40 p-2.5 rounded-md border-2 border-dashed border-muted-foreground/25">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Nota del Cliente</span>
                        <p className="text-xs font-medium text-foreground/90 leading-snug">{order.notes}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
