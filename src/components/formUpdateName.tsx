"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLoadingStore } from "@/store/loadingStore";
import { useAuthApi } from "@/lib/useAuthApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useEffect } from "react";

const updateNameSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
});

type FormUpdateNameProps = {
    defaultName: string;
    onSuccess: (newName: string) => void;
};

export default function FormUpdateName({
    defaultName,
    onSuccess,
}: FormUpdateNameProps) {
    const { startLoading, stopLoading, loadings } = useLoadingStore();
    const authApi = useAuthApi();

    const form = useForm<z.infer<typeof updateNameSchema>>({
        resolver: zodResolver(updateNameSchema),
        defaultValues: {
            name: defaultName,
        },
    });

    useEffect(() => {
        form.reset({ name: defaultName });
    }, [defaultName, form]);

    async function handleUpdateName(values: z.infer<typeof updateNameSchema>) {
        try {
            startLoading("UPDATE_NAME");
            const { data } = await authApi.updateUser(values);
            toast.success("Nombre actualizado correctamente", {
                style: toastSuccessStyle,
            });
            onSuccess(data.name);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading("UPDATE_NAME");
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdateName)}
                className="space-y-4"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loadings["UPDATE_NAME"] || !form.formState.isDirty}>
                    {loadings["UPDATE_NAME"] && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar cambios
                </Button>
            </form>
        </Form>
    );
}
