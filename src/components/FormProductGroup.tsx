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

const createProductGroupSchema = z.object({
  name: z.string().min(3, { message: "El nombre es obligatorio" }),
  description: z.string().optional(),
});

export type ProductGroupValues = z.infer<typeof createProductGroupSchema>;

type PropsFormBusiness = {
  buttonTitle: string;
  loadingKey: LoadingsKeyEnum;
  defaultValues?: ProductGroupValues;
  handleSubmitButton: (data: ProductGroupValues) => void;
};

export default function FormProductGroup({
  buttonTitle,
  loadingKey,
  handleSubmitButton,
  defaultValues,
}: PropsFormBusiness) {
  const form = useForm<ProductGroupValues>({
    resolver: zodResolver(createProductGroupSchema),
    defaultValues,
  });

  const { loadings } = useLoadingStore();

  function onSubmit(data: ProductGroupValues) {
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
              <FormLabel>Nombre del menú</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Comida" {...field} />
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
                <Input type="text" placeholder="Menú de comida" {...field} />
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
