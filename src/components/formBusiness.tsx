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
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateBusinessValues = z.infer<typeof createBusinessSchema>;

type PropsFormBusiness = {
  buttonTitle: string;
  loadingKey: LoadingsKeyEnum;
  defaultValues?: CreateBusinessValues;
  handleSubmitButton: (data: CreateBusinessValues) => void;
};

export default function FormBusiness({
  buttonTitle,
  handleSubmitButton,
  loadingKey,
  defaultValues,
}: PropsFormBusiness) {
  const form = useForm<CreateBusinessValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      ...defaultValues,
      address: defaultValues?.address || "",
      street: defaultValues?.street || "",
      neighborhood: defaultValues?.neighborhood || "",
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
      zipCode: defaultValues?.zipCode || "",
      phone: defaultValues?.phone || "",
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
              <FormLabel>Nombre del negocio <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="text" placeholder="Mi Negocio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Calle y número</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Av. Principal 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colonia</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Centro" {...field} />
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
                <FormLabel>Referencias adicionales</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Cruces, color de casa..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Ciudad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Estado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Código Postal</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center items-center mt-2">
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
