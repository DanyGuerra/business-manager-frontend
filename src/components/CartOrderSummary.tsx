'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ClipboardList, Utensils, ShoppingBag, Truck, Clock, CalendarIcon, Trash2Icon } from "lucide-react";
import { ConsumptionType } from "@/lib/useOrdersApi";
import { OrderDetails } from "@/store/cartStore";
import ButtonLoading from "./buttonLoading";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { SheetClose } from "@/components/ui/sheet";
import { Calendar } from "./ui/calendar";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toastErrorStyle } from "@/lib/toastStyles";

interface CartOrderSummaryProps {
    businessId: string;
    totalPrice: number;
    orderDetails: OrderDetails;
    setOrderDetails: (businessId: string, details: Partial<OrderDetails>) => void;
    onConfirm?: () => void;
    onUpdate?: () => void;
    isLoading: boolean;
    disableSubmit?: boolean;
}

export function CartOrderSummary({
    businessId,
    totalPrice,
    orderDetails,
    setOrderDetails,
    onConfirm,
    onUpdate,
    isLoading,
    disableSubmit
}: CartOrderSummaryProps) {
    const [open, setOpen] = useState(false);

    const currentDate = orderDetails.scheduled_at ? new Date(orderDetails.scheduled_at) : undefined;

    useEffect(() => {
        if (orderDetails.amount_paid === undefined) {
            setOrderDetails(businessId, { amount_paid: totalPrice });
        }
    }, [businessId, orderDetails.amount_paid, setOrderDetails, totalPrice]);

    const handleDateSelect = (date: Date | undefined) => {
        setOpen(false);
        if (!date) return setOrderDetails(businessId, { scheduled_at: "" });

        const newDate = currentDate ? new Date(currentDate) : new Date();
        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

        if (!currentDate) {
            const now = new Date();
            newDate.setHours(now.getHours() + 1, 0, 0, 0);
        }

        setOrderDetails(businessId, { scheduled_at: newDate.toISOString() });
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value;
        if (!time) return;

        const [hours, minutes] = time.split(':').map(Number);
        const newDate = currentDate ? new Date(currentDate) : new Date();

        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        setOrderDetails(businessId, { scheduled_at: newDate.toISOString() });
    };

    const handleAction = () => {
        if (onUpdate) {
            onUpdate();
        } else if (onConfirm) {
            onConfirm();
        }
    };

    return (
        <div className="p-6 border-t bg-muted/90 flex flex-col gap-4 shrink-0 max-h-[85vh]">
            <Collapsible className="space-y-2 shrink min-h-0 overflow-hidden flex flex-col">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex w-full items-center justify-between p-1 h-auto bg-primary/5 hover:bg-primary/10 border-l-4 border-primary rounded-none rounded-r-lg transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-1 text-left">
                            <div className="bg-background/80 p-1.5 rounded-full text-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <ClipboardList className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">Detalles del pedido</span>
                            </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-primary/70 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:flex-1 min-h-0 flex flex-col">
                    <ScrollArea className="h-[35vh] sm:h-[45vh] pr-2 -mr-2">

                        <div className="space-y-3 pt-2">
                            <div className="space-y-1 pt-1">
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
                            <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                        <Label className="text-sm font-semibold text-foreground">Programar entrega</Label>
                                    </div>
                                    {currentDate && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDateSelect(undefined)}
                                            className="h-6 w-6 text-destructive hover:text-destructive/80 hover:bg-transparent"
                                        >
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date-picker"
                                                className={cn(
                                                    "w-full justify-start font-normal text-left px-3 h-8 text-xs",
                                                    !currentDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                                                {currentDate ? (
                                                    <span className="capitalize font-medium">
                                                        {format(currentDate!, "PPP", { locale: es })}
                                                    </span>
                                                ) : (
                                                    <span>Seleccionar fecha</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0 z-[200]" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={currentDate}
                                                captionLayout="dropdown"
                                                onSelect={handleDateSelect}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                                        </div>
                                        <Input
                                            type="time"
                                            id="time-picker"
                                            value={currentDate ? format(currentDate!, "HH:mm") : ""}
                                            onChange={handleTimeChange}
                                            className="pl-9 text-xs bg-background h-8 min-w-[120px] [&::-webkit-calendar-picker-indicator]:hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 pb-1">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium">Tipo de consumo</Label>
                                    <div className="grid grid-cols-3 gap-1">
                                        {[
                                            { value: ConsumptionType.DINE_IN, label: "Mesa", icon: Utensils },
                                            { value: ConsumptionType.TAKE_AWAY, label: "Para llevar", icon: ShoppingBag },
                                            { value: ConsumptionType.DELIVERY, label: "Domicilio", icon: Truck },
                                        ].map((option) => {
                                            const isSelected = orderDetails.consumption_type === option.value;
                                            const Icon = option.icon;
                                            return (
                                                <div
                                                    key={option.value}
                                                    onClick={() => setOrderDetails(businessId, { consumption_type: option.value, table_number: undefined })}
                                                    className={cn(
                                                        "cursor-pointer relative flex items-center justify-center gap-1.5 h-8 rounded-lg border transition-all duration-200",
                                                        isSelected
                                                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                            : "border-transparent hover:bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <Icon className={cn("h-3.5 w-3.5", isSelected && "fill-current/20")} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{option.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {orderDetails.consumption_type === ConsumptionType.DINE_IN && (
                                    <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/20">
                                        <Label htmlFor="table-number" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                                            Número de mesa
                                        </Label>
                                        <div className="relative w-24">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">#</span>
                                            <Input
                                                id="table-number"
                                                type="number"
                                                min="1"
                                                autoFocus
                                                placeholder="0"
                                                value={orderDetails.table_number || ""}
                                                onChange={(e) => setOrderDetails(businessId, { table_number: e.target.value })}
                                                className="pl-6 h-7 text-sm font-bold bg-background text-right focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </CollapsibleContent>
            </Collapsible>

            <div className="flex flex-col gap-4 shrink-0">
                <div className="pt-1.5 border-t">
                    <div className="flex items-end justify-between mb-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-0.5">Total a pagar</span>
                            <span className="text-2xl font-black text-foreground tracking-tighter leading-none">${totalPrice}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1 mb-0.5">
                            <Label htmlFor="pay-later-switch" className="text-[9px] font-bold uppercase text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                                {orderDetails.amount_paid === null ? "Pagar después" : "Pago inmediato"}
                            </Label>
                            <Switch
                                className="h-3.5 w-6 data-[state=checked]:bg-primary/50"
                                defaultChecked={false}
                                id="pay-later-switch"
                                checked={orderDetails.amount_paid === null}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setOrderDetails(businessId, { amount_paid: null });
                                    } else {
                                        setOrderDetails(businessId, { amount_paid: totalPrice });
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {orderDetails.amount_paid !== null && (
                        <div className="min-h-0 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center justify-between gap-3 p-1.5 bg-muted/20 rounded-lg border border-muted/20 mt-1">
                                <div className="flex flex-col gap-0.5 w-1/2 cursor-text" onClick={() => document.getElementById('amount-paid')?.focus()}>
                                    <Label htmlFor="amount-paid" className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider cursor-pointer pl-1">
                                        Paga con
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">$</span>
                                        <Input
                                            autoFocus
                                            id="amount-paid"
                                            type="number"
                                            min="0"
                                            placeholder="0.00"
                                            value={Number.isNaN(orderDetails.amount_paid) ? '' : (orderDetails.amount_paid ?? '')}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
                                                if (!Number.isNaN(val) && val < 0) return;
                                                setOrderDetails(businessId, { amount_paid: val });
                                            }}
                                            className={cn(
                                                "pl-6 h-9 text-lg font-bold bg-background border-2 border-primary/20 shadow-sm focus-visible:border-primary focus-visible:ring-0",
                                                orderDetails.amount_paid !== undefined && orderDetails.amount_paid !== null && (Number.isNaN(orderDetails.amount_paid) || (orderDetails.amount_paid! < totalPrice)) && "text-destructive border-destructive/50 focus-visible:border-destructive"
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="w-px h-7 bg-border/40" />

                                <div className="flex flex-col items-end gap-0.5 w-1/2 pr-1">
                                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Cambio</span>
                                    <span className={cn(
                                        "text-base font-black tracking-tight leading-6",
                                        orderDetails.amount_paid !== undefined && orderDetails.amount_paid !== null && (Number.isNaN(orderDetails.amount_paid) || (orderDetails.amount_paid! - totalPrice) < 0) ? "text-destructive" : "text-green-600"
                                    )}>
                                        ${orderDetails.amount_paid !== undefined && orderDetails.amount_paid !== null && !Number.isNaN(orderDetails.amount_paid) ? (orderDetails.amount_paid! - totalPrice).toFixed(2) : "0.00"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full h-10 text-sm font-bold shadow-sm">
                            Cerrar
                        </Button>
                    </SheetClose>
                    <ButtonLoading
                        loadingState={isLoading}
                        disabled={disableSubmit}
                        onClick={() => {
                            if (orderDetails.amount_paid === null) {
                                handleAction();
                                return;
                            }
                            if (orderDetails.amount_paid === undefined || orderDetails.amount_paid < totalPrice || Number.isNaN(orderDetails.amount_paid)) {
                                toast.error("El monto pagado debe ser mayor o igual al total", { style: toastErrorStyle });
                                return;
                            }
                            handleAction();
                        }}
                        buttonTitle={onUpdate ? "Actualizar" : "Confirmar"}
                        className="text-sm font-bold h-10"
                        size="default"
                    />
                </div>
            </div>
        </div>
    );
}
