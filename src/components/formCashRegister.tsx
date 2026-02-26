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

import { formatCurrency } from "@/utils/printTicket";
import { CopyMinus, CopyPlus } from "lucide-react";

const cashRegisterTransactionSchema = z.object({
    amount: z.number().min(0.01, { message: "El monto debe ser mayor a 0" }),
    description: z.string().min(3, { message: "Agrega una descripción de al menos 3 caracteres" }),
});

export type CashRegisterTransactionValues = z.infer<typeof cashRegisterTransactionSchema>;

type PropsFormCashRegister = {
    buttonTitle: string;
    loadingKey: LoadingsKeyEnum;
    handleSubmitButton: (data: CashRegisterTransactionValues) => void;
    currentBalance: number;
    transactionType: "IN" | "OUT";
};

export default function FormCashRegister({
    buttonTitle,
    handleSubmitButton,
    loadingKey,
    currentBalance,
    transactionType,
}: PropsFormCashRegister) {
    const form = useForm<CashRegisterTransactionValues>({
        resolver: zodResolver(cashRegisterTransactionSchema),
        defaultValues: { amount: 0, description: "" },
    });

    const { loadings } = useLoadingStore();
    const amount = form.watch("amount");

    const projectedBalance = transactionType === "IN" ? currentBalance + (amount || 0) : currentBalance - (amount || 0);
    const isOverBalance = transactionType === "OUT" && (amount || 0) > currentBalance;

    function onSubmit(data: CashRegisterTransactionValues) {
        handleSubmitButton(data);
    }

    return (
        <Form {...form}>
            <form
                className="flex flex-col w-full gap-5"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div className="flex flex-col gap-1.5 p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Saldo disponible:</span>
                        <span className="font-medium">{formatCurrency(currentBalance)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Movimiento:</span>
                        <span className={`font-medium flex items-center gap-1 ${transactionType === "IN" ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}>
                            {transactionType === "IN" ? <CopyPlus className="w-3 h-3" /> : <CopyMinus className="w-3 h-3" />}
                            {transactionType === "IN" ? "+" : "-"}{formatCurrency(amount || 0)}
                        </span>
                    </div>

                    <div className="h-px bg-border my-1.5" />

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Caja al finalizar:</span>
                        <span className={`text-lg font-bold ${isOverBalance ? "text-rose-600 dark:text-rose-500" : ""}`}>
                            {formatCurrency(projectedBalance)}
                        </span>
                    </div>
                </div>

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
                        disabled={!form.formState.isDirty || isOverBalance}
                        loadingState={loadings[loadingKey]}
                        buttonTitle={buttonTitle}
                    />
                </div>
            </form>
        </Form>
    );
}
