"use client";

import { useForm } from "react-hook-form";
import { KeyRound, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
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
import ButtonLoading from "@/components/buttonLoading";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import Link from "next/link";
import { useRouter } from "next/navigation";

const forgotPasswordSchema = z.object({
    email: z.string().email("Ingresa un correo electrónico válido"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const authApi = useAuthApi();
    const { loadings, startLoading, stopLoading } = useLoadingStore();
    const router = useRouter();

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: ForgotPasswordValues) {
        try {
            startLoading(LoadingsKeyEnum.RESET_PASSWORD);
            await authApi.requestResetPassword(data.email);
            toast.success("Si el correo existe, recibirás un enlace para restablecer tu contraseña.", {
                style: toastSuccessStyle,
                duration: 5000,
            });
            router.push("/login");
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.RESET_PASSWORD);
        }
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-13.5rem)] justify-center items-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 rounded-full bg-primary/10">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Recuperar Contraseña</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="nombre@ejemplo.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <ButtonLoading
                                loadingState={loadings[LoadingsKeyEnum.RESET_PASSWORD]}
                                buttonTitle="Confirmar"
                                className="w-full"
                            />
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/login" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al inicio de sesión
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
