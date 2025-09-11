"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const createBusinessSchema = z.object({
  name: z.string().min(3, { message: "El nombre es obligatorio" }),
  address: z.string().optional(),
});

export type CreateBusinessValues = z.infer<typeof createBusinessSchema>;
type PropsFormBusiness = {
  buttonTitle: string;
  handleSubmitButton: (data: CreateBusinessValues) => void;
};

export default function FormBusiness({
  buttonTitle,
  handleSubmitButton,
}: PropsFormBusiness) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateBusinessValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  function onSubmit(data: CreateBusinessValues) {
    handleSubmitButton(data);
  }

  return (
    <Form {...form}>
      <form
        className="flex-col flex w-full gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del negocio</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Negocio A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Dirección A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center items-center">
          <Button
            type="submit"
            className="w-50 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `${buttonTitle}`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
