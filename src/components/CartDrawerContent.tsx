import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CartOrderSummary } from "@/components/CartOrderSummary";
import { CartItemRow } from "@/components/CartItemRow";
import { CartGroup, CartItem, OrderDetails } from "@/store/cartStore";
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DropAnimation,
    useDndContext,
    pointerWithin,
    useDroppable
} from '@dnd-kit/core';
import { cn } from "@/lib/utils";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { useState } from "react";


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
    onContinueShopping?: () => void;
    onCreateGroupWithItem?: (fromGroupId: string, cartItemId: string) => void;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.1',
            },
        },
    }),
};

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
    onAddProductsToGroup,
    onContinueShopping,
    onCreateGroupWithItem
}: CartDrawerContentProps) {
    const [activeItem, setActiveItem] = useState<CartItem | null>(null);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

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

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeIdString = active.id as string;
        if (!activeIdString.includes('::')) return;

        const [groupId, itemId] = activeIdString.split('::');
        setActiveGroupId(groupId);
        const activeGroup = groups.find(g => g.group_id === groupId);
        const item = activeGroup?.items.find(i => i.cart_item_id === itemId);
        if (item) setActiveItem(item);
    };

    const handleDragCancel = () => {
        setActiveItem(null);
        setActiveGroupId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);
        setActiveGroupId(null);

        if (!over) return;

        const activeIdString = active.id as string;
        if (!activeIdString.includes('::')) return;

        const [activeGroupId, activeItemId] = activeIdString.split('::');
        const overId = over.id as string;

        let targetGroupId = groups.find(g => g.group_id === overId)?.group_id;

        if (!targetGroupId) {
            // Check if dropped on "CREATE_NEW_GROUP"
            if (overId === 'CREATE_NEW_GROUP') {
                if (activeGroupId && onCreateGroupWithItem) {
                    onCreateGroupWithItem(activeGroupId, activeItemId);
                }
                return;
            }

            if (overId.includes('::')) {
                const [overGroupId] = overId.split('::');
                const overGroup = groups.find(g => g.group_id === overGroupId);
                if (overGroup) targetGroupId = overGroup.group_id;
            }
        }

        if (targetGroupId && activeGroupId && activeGroupId !== targetGroupId) {
            onMoveItem(activeGroupId, targetGroupId, activeItemId);
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
                    <Button type="button" variant="outline" onClick={onContinueShopping || onClose}>
                        Seguir comprando
                    </Button>
                </div>
            ) : (
                <>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={pointerWithin}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
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
                                            activeId={activeItem?.cart_item_id}
                                            activeGroupId={activeGroupId}
                                        />
                                    ))}
                                </div>

                                <DroppableNewGroupArea
                                    onClick={onAddGroup}
                                    isDroppable={activeItem !== null}
                                />
                            </div>
                        </ScrollArea>
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeItem ? (
                                <div className="opacity-80">
                                    <CartItemRow
                                        item={activeItem}
                                        businessId={businessId}
                                        groupId=""
                                        updateQuantity={() => { }}
                                        removeFromCart={() => { }}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
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
    activeId?: string;
    activeGroupId?: string | null;
}

function SortableGroup({ group, selectedGroupId, onSelectGroup, onRemoveGroup, onUpdateQuantity, onRemoveItem, businessId, onAddProducts, activeId, activeGroupId }: SortableGroupProps) {
    const { setNodeRef } = useSortable({
        id: group.group_id,
        data: {
            type: 'group',
            group
        }
    });
    const { over } = useDndContext();

    const isSelected = selectedGroupId === group.group_id;
    const groupTotal = group.items.reduce((acc: number, item: CartItem) => acc + item.total_price, 0);

    const isOverGroup = over?.id === group.group_id;
    const isOverItemInGroup = group.items.some(item => `${group.group_id}::${item.cart_item_id}` === over?.id);
    const isOver = isOverGroup || isOverItemInGroup;

    // Check if the dragged item belongs to this group
    const isSourceGroup = group.group_id === activeGroupId;
    const isDropTarget = activeId && isOver && !isSourceGroup;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "space-y-4 border rounded-lg p-3 transition-all duration-300 cursor-pointer relative overflow-hidden bg-muted/40",
                isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent hover:bg-muted/60",
                isDropTarget && "bg-primary/5 shadow-md scale-[1.01] border-primary"
            )}
            onClick={() => onSelectGroup(group.group_id)}
        >
            {isDropTarget && group.items.length > 0 && (
                <div className="absolute inset-0 bg-background/60 pointer-events-none z-20 flex items-center justify-center">
                    <div className="bg-background/95 shadow-sm border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full animate-in fade-in zoom-in duration-200 ring-2 ring-primary/10">
                        Suelta aquí
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pb-2 border-b border-dashed relative z-10">
                <div>
                    {isSelected && <Badge variant='default'>
                        {group.group_name}
                        {isSelected && " (Seleccionada)"}
                    </Badge>}
                    {!isSelected && <span className="text-sm font-medium">{group.group_name}</span>}
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
                items={group.items.map((i: CartItem) => `${group.group_id}::${i.cart_item_id}`)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2 min-h-[50px] relative z-10">
                    {group.items.length === 0 ? (
                        <div className={cn(
                            "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md transition-colors",
                            isDropTarget ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20"
                        )}>
                            <p className="text-xs text-muted-foreground italic">
                                {isDropTarget ? "Suelta aquí" : "Bolsa vacía - Arrastra productos aquí"}
                            </p>
                        </div>
                    ) : (
                        group.items.map((item: CartItem) => (
                            <CartItemRow
                                key={`${group.group_id}::${item.cart_item_id}`}
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
                <div className="flex justify-end pt-3 mt-3 border-t border-dashed relative z-10">
                    <span className="text-sm font-medium text-muted-foreground">
                        Subtotal: <span className="text-foreground font-bold">${groupTotal}</span>
                    </span>
                </div>
            )}
        </div>
    );
}

function DroppableNewGroupArea({ onClick, isDroppable }: { onClick: () => void, isDroppable: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'CREATE_NEW_GROUP',
        data: { type: 'new-group-zone' },
        disabled: !isDroppable
    });

    const isTarget = isOver && isDroppable;

    return (
        <Button
            ref={setNodeRef}
            onClick={onClick}
            variant="secondary"
            className={cn(
                "w-full gap-2 border-dashed border-2 transition-all duration-200",
                isTarget ? "border-primary bg-primary/10 text-primary scale-[1.02] shadow-md ring-2 ring-primary/20" : "hover:border-primary/50"
            )}
        >
            <PlusIcon className={cn("h-4 w-4", isTarget && "animate-bounce")} />
            {isTarget ? "Soltar para crear nueva bolsa" : "Nueva Bolsa"}
        </Button>
    )
}
