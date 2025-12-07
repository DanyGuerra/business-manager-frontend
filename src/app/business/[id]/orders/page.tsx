'use client';

import { useOrdersApi, Order } from "@/lib/useOrdersApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEffect, useState } from "react";
import { OrderCard } from "@/components/OrderCard";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const { businessId } = useBusinessStore();
  const ordersApi = useOrdersApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function getOrders() {
    setLoading(true);
    try {
      const { data } = await ordersApi.getOrdersByBusinessId(businessId);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getOrders();
  }, [businessId]);

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <div className="flex items-center justify-between px-6 py-5 border-b bg-background">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-sm text-muted-foreground">Gestiona y visualiza los pedidos de tu negocio.</p>
        </div>
        <Button variant="outline" size="sm" onClick={getOrders} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {loading && orders.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <Loader2 className="h-8 w-8 opacity-0" />
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list text-muted-foreground/50"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">No hay pedidos</p>
              <p className="text-sm max-w-xs mx-auto">Aún no se han registrado pedidos en este negocio.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
