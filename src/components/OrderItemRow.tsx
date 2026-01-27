import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { OrderItem, useOrderItemGroupsApi } from "@/lib/useOrderItemGroups";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";

export default function OrderItemRow({ item: initialItem, businessId, enableReadyToggle = true }: { item: OrderItem, businessId: string, orderId: string, enableReadyToggle?: boolean }) {
    const [isReady, setIsReady] = useState<boolean>(initialItem.is_ready);
    const [item] = useState(initialItem);
    const { updateOrderItem } = useOrderItemGroupsApi();

    useEffect(() => {
        setIsReady(initialItem.is_ready);
    }, [initialItem]);

    const handleToggleReady = async () => {
        if (!enableReadyToggle) return;

        const newState = !isReady;
        setIsReady(newState);

        try {
            await updateOrderItem(item.id, { is_ready: newState }, businessId);
        } catch (error) {
            setIsReady(!newState);
            handleApiError(error);
        }
    };

    return (
        <div className={cn(
            "flex items-center gap-2 py-1.5 border-b border-dashed border-muted-foreground/20 last:border-0 first:pt-0 last:pb-0 transition-opacity duration-200",
            isReady && enableReadyToggle && "opacity-40"
        )}>
            <div
                onClick={handleToggleReady}
                className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold shadow-sm mt-0.5 transition-all duration-200 select-none",
                    enableReadyToggle ? "cursor-pointer" : "cursor-default",
                    isReady
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-primary/20 bg-primary/5 text-primary",
                    enableReadyToggle && !isReady && "hover:bg-primary/10"
                )}
            >
                {item.quantity}
            </div>

            <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <div className="flex justify-between items-start gap-2">
                    <span className={cn(
                        "font-medium text-sm text-foreground leading-tight transition-all duration-200",
                        isReady && "line-through text-muted-foreground"
                    )}>
                        {item.product?.name || "Producto sin nombre"}
                    </span>
                    <span className={cn(
                        "text-xs font-medium text-muted-foreground whitespace-nowrap transition-all duration-200",
                        isReady && "line-through opacity-80"
                    )}>
                        {formatCurrency(item.item_total)}
                    </span>
                </div>
                {item.grouped_options && Object.keys(item.grouped_options).length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-0.5 text-[10px]">
                        {Object.entries(item.grouped_options).map(([groupName, options]) => (
                            <div key={groupName} className="flex flex-wrap items-center gap-1">
                                <span className="text-primary/90 font-medium">{groupName}:</span>
                                <div className="flex flex-wrap gap-1">
                                    {options.map((opt, i) => (
                                        <Badge
                                            key={`${groupName}-${i}`}
                                            variant="outline"
                                            className="flex items-center rounded-md px-1.5 py-[0.5px] h-auto min-h-0 text-[10px] font-semibold border-1 border-primary/80"
                                        >
                                            {opt.name}
                                            {opt.price > 0 && (
                                                <span className="text-[9px] font-bold opacity-70">
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
        </div >
    );
}
