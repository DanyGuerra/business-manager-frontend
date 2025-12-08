'use client';

import { useOrdersApi, Order } from "@/lib/useOrdersApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEffect, useState } from "react";
import { OrderCard } from "@/components/OrderCard";
import { Loader2, RefreshCw, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { handleApiError } from "@/utils/handleApiError";
import { toastSuccessStyle } from "@/lib/toastStyles";

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

  const handleOrderDelete = async (orderId: string, businessId: string) => {
    try {
      await ordersApi.deleteOrder(orderId, businessId);
      getOrders();
      toast.success("Orden eliminada correctamente", { style: toastSuccessStyle });

    } catch (error) {
      handleApiError(error);
    }
  };

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
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <ShoppingBag />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">No hay pedidos</p>
              <p className="text-sm max-w-xs mx-auto">Aún no se han registrado pedidos en este negocio.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onDelete={handleOrderDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
