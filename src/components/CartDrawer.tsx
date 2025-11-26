"use client";

import { useCartStore } from "@/store/cartStore";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function CartDrawer() {
    const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 animate-in zoom-in duration-300 hover:scale-105 transition-transform cursor-pointer"
                >
                    <div className="relative">
                        <ShoppingCartIcon className="h-6 w-6" />
                        {totalItems > 0 && (
                            <span className="absolute top-3 -right-3 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-background">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] sm:max-w-lg sm:mx-auto sm:rounded-t-xl flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 pb-2 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <ShoppingCartIcon className="h-5 w-5" />
                        Tu Carrito
                        <Badge variant="secondary" className="ml-auto text-sm font-normal">
                            {totalItems} {totalItems === 1 ? "item" : "items"}
                        </Badge>
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground p-6">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <ShoppingCartIcon className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="text-lg font-medium">Tu carrito está vacío</p>
                        <Button className="cursor-pointer" variant="outline" onClick={() => setIsOpen(false)}>
                            Seguir comprando
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 p-6">
                            <div className="flex flex-col gap-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                                            <span className="text-2xl">📦</span>
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
                                                            <Badge key={opt.id} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground border-dashed">
                                                                {opt.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border rounded-md h-8">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <MinusIcon className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <PlusIcon className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-muted/10 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${totalPrice}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${totalPrice}</span>
                                </div>
                            </div>
                            <Button className="w-full h-12 text-base font-bold shadow-md" size="lg">
                                Checkout
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
