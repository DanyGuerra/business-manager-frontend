"use client";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    notes: z.string().optional(),
    consumption_type: z.nativeEnum(ConsumptionType),
    scheduled_at: z.date().optional(),
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
            notes: defaultValues?.notes ?? "",
            consumption_type: defaultValues?.consumption_type ?? ConsumptionType.DINE_IN,
            scheduled_at: defaultValues?.scheduled_at,
        },
    });

    const { loadings } = useLoadingStore();

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                customer_name: defaultValues.customer_name ?? "",
                notes: defaultValues.notes ?? "",
                consumption_type: defaultValues.consumption_type ?? ConsumptionType.DINE_IN,
                scheduled_at: defaultValues.scheduled_at,
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
                <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del cliente</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Nombre del cliente" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                        onValueChange={field.onChange}
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
                                        <FormLabel className="text-xs font-medium">Fecha</FormLabel>
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
