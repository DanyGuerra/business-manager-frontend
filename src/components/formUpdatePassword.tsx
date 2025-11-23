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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLoadingStore } from "@/store/loadingStore";
import { useAuthApi } from "@/lib/useAuthApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { InputPassword } from "@/components/inputPassword";

const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

type FormUpdatePasswordProps = {
    onSuccess: () => void;
};

export default function FormUpdatePassword({
    onSuccess,
}: FormUpdatePasswordProps) {
    const { startLoading, stopLoading, loadings } = useLoadingStore();
    const authApi = useAuthApi();

    const form = useForm<z.infer<typeof updatePasswordSchema>>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
        },
    });

    async function handleUpdatePassword(values: z.infer<typeof updatePasswordSchema>) {
        try {
            startLoading("UPDATE_PASSWORD");
            await authApi.updatePassword(values);
            toast.success("Contraseña actualizada correctamente", {
                style: toastSuccessStyle,
            });
            form.reset();
            onSuccess();
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading("UPDATE_PASSWORD");
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdatePassword)}
                className="space-y-4"
            >
                <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña actual</FormLabel>
                            <FormControl>
                                <InputPassword {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nueva contraseña</FormLabel>
                            <FormControl>
                                <InputPassword {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-center justify-end">
                    <Button
                        type="submit"
                        disabled={loadings["UPDATE_PASSWORD"]}
                    >
                        {loadings["UPDATE_PASSWORD"] && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Guardar cambios
                    </Button>
                </div>
            </form>
        </Form>
    );
}
