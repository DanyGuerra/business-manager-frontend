"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useAuthApi } from "@/lib/useAuthApi";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import ButtonLoading from "@/components/buttonLoading";
import { InputPassword } from "@/components/inputPassword";
import { handleApiError } from "@/utils/handleApiError";

const loginSchema = z.object({
  email: z.email("Ingresa un correo electronico valido"),
  username: z
    .string()
    .min(4, "Ingresa un nombre de usuario de almenos 4 caracteres")
    .regex(
      /^[a-z0-9_-]+$/,
      "Username solo puede contener letras minúsculas, números y los símbolos _ o -."
    ),
  name: z.string(),
  password: z.string().min(6, "La contrasena debe ser de almenos 6 caracteres"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export default function SignUp() {
  const authApi = useAuthApi();
  const { startLoading, stopLoading, loadings } = useLoadingStore();
  const router = useRouter();

  async function onSubmit(dataUser: LoginValues) {
    startLoading(LoadingsKeyEnum.SIGNUP);
    try {
      const { statusCode } = await authApi.signup(dataUser);

      if (statusCode === 201) {
        toast.success("Usuario creado correctamente", {
          style: toastSuccessStyle,
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.SIGNUP);
    }
  }

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      username: "",
      name: "",
      password: "",
    },
  });

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl text-center">Registrate</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electronico</FormLabel>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Nombre" {...field} />
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
                    <InputPassword
                      placeholder="••••••••"
                      {...field}
                      className="pr-10"
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center items-center">
                <ButtonLoading
                  loadingState={loadings[LoadingsKeyEnum.SIGNUP]}
                  buttonTitle="Registrarse"
                ></ButtonLoading>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
