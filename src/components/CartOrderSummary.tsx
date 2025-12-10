'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { ChevronsUpDown, Utensils, ShoppingBag, Truck, ChevronDownIcon, Trash2Icon } from "lucide-react";
import { ConsumptionType } from "@/lib/useOrdersApi";
import { OrderDetails } from "@/store/cartStore";
import { DrawerClose } from "@/components/ui/drawer";
import ButtonLoading from "./buttonLoading";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CartOrderSummaryProps {
    businessId: string;
    totalPrice: number;
    orderDetails: OrderDetails;
    setOrderDetails: (businessId: string, details: Partial<OrderDetails>) => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export function CartOrderSummary({
    businessId,
    totalPrice,
    orderDetails,
    setOrderDetails,
    onConfirm,
    isLoading
}: CartOrderSummaryProps) {
    const [open, setOpen] = useState(false);

    const currentDate = orderDetails.scheduled_at ? new Date(orderDetails.scheduled_at) : undefined;

    const handleDateSelect = (date: Date | undefined) => {
        setOpen(false);
        if (!date) return setOrderDetails(businessId, { scheduled_at: "" });

        const newDate = currentDate ? new Date(currentDate) : new Date();
        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        setOrderDetails(businessId, { scheduled_at: newDate.toISOString() });
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value;
        if (!time) return;
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = currentDate ? new Date(currentDate) : new Date();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        setOrderDetails(businessId, { scheduled_at: newDate.toISOString() });
    };

    return (
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
                            value={orderDetails.customer_name}
                            onChange={(e) => setOrderDetails(businessId, { customer_name: e.target.value })}
                            className="h-8 text-sm bg-background"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="comments" className="text-xs font-medium">Comentarios (opcional)</Label>
                        <Input
                            id="comments"
                            placeholder="Ej. Sin cebolla, salsa aparte..."
                            value={orderDetails.notes}
                            onChange={(e) => setOrderDetails(businessId, { notes: e.target.value })}
                            className="h-8 text-sm bg-background"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-3 flex-1">
                            <Label htmlFor="date-picker" className="px-1 text-xs font-medium">
                                Fecha
                            </Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date-picker"
                                        className={cn(
                                            "w-full justify-between font-normal text-left px-3",
                                            !currentDate && "text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {currentDate ? (
                                                <span className="capitalize">
                                                    {format(currentDate, "PPP", { locale: es })}
                                                </span>
                                            ) : (
                                                <span>Seleccionar fecha</span>
                                            )}
                                        </div>
                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={currentDate}
                                        captionLayout="dropdown"
                                        onSelect={handleDateSelect}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="time-picker" className="px-1 text-xs font-medium">
                                Hora
                            </Label>
                            <Input
                                type="time"
                                id="time-picker"
                                value={currentDate ? format(currentDate, "HH:mm") : ""}
                                onChange={handleTimeChange}
                                step="1"
                                className="text-sm bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"

                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label className="opacity-0 px-1 text-xs font-medium">Clear</Label>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                onClick={() => handleDateSelect(undefined)}
                                disabled={!currentDate}
                            >
                                <Trash2Icon className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                    <div className="">
                        <Label htmlFor="consumption-type" className="text-xs font-medium">Tipo de consumo</Label>
                        <Tabs
                            defaultValue={ConsumptionType.TAKE_AWAY}
                            value={orderDetails.consumption_type}
                            onValueChange={(value) => setOrderDetails(businessId, { consumption_type: value as ConsumptionType })}
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
                <ButtonLoading
                    loadingState={isLoading}
                    onClick={onConfirm}
                    buttonTitle="Confirmar pedido"
                    className="text-base font-bold"
                    size="lg"
                />
                <DrawerClose asChild>
                    <Button variant="outline" className="w-full h-12 text-base font-bold shadow-md mt-2">
                        Cerrar
                    </Button>
                </DrawerClose>
            </div>
        </div>
    );
}
