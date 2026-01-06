"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
}
  from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { X } from "lucide-react";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import ButtonLoading from "@/components/buttonLoading";
import { InputPassword } from "@/components/inputPassword";
import { handleApiError } from "@/utils/handleApiError";
import { useUserStore } from "@/store/useUserStore";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electronico valido"),
  password: z.string().min(6, "La contrasena debe ser de almenos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { loadings, startLoading, stopLoading } = useLoadingStore();
  const { setUser, setIsLoading } = useUserStore();
  const { setAccessToken } = useAuth();
  const authApi = useAuthApi();
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleResendVerification(email: string) {
    try {
      startLoading(LoadingsKeyEnum.RESEND_VERIFICATION);
      const { message } = await authApi.resendVerificationEmail(email);
      toast.success(message, { style: toastSuccessStyle });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.RESEND_VERIFICATION);
    }
  }

  async function onSubmit(dataUser: LoginValues) {
    startLoading(LoadingsKeyEnum.LOGIN);
    setIsLoading(true)
    try {
      const { data: { access_token } } = await authApi.login(dataUser);
      setAccessToken(access_token);
      const { data: userData } = await authApi.getMe();

      if (!userData.is_verified) {
        toast.custom((id) => (
          <div className="relative flex flex-col gap-3 w-full bg-red-600/60 backdrop-blur text-white p-4 rounded-lg shadow-lg">
            <button
              onClick={() => toast.dismiss(id)}
              className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col gap-1 pr-6">
              <p className="font-bold text-sm">Cuenta no verificada</p>
              <p className="text-xs opacity-90">Tu cuenta no ha sido verificada. Por favor revisa tu correo. En caso de que no lo hayas recibido, puedes reenviarlo.</p>
            </div>
            <Button
              variant="default"
              size="sm"
              className="w-full h-8 text-xs font-semibold bg-white text-red-600 hover:bg-white/90 border-0"
              onClick={() => {
                handleResendVerification(dataUser.email);
                toast.dismiss(id);
              }}
            >
              Reenviar correo
            </Button>
          </div>
        ), { duration: 20000 });
        setAccessToken(null);
        return;
      }

      setUser(userData);

      toast.success("Inicio de sesión exitoso", {
        style: toastSuccessStyle,
      });

      router.push("/profile");
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.LOGIN);
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-13.5rem)] justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <InputPassword
                        placeholder="••••••••"
                        {...field}
                        className="pr-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ButtonLoading
                loadingState={loadings[LoadingsKeyEnum.LOGIN]}
                buttonTitle="Iniciar Sesión"
              ></ButtonLoading>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex-col gap-2 text-sm">
          <div>
            No tienes cuenta?{" "}
            <Link href="/signup" className="font-bold">
              Registrate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
