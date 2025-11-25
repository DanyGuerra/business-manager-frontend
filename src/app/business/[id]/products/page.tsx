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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
        <p className="text-muted-foreground">
          Administra todos los productos de tu negocio.
        </p>
      </div>
      <TabProducts businessId={id} />
    </div>
  );
}
