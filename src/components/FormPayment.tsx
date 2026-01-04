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
import { useEffect } from "react";
import z from "zod";
import ButtonLoading from "./buttonLoading";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { formatCurrency } from "@/lib/utils";

const paymentSchema = z.object({
    amount_paid: z.string().min(1, "Ingresa el monto"),
    total: z.number(),
}).refine((data) => {
    const amount = parseFloat(data.amount_paid);
    return !isNaN(amount) && amount >= data.total;
}, {
    message: "El pago debe ser mayor o igual al total",
    path: ["amount_paid"],
});

export type PaymentValues = z.infer<typeof paymentSchema>;

type PropsFormPayment = {
    buttonTitle: string;
    loadingKey: LoadingsKeyEnum;
    total: number;
    defaultValues?: Partial<PaymentValues>;
    onSuccess?: () => void;
    handleSubmitButton: (data: PaymentValues) => Promise<void> | void;
};

export default function FormPayment({
    buttonTitle,
    loadingKey,
    handleSubmitButton,
    defaultValues,
    onSuccess,
    total,
}: PropsFormPayment) {
    const form = useForm<PaymentValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount_paid: defaultValues?.amount_paid ?? total.toString(),
            total: total,
        },
    });

    const { loadings } = useLoadingStore();

    useEffect(() => {
        form.reset({
            amount_paid: defaultValues?.amount_paid ?? total.toString(),
            total: total,
        });
    }, [defaultValues, total, form]);

    async function onSubmit(data: PaymentValues) {
        await handleSubmitButton(data);
        onSuccess?.();
    }

    return (
        <Form {...form}>
            <form
                className="flex-col flex w-full gap-5"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-2">Cantidad a pagar</span>
                    <div className="text-2xl font-bold">
                        {formatCurrency(total)}
                    </div>
                </div>

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
                                        autoFocus
                                    />
                                </FormControl>
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
