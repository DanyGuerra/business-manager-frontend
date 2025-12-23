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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductGroup } from "@/lib/useBusinessApi";
import { useMemo, useState, useEffect } from "react";

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
  onSearchMenus?: (query: string) => void;
};

export default function FormProduct({
  buttonTitle,
  loadingKey,
  handleSubmitButton,
  defaultValues,
  menus,
  onSearchMenus,
}: PropsFormProduct) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchMenus) {
        onSearchMenus(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchMenus]);

  useEffect(() => {
    if (defaultValues?.menuId && menus) {
      const selectedMenu = menus.find(m => m.id === defaultValues.menuId);
      if (selectedMenu) {
        setSearchQuery(selectedMenu.name);
      }
    }
  }, [defaultValues?.menuId, menus]);

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

        {menus && <FormField
          control={form.control}
          name="menuId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Menú</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between pl-3 pr-3 font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <span className="truncate">
                        {field.value
                          ? menus?.find((menu) => menu.id === field.value)?.name || "Selecciona un menú"
                          : "Selecciona un menú"}
                      </span>
                      <div className="flex items-center ml-2 shrink-0 opacity-50 gap-1">
                        {field.value && (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue("menuId", "");
                            }}
                            className="hover:opacity-100 hover:text-destructive cursor-pointer p-0.5 rounded-sm transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </div>
                        )}
                        <ChevronsUpDown className="h-4 w-4" />
                      </div>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="p-2">
                    <Input
                      placeholder="Buscar menú..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 mb-2"
                    />
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                      {menus?.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No se encontraron menús.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {menus?.map((menu) => (
                            <div
                              key={menu.id}
                              role="button"
                              onClick={() => {
                                form.setValue("menuId", menu.id);
                                setSearchQuery(menu.name);
                                setOpen(false);
                              }}
                              className={cn(
                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors cursor-pointer",
                                menu.id === field.value && "bg-accent text-accent-foreground"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  menu.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {menu.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />}

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
            disabled={!form.formState.isDirty || (menus !== undefined && menus.length === 0)}
            loadingState={loadings[loadingKey]}
            buttonTitle={buttonTitle}
          />
        </div>
      </form>
    </Form>
  );
}
