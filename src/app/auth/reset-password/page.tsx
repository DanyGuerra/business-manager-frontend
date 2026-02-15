"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { toast } from "sonner"; // Removed toast import from here since it's used directly in onSubmit
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { InputPassword } from "@/components/inputPassword";
import ButtonLoading from "@/components/buttonLoading";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toastSuccessStyle, toastErrorStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const authApi = useAuthApi();
    const { loadings, startLoading, stopLoading } = useLoadingStore();

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: ResetPasswordValues) {
        if (!token) {
            toast.error("Token no válido o expirado", { style: toastErrorStyle });
            return;
        }

        try {
            startLoading(LoadingsKeyEnum.RESET_PASSWORD);
            await authApi.resetPassword({
                token: token,
                newPassword: data.password,
            });
            toast.success("Contraseña restablecida exitosamente", { style: toastSuccessStyle });
            router.push("/login");
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.RESET_PASSWORD);
        }
    }

    if (!token) {
        return (
            <div className="flex flex-col min-h-[calc(100vh-13.5rem)] justify-center items-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">Restablecer Contraseña</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 py-6">
                        <XCircle className="h-16 w-16 text-red-500" />
                        <div className="text-center space-y-2">
                            <p className="font-semibold text-lg">Error</p>
                            <p className="text-sm text-muted-foreground">El enlace para restablecer la contraseña no es válido o ha expirado. Por favor solicita un nuevo enlace.</p>
                        </div>
                        <Button onClick={() => router.push("/login")} variant="secondary" className="w-full mt-4">
                            Volver al Inicio
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-13.5rem)] justify-center items-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Restablecer Contraseña</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tu nueva contraseña a continuación.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nueva Contraseña</FormLabel>
                                        <FormControl>
                                            <InputPassword placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Contraseña</FormLabel>
                                        <FormControl>
                                            <InputPassword placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <ButtonLoading
                                loadingState={loadings[LoadingsKeyEnum.RESET_PASSWORD]}
                                buttonTitle="Restablecer Contraseña"
                                className="w-full"
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
