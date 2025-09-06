"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiResponse } from "../types/auth";
import { useRouter } from "next/navigation";
import { toastErrorStyle, toastSuccessStyle } from "@/lib/toastStyles";

const loginSchema = z.object({
  email: z.email("Ingresa un correo electronico valido"),
  username: z
    .string()
    .min(4, "Ingresa un nombre de usuario de almenos 4 caracteres"),
  name: z.string(),
  password: z.string().min(6, "La contrasena debe ser de almenos 6 caracteres"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export default function SignUp() {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function registerUser(data: LoginValues): Promise<ApiResponse> {
    const res = await fetch("api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json() as Promise<ApiResponse>;
  }

  async function onSubmit(dataUser: LoginValues) {
    setLoading(true);
    try {
      const { message, statusCode } = await registerUser(dataUser);

      if (statusCode === 201) {
        toast.success("Usuario creado correctamente", {
          style: toastSuccessStyle,
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else if (statusCode === 409) {
        toast.error(message, { style: toastErrorStyle });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
                      <Input type="string" placeholder="User name" {...field} />
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
                      <Input type="string" placeholder="Nombre" {...field} />
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
                    <FormLabel>Password</FormLabel>

                    <div className="relative">
                      <Input
                        type={show ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onMouseDown={() => setShow(true)}
                        onMouseUp={() => setShow(false)}
                        onMouseLeave={() => setShow(false)} // por si el usuario arrastra el cursor fuera
                        onTouchStart={() => setShow(true)}
                        onTouchEnd={() => setShow(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {show ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center items-center">
                <Button type="submit" className="w-50 cursor-pointer">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Registrarse"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
