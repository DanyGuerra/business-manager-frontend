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
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import ButtonLoading from "./buttonLoading";

const createBusinessSchema = z.object({
  name: z.string().min(3, { message: "El nombre es obligatorio" }),
  address: z.string().optional(),
});

export type CreateBusinessValues = z.infer<typeof createBusinessSchema>;

type PropsFormBusiness = {
  buttonTitle: string;
  loadingKey: LoadingsKeyEnum;
  handleSubmitButton: (data: CreateBusinessValues) => void;
};

export default function FormBusiness({
  buttonTitle,
  handleSubmitButton,
  loadingKey,
}: PropsFormBusiness) {
  const form = useForm<CreateBusinessValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const { loadings } = useLoadingStore();

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
                <Input type="text" placeholder="Calle 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center items-center">
          <ButtonLoading
            loadingState={loadings[loadingKey]}
            buttonTitle={buttonTitle}
          />
        </div>
      </form>
    </Form>
  );
}
