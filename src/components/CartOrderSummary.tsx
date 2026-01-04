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
import { ChevronsUpDown, Utensils, ShoppingBag, Truck, ChevronDownIcon, Trash2Icon } from "lucide-react";
import { ConsumptionType } from "@/lib/useOrdersApi";
import { OrderDetails } from "@/store/cartStore";
import ButtonLoading from "./buttonLoading";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { SheetClose } from "@/components/ui/sheet";
import { Calendar } from "./ui/calendar";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

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

    const handleDateSelect = (date: Date | undefined) => {
        setOpen(false);
        if (!date) return setOrderDetails(businessId, { scheduled_at: "" });

        const newDate = currentDate ? new Date(currentDate) : new Date();
        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

        if (!currentDate) {
            const now = new Date();
            newDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
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
        <div className="p-6 border-t bg-muted/90 space-y-4 shrink-0">
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
                                <PopoverContent className="w-auto overflow-hidden p-0 z-[200]" align="start">
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
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Tipo de consumo</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: ConsumptionType.DINE_IN, label: "Comer aquí", icon: Utensils },
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
                                                "cursor-pointer relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                                                isSelected
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-muted hover:border-muted-foreground/25 bg-background text-muted-foreground"
                                            )}
                                        >
                                            <Icon className={cn("h-5 w-5", isSelected && "fill-current/20")} />
                                            <span className="text-xs font-semibold">{option.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            orderDetails.consumption_type === ConsumptionType.DINE_IN
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                        )}>
                            <div className="overflow-hidden space-y-2">
                                <Label htmlFor="table-number" className="text-xs font-medium">Número de mesa</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">#</span>
                                    <Input
                                        id="table-number"
                                        type="number"
                                        min="1"
                                        placeholder="0"
                                        value={orderDetails.table_number || ""}
                                        onChange={(e) => setOrderDetails(businessId, { table_number: e.target.value })}
                                        className="pl-7 h-11 bg-background text-base font-medium"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            <Separator />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="pay-later-switch" className="text-xs font-medium">Pagar despues</Label>
                    <Switch
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

                <div className={cn("space-y-2 transition-opacity duration-200", orderDetails.amount_paid === null && "opacity-50 pointer-events-none")}>
                    <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="amount-paid" className="text-xs font-medium">Paga con</Label>
                        <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                            <Input
                                id="amount-paid"
                                type="number"
                                min="0"
                                placeholder="0.00"
                                disabled={orderDetails.amount_paid === null}
                                value={orderDetails.amount_paid ?? ""}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (val < 0) return;
                                    setOrderDetails(businessId, { amount_paid: isNaN(val) ? undefined : val });
                                }}
                                className={cn(
                                    "pl-5 h-7 text-xs bg-background text-right",
                                    orderDetails.amount_paid !== undefined && orderDetails.amount_paid !== null && orderDetails.amount_paid < totalPrice && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                        </div>
                    </div>

                    {orderDetails.amount_paid !== undefined && orderDetails.amount_paid !== null && (
                        <div className="flex justify-between font-medium text-xs">
                            <span>Cambio</span>
                            <span className={cn(
                                (orderDetails.amount_paid - totalPrice) < 0 ? "text-destructive" : "text-green-600"
                            )}>
                                ${(orderDetails.amount_paid - totalPrice).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between font-bold text-base border-t border-dashed pt-2">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                </div>
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
                        if (orderDetails.amount_paid === undefined || orderDetails.amount_paid < totalPrice) {
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
    );
}
