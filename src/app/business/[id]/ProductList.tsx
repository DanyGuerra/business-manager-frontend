"use client";

import { Product } from "@/lib/useBusinessApi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import OptionGroupList from "./OptionGroupList";

type ProductListProps = {
  products: Product[];
};
export default function ProductList({ products }: ProductListProps) {
  return (
    <>
      {products.length ? (
        <div className="space-y-4">
          {products.map((product) => (
            <Collapsible key={product.id} defaultOpen>
              <CollapsibleTrigger className="flex justify-between w-full p-2 bg-muted rounded">
                <div>
                  <span>{product.name}</span>
                </div>
                <span>${product.base_price}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2">
                {product.description && (
                  <p className="text-sm text-muted-foreground">
                    Descripción: {product.description}
                  </p>
                )}
                <OptionGroupList optionGroups={product.option_groups} />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-25">
          <p className="text-muted-foreground">No hay productos</p>
        </div>
      )}
    </>
  );
}
