"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toastSuccessStyle } from "@/lib/toastStyles";

function ConfirmEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const authApi = useAuthApi();
    const { startLoading, stopLoading } = useLoadingStore();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const hasFetched = useRef(false);

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        const confirmEmail = async () => {
            startLoading(LoadingsKeyEnum.CONFIRM_EMAIL);
            try {
                await authApi.verifyEmail(token);
                setStatus("success");
                toast.success("Correo verificado exitosamente", { style: toastSuccessStyle });
            } catch (error) {
                setStatus("error");
                handleApiError(error);
            } finally {
                stopLoading(LoadingsKeyEnum.CONFIRM_EMAIL);
            }
        };

        confirmEmail();
    }, [token, authApi, startLoading, stopLoading]);

    return (
        <div className="flex flex-col min-h-[calc(100vh-13.5rem)] justify-center items-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-center">Verificación de Correo</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 py-6">
                    {status === "loading" && (
                        <>
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <p className="text-center text-muted-foreground">Verificando tu correo...</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                            <div className="text-center space-y-2">
                                <p className="font-semibold text-lg">¡Verificación Exitosa!</p>
                                <p className="text-sm text-muted-foreground">Tu correo ha sido verificado correctamente.</p>
                            </div>
                            <Button onClick={() => router.push("/login")} className="w-full mt-4">
                                Ir a Iniciar Sesión
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <XCircle className="h-16 w-16 text-red-500" />
                            <div className="text-center space-y-2">
                                <p className="font-semibold text-lg">Error de Verificación</p>
                                <p className="text-sm text-muted-foreground">No pudimos verificar tu correo. El enlace puede ser inválido o haber expirado.</p>
                            </div>
                            <Button onClick={() => router.push("/login")} variant="secondary" className="w-full mt-4">
                                Volver al Inicio
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col min-h-[calc(100vh-13.5rem)] justify-center items-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">Verificación de Correo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 py-6">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <p className="text-center text-muted-foreground">Cargando...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <ConfirmEmailContent />
        </Suspense>
    );
}
