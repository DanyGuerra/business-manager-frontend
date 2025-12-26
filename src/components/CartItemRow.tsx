import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MinusIcon, PlusIcon, Trash2Icon, GripVerticalIcon } from "lucide-react";
import { CartItem } from "@/store/cartStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CartItemRowProps {
    item: CartItem;
    businessId: string;
    groupId: string;
    updateQuantity: (businessId: string, groupId: string, cartItemId: string, quantity: number) => void;
    removeFromCart: (businessId: string, groupId: string, cartItemId: string) => void;
}

export function CartItemRow({
    item,
    businessId,
    groupId,
    updateQuantity,
    removeFromCart
}: CartItemRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.cart_item_id, data: { type: 'item', item } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-4">
            <div
                {...attributes}
                {...listeners}
                className="h-8 w-8 rounded-md bg-muted flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted/80"
            >
                <GripVerticalIcon className="h-4 w-4 text-muted-foreground/50" />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.product.name}</h4>
                        <span className="font-bold text-sm">${item.total_price}</span>
                    </div>

                    {item.selected_options.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {item.selected_options.map((opt) => (
                                <Badge
                                    key={opt.id}
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 h-5 font-normal border-2 border-primary/30"
                                >
                                    {opt.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md h-8 bg-background" onClick={(e) => e.stopPropagation()}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(businessId, groupId, item.cart_item_id, item.quantity - 1)}
                            aria-label={`Disminuir cantidad de ${item.product.name}`}
                        >
                            <MinusIcon className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(businessId, groupId, item.cart_item_id, item.quantity + 1)}
                            aria-label={`Aumentar cantidad de ${item.product.name}`}
                        >
                            <PlusIcon className="h-3 w-3" />
                        </Button>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/60 hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(businessId, groupId, item.cart_item_id);
                        }}
                        aria-label={`Eliminar ${item.product.name} del carrito`}
                    >
                        <Trash2Icon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
