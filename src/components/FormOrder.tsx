"use client";

import { formatCurrency, cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { ConsumptionType } from "@/lib/useOrdersApi";
import { DatePicker } from "./ui/date-picker";
import { useEffect } from "react";
import z from "zod";
import ButtonLoading from "./buttonLoading";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, ShoppingBag, Truck } from "lucide-react";
import { format } from "date-fns";

const orderSchema = z.object({
    customer_name: z.string().optional(),
    amount_paid: z.number().optional(),
    total: z.number().optional(),
    notes: z.string().optional(),
    consumption_type: z.nativeEnum(ConsumptionType),
    scheduled_at: z.date().optional(),
    table_number: z.number().nullable().optional(),
}).refine((data) => {
    if (data.amount_paid !== undefined && data.total !== undefined) {
        return data.amount_paid >= data.total;
    }
    return true;
}, {
    message: "El pago debe ser mayor o igual al total",
    path: ["amount_paid"],
});

export type OrderValues = z.infer<typeof orderSchema>;

type PropsFormOrder = {
    buttonTitle: string;
    loadingKey: LoadingsKeyEnum;
    defaultValues?: Partial<OrderValues>;
    onSuccess?: () => void;
    handleSubmitButton: (data: OrderValues) => Promise<void> | void;
};

export default function FormOrder({
    buttonTitle,
    loadingKey,
    handleSubmitButton,
    defaultValues,
    onSuccess,
}: PropsFormOrder) {
    const form = useForm<OrderValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            customer_name: defaultValues?.customer_name ?? "",
            amount_paid: defaultValues?.amount_paid,
            total: defaultValues?.total,
            notes: defaultValues?.notes ?? "",
            consumption_type: defaultValues?.consumption_type ?? ConsumptionType.DINE_IN,
            scheduled_at: defaultValues?.scheduled_at,
            table_number: defaultValues?.table_number,
        },
    });

    const { loadings } = useLoadingStore();

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                customer_name: defaultValues.customer_name ?? "",
                amount_paid: defaultValues.amount_paid,
                total: defaultValues.total,
                notes: defaultValues.notes ?? "",
                consumption_type: defaultValues.consumption_type ?? ConsumptionType.DINE_IN,
                scheduled_at: defaultValues.scheduled_at,
                table_number: defaultValues.table_number,
            });
        }
    }, [defaultValues, form]);

    async function onSubmit(data: OrderValues) {
        await handleSubmitButton(data);
        onSuccess?.();
    }

    return (
        <Form {...form}>
            <form
                className="flex-col flex w-full gap-5"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="customer_name"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Nombre del cliente</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Nombre del cliente" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="table_number"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>Mesa</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="#"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                        disabled={form.watch("consumption_type") !== ConsumptionType.DINE_IN}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="consumption_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de consumo</FormLabel>
                                <FormControl>
                                    <Tabs
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            if (value !== ConsumptionType.DINE_IN) {
                                                form.setValue("table_number", null);
                                            }
                                        }}
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
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="scheduled_at"
                            render={({ field }) => (
                                <>
                                    <FormItem className="flex flex-col flex-1">
                                        <FormLabel className="text-xs font-medium">Fecha programada</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                date={field.value}
                                                setDate={(date) => {
                                                    if (!date) {
                                                        field.onChange(undefined);
                                                        return;
                                                    }
                                                    const newDate = new Date(date);
                                                    if (field.value) {
                                                        newDate.setHours(field.value.getHours(), field.value.getMinutes());
                                                    } else {
                                                        const now = new Date();
                                                        newDate.setHours(now.getHours(), now.getMinutes());
                                                    }
                                                    field.onChange(newDate);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>

                                    <FormItem className="flex flex-col w-[120px]">
                                        <FormLabel className="text-xs font-medium">Hora</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                className="text-sm bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                                value={field.value ? format(field.value, "HH:mm") : ""}
                                                onChange={(e) => {
                                                    const time = e.target.value;
                                                    if (!time) return;
                                                    const [hours, minutes] = time.split(':').map(Number);
                                                    const newDate = field.value ? new Date(field.value) : new Date();
                                                    newDate.setHours(hours);
                                                    newDate.setMinutes(minutes);
                                                    newDate.setSeconds(0);
                                                    field.onChange(newDate);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Notas adicionales de la orden..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex w-full">
                    <FormField
                        control={form.control}
                        name="amount_paid"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Paga con</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <div className="flex justify-between items-center text-xs px-1 pt-1">
                                    <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">{formatCurrency(form.watch("total") || 0)}</span></span>
                                    <span className="text-muted-foreground">Cambio: <span className={cn("font-bold", (field.value || 0) - (form.watch("total") || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>{formatCurrency(((field.value || 0) - (form.watch("total") || 0)))}</span></span>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-center items-center">
                    <ButtonLoading
                        disabled={!form.formState.isDirty}
                        loadingState={loadings[loadingKey]}
                        buttonTitle={buttonTitle}
                    />
                </div>
            </form>
        </Form>
    );
}
