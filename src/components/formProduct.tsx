"use client";

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
import { useForm } from "react-hook-form";
import z from "zod";
import ButtonLoading from "./buttonLoading";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { Switch } from "@/components/ui/switch";

const createProductSchema = z.object({
  name: z.string().min(3, { message: "El nombre es obligatorio" }),
  description: z.string().optional(),
  base_price: z
    .string()
    .min(1, { message: "El precio debe ser mayor o igual a 0" }),
  available: z.boolean(),
});

export type ProductValues = z.infer<typeof createProductSchema>;

type PropsFormProduct = {
  buttonTitle: string;
  loadingKey: LoadingsKeyEnum;
  defaultValues?: ProductValues;
  handleSubmitButton: (data: ProductValues) => void;
};

export default function FormProduct({
  buttonTitle,
  loadingKey,
  handleSubmitButton,
  defaultValues,
}: PropsFormProduct) {
  const form = useForm<ProductValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      available: true,
    },
  });

  const { loadings } = useLoadingStore();

  function onSubmit(data: ProductValues) {
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
              <FormLabel>Nombre del producto</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Refresco" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Descripción" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="base_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio base</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} min={0} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Disponible</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center items-center">
          <ButtonLoading
            disabled={!form.formState.isDirty}
            loadingState={loadings[loadingKey]}
            buttonTitle={buttonTitle}
          />
        </div>
      </form>
    </Form>
  );
}
