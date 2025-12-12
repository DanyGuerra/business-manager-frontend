"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Edit2Icon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import OptionGroupList from "./OptionGroupList";
import { Product } from "@/lib/useBusinessApi";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEditModeStore } from "@/store/editModeStore";

type ProductDetailSheetProps = {
    product: Product;
};

export default function ProductDetailSheet({ product }: ProductDetailSheetProps) {
    const { isEditMode, setEditMode } = useEditModeStore();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between group/btn hover:border-primary/50 hover:bg-primary/5"
                >
                    <span>Gestionar opciones</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover/btn:translate-x-1" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-1">
                        <SheetTitle className="text-2xl">{product.name}</SheetTitle>
                        <SheetDescription>
                            Gestiona los grupos de opciones y variantes para este producto.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-end space-x-2 pb-2">
                        <Switch
                            id="edit-mode"
                            checked={isEditMode}
                            onCheckedChange={setEditMode}
                        />
                        <Label htmlFor="edit-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Modo Edición
                        </Label>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Detalles del Producto</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs">Precio Base</span>
                                <span className="font-semibold">${product.base_price}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Estado</span>
                                <span className={cn("font-medium", product.available ? "text-green-600" : "text-destructive")}>
                                    {product.available ? "Disponible" : "No disponible"}
                                </span>
                            </div>
                        </div>
                        {product.description && (
                            <div>
                                <span className="text-muted-foreground block text-xs mb-1">Descripción</span>
                                <p className="text-muted-foreground leading-snug">{product.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <OptionGroupList
                            productId={product.id}
                            optionGroups={product.option_groups}
                            productGroupId={product.id}
                            isEditMode={isEditMode}
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
