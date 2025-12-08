import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { OrderItemGroup as OrderItemGroupType } from "@/lib/useOrderItemGroups";

interface OrderItemGroupProps {
    group: OrderItemGroupType;
}

export function OrderItemGroup({ group }: OrderItemGroupProps) {
    return (
        <>
            {group.items.map((item, index) => (
                <div key={item.id + index} className="flex items-start gap-2.5 pb-2 border-b border/9 last:border-0 last:pb-0">
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
        </>
    );
}
