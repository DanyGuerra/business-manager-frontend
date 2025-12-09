import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { OrderItem } from "@/lib/useOrderItemGroups";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OrderItemRowProps {
    item: OrderItem;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
    const [isReady, setIsReady] = useState<boolean>(false);

    return (
        <div className={cn(
            "flex items-start gap-3 py-3 border-b border-dashed border-muted-foreground/20 last:border-0 first:pt-0 last:pb-0 transition-opacity duration-200",
            isReady && "opacity-60"
        )}>
            <div
                onClick={() => setIsReady((prev) => !prev)}
                className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold shadow-sm mt-0.5 cursor-pointer transition-all duration-200 select-none c",
                    isReady
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                )}
            >
                {item.quantity}
            </div>

            <div className="flex flex-col flex-1 min-w-0 gap-1">
                <div className="flex justify-between items-start gap-2">
                    <span className={cn(
                        "font-medium text-sm text-foreground leading-tight transition-all duration-200",
                        isReady && "line-through text-muted-foreground"
                    )}>
                        {item.product.name}
                    </span>
                    <span className={cn(
                        "text-xs font-bold text-foreground/90 whitespace-nowrap transition-all duration-200",
                        isReady && "text-muted-foreground line-through"
                    )}>
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
    );
}
