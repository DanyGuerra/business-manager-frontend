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
import { userOrderItemGroupsApi } from "@/lib/useOrderItemGroups";



export default function CartDrawer() {
    const { updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart, getItems, getOrderDetails, setOrderDetails } = useCartStore();
    const { businessId } = useBusinessStore();
    const { startLoading, stopLoading, loadings } = useLoadingStore();
    const ordersApi = useOrdersApi();
    const [isOpen, setIsOpen] = useState(false);

    const items = getItems(businessId);
    const totalItems = getTotalItems(businessId);
    const totalPrice = getTotalPrice(businessId);

    async function handleConfirmOrder(items: CartItem[]) {
        try {
            startLoading(LoadingsKeyEnum.CREATE_ORDER);
            const details = getOrderDetails(businessId);
            await ordersApi.createFullOrder({
                customer_name: details.customerName,
                notes: details.comments,
                consumption_type: details.consumptionType,
                items: items.map((item) => ({
                    product_id: item.product_id,
                    selected_options_ids: item.selected_options_ids,
                    quantity: item.quantity,
                })),
            }, businessId);
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

                    {items.length === 0 ? (
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
                                    {items.map((item) => (
                                        <div key={item.cart_item_id} className="flex gap-4">
                                            <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                                                <Package className="h-8 w-8" />
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
                                                                    className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground border-dashed"
                                                                >
                                                                    {opt.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center border rounded-md h-8">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-none"
                                                            onClick={() => updateQuantity(businessId, item.cart_item_id, item.quantity - 1)}
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
                                                            onClick={() => updateQuantity(businessId, item.cart_item_id, item.quantity + 1)}
                                                            aria-label={`Aumentar cantidad de ${item.product.name}`}
                                                        >
                                                            <PlusIcon className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive text-destructive"
                                                        onClick={() => removeFromCart(businessId, item.cart_item_id)}
                                                        aria-label={`Eliminar ${item.product.name} del carrito`}
                                                    >
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="p-6 border-t bg-muted/10 space-y-4 shrink-0">
                                <Collapsible className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-sm font-medium">Detalles del pedido</span>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-9 p-0">
                                                <ChevronsUpDown className="h-4 w-4" />
                                                <span className="sr-only">Toggle details</span>
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent className="space-y-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="buyer-name" className="text-xs font-medium">Nombre del comprador (opcional)</Label>
                                            <Input
                                                id="buyer-name"
                                                placeholder="Ej. Juan Pérez"
                                                value={getOrderDetails(businessId).customerName}
                                                onChange={(e) => setOrderDetails(businessId, { customerName: e.target.value })}
                                                className="h-8 text-sm bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="comments" className="text-xs font-medium">Comentarios (opcional)</Label>
                                            <Input
                                                id="comments"
                                                placeholder="Ej. Sin cebolla, salsa aparte..."
                                                value={getOrderDetails(businessId).comments}
                                                onChange={(e) => setOrderDetails(businessId, { comments: e.target.value })}
                                                className="h-8 text-sm bg-background"
                                            />
                                        </div>
                                        <div className="">
                                            <Label htmlFor="consumption-type" className="text-xs font-medium">Tipo de consumo</Label>
                                            <Tabs
                                                defaultValue={ConsumptionType.TAKE_AWAY}
                                                value={getOrderDetails(businessId).consumptionType}
                                                onValueChange={(value) => setOrderDetails(businessId, { consumptionType: value as ConsumptionType })}
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-3 h-11 p-1 bg-muted/50 rounded-lg">
                                                    <TabsTrigger
                                                        value={ConsumptionType.DINE_IN}
                                                        className="cursor-pointer text-xs gap-2 h-full rounded-md border border-transparent transition-all duration-200"
                                                    >
                                                        <Utensils className="h-3.5 w-3.5" />
                                                        <span className="inline">Comer aqui</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value={ConsumptionType.TAKE_AWAY}
                                                        className="cursor-pointer text-xs gap-2 h-full rounded-md border border-transparent transition-all duration-200"
                                                    >
                                                        <ShoppingBag className="h-3.5 w-3.5" />
                                                        <span className="inline">Llevar</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value={ConsumptionType.DELIVERY}
                                                        className="cursor-pointer text-xs gap-2 h-full rounded-md border border-transparent transition-all duration-200"
                                                    >
                                                        <Truck className="h-3.5 w-3.5" />
                                                        <span className="inline">Entrega</span>
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${totalPrice}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <ButtonLoading loadingState={loadings[LoadingsKeyEnum.CREATE_ORDER]} onClick={() => handleConfirmOrder(items)} buttonTitle="Confirmar pedido" className="text-base font-bold" size="lg" />
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="w-full h-12 text-base font-bold shadow-md mt-2">
                                            Cerrar
                                        </Button>
                                    </DrawerClose>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>

    );
}
