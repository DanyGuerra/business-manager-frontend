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

const createProductOptionGroupSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),

  min_options: z
    .string({ error: "Debe ser un número" })
    .min(0, { message: "El mínimo no puede ser negativo" }),

  max_options: z
    .string({ error: "Debe ser un número" })
    .min(1, { message: "El máximo debe ser al menos 1" }),

  available: z.boolean({
    error: "Debe ser verdadero o falso",
  }),
});

export type ProductOptionGroupValues = z.infer<
  typeof createProductOptionGroupSchema
>;

type PropsFormBusiness = {
  buttonTitle: string;
  loadingKey: LoadingsKeyEnum;
  defaultValues?: ProductOptionGroupValues;
  handleSubmitButton: (data: ProductOptionGroupValues) => void;
};

export default function FormProductOptionGroup({
  buttonTitle,
  loadingKey,
  handleSubmitButton,
  defaultValues,
}: PropsFormBusiness) {
  const form = useForm<ProductOptionGroupValues>({
    resolver: zodResolver(createProductOptionGroupSchema),
    defaultValues: defaultValues ?? {
      name: "",
      available: true,
    },
  });

  const { loadings } = useLoadingStore();

  function onSubmit(data: ProductOptionGroupValues) {
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
              <FormLabel>Nombre del grupo de opciones</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="min_options"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mínimo</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_options"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Máximo</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
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
