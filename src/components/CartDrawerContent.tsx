
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CartOrderSummary } from "@/components/CartOrderSummary";
import { CartItemRow } from "@/components/CartItemRow";
import { CartGroup, CartItem, OrderDetails } from "@/store/cartStore";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';


interface CartDrawerContentProps {
    groups: CartGroup[];
    totalItems: number;
    totalPrice: number;
    orderDetails: OrderDetails;
    selectedGroupId: string | null;
    isLoading: boolean;

    // Actions
    onClose: () => void;
    onClearCart: () => void;
    onConfirm?: () => void;
    onUpdate?: () => void;
    onAddGroup: () => void;
    onRemoveGroup: (groupId: string) => void;
    onSelectGroup: (groupId: string) => void;
    onUpdateQuantity: (groupId: string, itemId: string, quantity: number) => void;
    onRemoveItem: (groupId: string, itemId: string) => void;
    onMoveItem: (fromGroupId: string, toGroupId: string, itemId: string) => void;
    setOrderDetails: (details: Partial<OrderDetails>) => void;

    // Optional
    businessId?: string;
    disableSubmit?: boolean;
    onAddProductsToGroup?: (groupId: string) => void;
}

export function CartDrawerContent({
    groups,
    totalItems,
    totalPrice,
    orderDetails,
    selectedGroupId,
    isLoading,
    onClose,
    onClearCart,
    onConfirm,
    onUpdate,
    onAddGroup,
    onRemoveGroup,
    onSelectGroup,
    onUpdateQuantity,
    onRemoveItem,
    onMoveItem,
    setOrderDetails,
    businessId = "default",
    disableSubmit,
    onAddProductsToGroup
}: CartDrawerContentProps) {

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeGroup = groups.find(g => g.items.some(i => i.cart_item_id === activeId));
        if (!activeGroup) return;

        let targetGroupId = groups.find(g => g.group_id === overId)?.group_id;

        if (!targetGroupId) {
            const overGroup = groups.find(g => g.items.some(i => i.cart_item_id === overId));
            if (overGroup) targetGroupId = overGroup.group_id;
        }

        if (targetGroupId && activeGroup.group_id !== targetGroupId) {
            onMoveItem(activeGroup.group_id, targetGroupId, activeId);
        }
    };

    return (
        <div className="flex flex-col h-full w-full mx-auto">
            <div className="p-6 pt-10 pb-2 border-b shrink-0">
                <div className="flex items-center gap-2 text-xl font-semibold">
                    <ShoppingCartIcon className="h-5 w-5" />
                    Tu Carrito
                    <Badge variant="secondary" className="ml-auto text-sm font-normal">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                    </Badge>
                </div>
            </div>

            {groups.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground p-6">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <ShoppingCartIcon className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">Tu carrito está vacío</p>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Seguir comprando
                    </Button>
                </div>
            ) : (
                <>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <ScrollArea className="flex-1 min-h-0 w-full">
                            <div className="flex flex-col gap-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-sm">Tus Bolsas</h3>
                                        <p className="text-xs text-muted-foreground">Selecciona una bolsa para agregar productos</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {groups.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs text-muted-foreground hover:text-destructive gap-2"
                                                onClick={onClearCart}
                                            >
                                                <Trash2Icon className="h-3.5 w-3.5" />
                                                Vaciar
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {groups.map((group) => (
                                        <SortableGroup
                                            key={group.group_id}
                                            group={group}
                                            selectedGroupId={selectedGroupId}
                                            onSelectGroup={onSelectGroup}
                                            onRemoveGroup={onRemoveGroup}
                                            onUpdateQuantity={onUpdateQuantity}
                                            onRemoveItem={onRemoveItem}
                                            businessId={businessId}
                                            onAddProducts={onAddProductsToGroup}
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={onAddGroup}
                                    variant="secondary"
                                    className="w-full gap-2 border-dashed border-2"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Nueva Bolsa
                                </Button>
                            </div>
                        </ScrollArea>
                    </DndContext>

                    <CartOrderSummary
                        businessId={businessId}
                        totalPrice={totalPrice}
                        orderDetails={orderDetails}
                        setOrderDetails={(_, details) => setOrderDetails(details)}
                        onConfirm={onConfirm}
                        onUpdate={onUpdate}
                        isLoading={isLoading}
                        disableSubmit={disableSubmit}
                    />
                </>
            )}
        </div>
    );
}

interface SortableGroupProps {
    group: CartGroup;
    selectedGroupId: string | null;
    businessId: string;
    onSelectGroup: (groupId: string) => void;
    onRemoveGroup: (groupId: string) => void;
    onUpdateQuantity: (groupId: string, itemId: string, quantity: number) => void;
    onRemoveItem: (groupId: string, itemId: string) => void;
    onAddProducts?: (groupId: string) => void;
}

function SortableGroup({ group, selectedGroupId, onSelectGroup, onRemoveGroup, onUpdateQuantity, onRemoveItem, businessId, onAddProducts }: SortableGroupProps) {
    const { setNodeRef } = useSortable({
        id: group.group_id,
        data: {
            type: 'group',
            group
        }
    });

    const isSelected = selectedGroupId === group.group_id;
    const groupTotal = group.items.reduce((acc: number, item: CartItem) => acc + item.total_price, 0);

    return (
        <div
            ref={setNodeRef}
            className={`space-y-4 border rounded-lg p-3 transition-colors cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'}`}
            onClick={() => onSelectGroup(group.group_id)}
        >
            <div className="flex items-center justify-between pb-2 border-b border-dashed">
                <div>
                    {isSelected && <Badge variant='default'>
                        {group.group_name}
                        {isSelected && " (Seleccionada)"}
                    </Badge>}
                </div>
                <div className="flex items-center gap-1">
                    {onAddProducts && (
                        <Button
                            variant="default"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddProducts(group.group_id);
                            }}
                        >
                            <PlusIcon className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveGroup(group.group_id);
                        }}
                    >
                        <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <SortableContext
                items={group.items.map((i: CartItem) => i.cart_item_id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2 min-h-[50px]">
                    {group.items.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground italic pl-2 py-4">
                            Bolsa vacía - Arrastra productos aquí
                        </p>
                    ) : (
                        group.items.map((item: CartItem) => (
                            <CartItemRow
                                key={item.cart_item_id}
                                item={item}
                                businessId={businessId}
                                groupId={group.group_id}
                                updateQuantity={(bid, gid, iid, q) => onUpdateQuantity(gid, iid, q)}
                                removeFromCart={(bid, gid, iid) => onRemoveItem(gid, iid)}
                            />
                        ))
                    )}
                </div>
            </SortableContext>

            {group.items.length > 0 && (
                <div className="flex justify-end pt-3 mt-3 border-t border-dashed">
                    <span className="text-sm font-medium text-muted-foreground">
                        Subtotal: <span className="text-foreground font-bold">${groupTotal}</span>
                    </span>
                </div>
            )}
        </div>
    );
}
