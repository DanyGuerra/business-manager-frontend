"use client";

import { use } from "react";
import TabProducts from "../TabProducts";

export default function ProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between sm:flex-row sm:items-center flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">
            Administra todos los productos de tu negocio.
          </p>
        </div>
      </div>
      <TabProducts businessId={id} />
    </div>
  );
}
