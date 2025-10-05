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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import ButtonLoading from "@/components/buttonLoading";
import { InputPassword } from "@/components/inputPassword";
import { handleApiError } from "@/utils/handleApiError";

const loginSchema = z.object({
  email: z.email("Ingresa un correo electronico valido"),
  password: z.string().min(6, "La contrasena debe ser de almenos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { loadings, startLoading, stopLoading } = useLoadingStore();
  const { setAccessToken } = useAuth();
  const router = useRouter();
  const businessApi = useAuthApi();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(dataUser: LoginValues) {
    startLoading(LoadingsKeyEnum.LOGIN);
    try {
      const { data } = await businessApi.login(dataUser);

      setAccessToken(data.access_token);
      toast.success("Inicio de sesión exitoso", {
        style: toastSuccessStyle,
      });
      router.push("/profile");
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.LOGIN);
    }
  }

  return (
    <div className="flex flex-col h-full justify-center items-center">
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
