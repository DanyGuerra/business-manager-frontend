"use client";

import { CartItem, useCartStore } from "@/store/cartStore";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerClose
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, MinusIcon, PlusIcon, Trash2Icon, Package, ChevronsUpDown, Utensils, ShoppingBag, Truck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useState } from "react";
import { ConsumptionType, CreateOrderDto, useOrdersApi } from "@/lib/useOrdersApi";
import { useBusinessStore } from "@/store/businessStore";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import ButtonLoading from "./buttonLoading";
import { CartOrderSummary } from "@/components/CartOrderSummary";
import { CartItemRow } from "@/components/CartItemRow";

export default function CartDrawer() {
    const { updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart, getGroups, getOrderDetails, setOrderDetails, addGroup, getSelectedGroupId, selectGroup, removeGroup } = useCartStore();
    const { businessId } = useBusinessStore();
    const { startLoading, stopLoading, loadings } = useLoadingStore();
    const ordersApi = useOrdersApi();
    const [isOpen, setIsOpen] = useState(false);

    const groups = getGroups(businessId);
    const totalItems = getTotalItems(businessId);
    const totalPrice = getTotalPrice(businessId);
    const orderDetails = getOrderDetails(businessId);
    const selectedGroupId = getSelectedGroupId(businessId);

    async function handleConfirmOrder() {
        try {
            startLoading(LoadingsKeyEnum.CREATE_ORDER);

            const payload = {
                customer_name: orderDetails.customerName,
                notes: orderDetails.comments,
                consumption_type: orderDetails.consumptionType,
                group_items: groups.map(group => ({
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
            console.error(error);
            handleApiError(error)
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_ORDER);
        }
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} >
            <DrawerTrigger asChild className="fixed bottom-4 right-4 z-50">
                <Button
                    className="h-16 w-16 shadow-lg z-50 animate-in zoom-in duration-300 hover:scale-105 transition-transform rounded-full"
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        <ShoppingCartIcon />
                        {totalItems > 0 && (
                            <span className="absolute -top-3 -left-3 bg-red-500 text-white text-[12px] font-bold h-6 w-6 flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="flex flex items-center justify-center w-full h-full p-0 border-l shadow-xl">
                <div className="flex flex-col h-full sm:w-[70%] md:w-[60%] lg:w-[50%] w-full">
                    <div className="p-6 pt-4 pb-2 border-b shrink-0">
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
                            <ScrollArea className="flex-1 min-h-0 w-full">
                                <div className="flex flex-col gap-6 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-sm">Tus Bolsas</h3>
                                            <p className="text-xs text-muted-foreground">Selecciona una bolsa para agregar items</p>
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

                                    {groups.map((group) => {
                                        const isSelected = selectedGroupId === group.group_id;
                                        const groupTotal = group.items.reduce((acc, item) => acc + item.total_price, 0);

                                        return (
                                            <div
                                                key={group.group_id}
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
                                                        title="Eliminar bolsa"
                                                    >
                                                        <Trash2Icon className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                {group.items.length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic pl-2">Bolsa vacía - Agrega productos para verlos aquí</p>
                                                ) : (
                                                    group.items.map((item) => (
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

                                                {group.items.length > 0 && (
                                                    <div className="flex justify-end pt-3 mt-3 border-t border-dashed">
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            Subtotal: <span className="text-foreground font-bold">${groupTotal}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

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
            </DrawerContent>
        </Drawer>
    );
}
