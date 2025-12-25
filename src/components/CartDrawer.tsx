"use client";

import { useCartStore, CartGroup, CartItem } from "@/store/cartStore";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useOrdersApi } from "@/lib/useOrdersApi";
import { useBusinessStore } from "@/store/businessStore";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { CartOrderSummary } from "@/components/CartOrderSummary";
import { CartItemRow } from "@/components/CartItemRow";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';

export default function CartDrawer() {
    const { updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart, getGroups, getOrderDetails, setOrderDetails, addGroup, getSelectedGroupId, selectGroup, removeGroup, moveItem } = useCartStore();
    const { businessId } = useBusinessStore();
    const { startLoading, stopLoading, loadings } = useLoadingStore();
    const ordersApi = useOrdersApi();
    const [isOpen, setIsOpen] = useState(false);

    const groups = getGroups(businessId);
    const totalItems = getTotalItems(businessId);
    const totalPrice = getTotalPrice(businessId);
    const orderDetails = getOrderDetails(businessId);
    const selectedGroupId = getSelectedGroupId(businessId);

    const sensors = useSensors(
        useSensor(PointerSensor),
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
            moveItem(businessId, activeGroup.group_id, targetGroupId, activeId);
        }
    };

    async function handleConfirmOrder() {
        try {
            startLoading(LoadingsKeyEnum.CREATE_ORDER);

            const payload = {
                ...orderDetails,
                scheduled_at: orderDetails.scheduled_at || undefined,
                table_number: Number(orderDetails.table_number) || undefined,
                group_items: groups
                    .filter((group) => group.items.length > 0)
                    .map((group) => ({
                        group_name: group.group_name,
                        items: group.items.map((item) => ({
                            product_id: item.product_id,
                            selected_options_ids: item.selected_options_ids,
                            quantity: item.quantity,
                        })),
                    }))
            };

            await ordersApi.createFullOrder(payload, businessId);
            toast.success("Orden creada exitosamente", { style: toastSuccessStyle });
            clearCart(businessId);
            setIsOpen(false);
        } catch (error) {
            handleApiError(error)
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_ORDER);
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="fixed bottom-4 right-4 z-50">
                <Button className="h-16 w-16 shadow-lg z-50 animate-in zoom-in duration-300 hover:scale-105 transition-transform rounded-full">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <ShoppingCartIcon />
                        {totalItems > 0 && (
                            <span className="absolute -top-3 -left-3 bg-red-500 text-white text-[12px] font-bold h-6 w-6 flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-[500px] sm:w-[70%] md:w-[60%] lg:w-[50%] p-0 border-l shadow-xl flex flex-col h-full bg-background z-[100]">
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
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
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
                                                        onClick={() => clearCart(businessId)}
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
                                                    selectGroup={selectGroup}
                                                    removeGroup={removeGroup}
                                                    businessId={businessId}
                                                    updateQuantity={updateQuantity}
                                                    removeFromCart={removeFromCart}
                                                />
                                            ))}
                                        </div>

                                        <Button
                                            onClick={() => addGroup(businessId)}
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
                                setOrderDetails={setOrderDetails}
                                onConfirm={handleConfirmOrder}
                                isLoading={loadings[LoadingsKeyEnum.CREATE_ORDER]}
                            />
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface SortableGroupProps {
    group: CartGroup;
    selectedGroupId: string | null;
    selectGroup: (businessId: string, groupId: string) => void;
    removeGroup: (businessId: string, groupId: string) => void;
    businessId: string;
    updateQuantity: (businessId: string, groupId: string, cartItemId: string, quantity: number) => void;
    removeFromCart: (businessId: string, groupId: string, cartItemId: string) => void;
}

function SortableGroup({ group, selectedGroupId, selectGroup, removeGroup, businessId, updateQuantity, removeFromCart }: SortableGroupProps) {
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
            onClick={() => selectGroup(businessId, group.group_id)}
        >
            <div className="flex items-center justify-between pb-2 border-b border-dashed">
                <Badge variant={isSelected ? "default" : "outline"}>
                    {group.group_name}
                    {isSelected && " (Seleccionada)"}
                </Badge>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeGroup(businessId, group.group_id);
                    }}
                >
                    <Trash2Icon className="h-3.5 w-3.5" />
                </Button>
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
                                updateQuantity={updateQuantity}
                                removeFromCart={removeFromCart}
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
