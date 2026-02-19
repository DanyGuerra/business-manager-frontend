
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/store/cartStore";

export function CartItemDragPreview({ item }: { item: CartItem }) {
    return (
        <div className="flex gap-4 p-3 rounded-xl border-2 border-primary/20 bg-background/60 backdrop-blur-md shadow-2xl cursor-grabbing w-[350px] transition-all duration-300 ring-2 ring-primary/10 rotate-2 scale-105">
            <div className="h-10 w-10 rounded-lg bg-muted/50 flex-shrink-0 flex items-center justify-center border border-border/50">
                <span className="font-bold text-sm text-muted-foreground">x{item.quantity}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm line-clamp-2 text-foreground/90">{item.product.name}</h4>
                    <span className="font-bold text-sm text-primary tabular-nums">${item.total_price}</span>
                </div>

                {item.selected_options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 opacity-80">
                        {item.selected_options.slice(0, 3).map((opt) => (
                            <Badge
                                key={opt.id}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 font-medium border-primary/20 bg-primary/5 text-primary/80"
                            >
                                {opt.name}
                            </Badge>
                        ))}
                        {item.selected_options.length > 3 && (
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center px-1">
                                +{item.selected_options.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
