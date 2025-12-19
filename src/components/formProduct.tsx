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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGroup } from "@/lib/useBusinessApi";
import { useMemo } from "react";

const baseProductSchema = z.object({
  name: z.string().min(3, { message: "El nombre es obligatorio" }),
  description: z.string().optional(),
  base_price: z
    .string()
    .min(1, { message: "El precio debe ser mayor o igual a 0" }),
  available: z.boolean(),
});

export type ProductValues = z.infer<typeof baseProductSchema> & {
  menuId?: string;
};

type PropsFormProduct = {
  buttonTitle: string;
  loadingKey: LoadingsKeyEnum;
  defaultValues?: Partial<ProductValues>;
  handleSubmitButton: (data: ProductValues) => void;
  menus?: ProductGroup[];
};

export default function FormProduct({
  buttonTitle,
  loadingKey,
  handleSubmitButton,
  defaultValues,
  menus,
}: PropsFormProduct) {
  const formSchema = useMemo(() => {
    if (menus && menus.length > 0) {
      return baseProductSchema.extend({
        menuId: z.string().min(1, { message: "Debes seleccionar un menú" }),
      });
    }
    return baseProductSchema.extend({
      menuId: z.string().optional(),
    });
  }, [menus]);

  const form = useForm<ProductValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      base_price: defaultValues?.base_price ?? "",
      available: defaultValues?.available ?? true,
      menuId: (defaultValues)?.menuId ?? "",
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

        {menus && menus.length > 0 && (
          <FormField
            control={form.control}
            name="menuId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Menú</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un menú" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {menus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        {menus && menus.length === 0 && (
          <div className="rounded-md bg-yellow-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No hay menús disponibles
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Debes crear al menos un menú (grupo de productos) antes de
                    poder crear un producto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center">
          <ButtonLoading
            disabled={!form.formState.isDirty || (menus !== undefined && menus.length === 0)}
            loadingState={loadings[loadingKey]}
            buttonTitle={buttonTitle}
          />
        </div>
      </form>
    </Form>
  );
}
