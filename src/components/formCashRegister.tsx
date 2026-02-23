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
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import ButtonLoading from "./buttonLoading";

const cashRegisterTransactionSchema = z.object({
    amount: z.number().min(0.01, { message: "El monto debe ser mayor a 0" }),
    description: z.string().min(3, { message: "Agrega una descripción de al menos 3 caracteres" }),
});

export type CashRegisterTransactionValues = z.infer<typeof cashRegisterTransactionSchema>;

type PropsFormCashRegister = {
    buttonTitle: string;
    loadingKey: LoadingsKeyEnum;
    handleSubmitButton: (data: CashRegisterTransactionValues) => void;
};

export default function FormCashRegister({
    buttonTitle,
    handleSubmitButton,
    loadingKey,
}: PropsFormCashRegister) {
    const form = useForm<CashRegisterTransactionValues>({
        resolver: zodResolver(cashRegisterTransactionSchema),
        defaultValues: { amount: 0, description: "" },
    });

    const { loadings } = useLoadingStore();

    function onSubmit(data: CashRegisterTransactionValues) {
        handleSubmitButton(data);
    }

    return (
        <Form {...form}>
            <form
                className="flex flex-col w-full gap-5"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cantidad ($)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="100.00"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Concepto</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Fondo inicial, Pago a proveedor, etc..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-center items-center mt-2">
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
