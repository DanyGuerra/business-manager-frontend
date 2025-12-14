'use client';
import { format } from "date-fns";

import { useOrdersApi, ConsumptionType, OrderStatus, GetOrdersParams } from "@/lib/useOrdersApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEffect, useState, useCallback } from "react";
import { OrderCard } from "@/components/OrderCard";
import { Loader2, RefreshCw, ShoppingBag, Filter, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrdersStore } from "@/store/ordersStore";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/DateTimePicker";
import { toast } from "sonner";
import { toastErrorStyle } from "@/lib/toastStyles";

export default function OrdersPage() {
  const { businessId } = useBusinessStore();
  const ordersApi = useOrdersApi();
  const { orders, setOrders, pagination, filters, setFilters, resetFilters, setLimit } = useOrdersStore();
  const [loading, setLoading] = useState(true);

  const { status, consumptionType, sort, startDate, endDate } = filters;
  const { page, limit } = pagination;

  const getOrders = useCallback(async (newPage = 1) => {
    setLoading(true);
    try {
      const params: GetOrdersParams = {
        page: newPage,
        limit,
        status: status !== "ALL" ? status : undefined,
        consumption_type: consumptionType !== "ALL" ? consumptionType : undefined,
        sort,
      };

      if (startDate) {
        params.start_date = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
      }
      if (endDate) {
        params.end_date = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
      }

      const { data } = await ordersApi.getOrdersByBusinessId(businessId, params);
      setOrders(data.data, {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });
    } catch {
      toast.error("Failed to fetch orders", { style: toastErrorStyle });
    } finally {
      setLoading(false);
    }
  }, [businessId, limit, status, consumptionType, sort, startDate, endDate, ordersApi, setOrders]);

  useEffect(() => {
    getOrders(page);
  }, [getOrders, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getOrders(newPage);
    }
  };

  const hasActiveFilters = status !== "ALL" || consumptionType !== "ALL" || startDate !== undefined || endDate !== undefined;

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <div className="flex flex-col border-b bg-background px-6 py-5 gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
            <p className="text-sm text-muted-foreground">Gestiona y visualiza los pedidos de tu negocio.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => getOrders(page)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <Select value={status} onValueChange={(val: OrderStatus | "ALL") => setFilters({ status: val })}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value={OrderStatus.PENDING}>Pendiente</SelectItem>
              <SelectItem value={OrderStatus.PREPARING}>Preparando</SelectItem>
              <SelectItem value={OrderStatus.READY}>Listo</SelectItem>
              <SelectItem value={OrderStatus.COMPLETED}>Completado</SelectItem>
              <SelectItem value={OrderStatus.CANCELLED}>Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={consumptionType} onValueChange={(val: ConsumptionType | "ALL") => setFilters({ consumptionType: val })}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Tipo de consumo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todo tipo de consumo</SelectItem>
              <SelectItem value={ConsumptionType.DINE_IN}>Comer aquí</SelectItem>
              <SelectItem value={ConsumptionType.TAKE_AWAY}>Para llevar</SelectItem>
              <SelectItem value={ConsumptionType.DELIVERY}>Domicilio</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(val: 'ASC' | 'DESC') => setFilters({ sort: val })}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Más recientes primero</SelectItem>
              <SelectItem value="ASC">Más antiguos primero</SelectItem>
            </SelectContent>
          </Select>

          <DateTimePicker date={startDate} setDate={(date) => setFilters({ startDate: date })} label="Fecha Inicio" />
          <DateTimePicker date={endDate} setDate={(date) => setFilters({ endDate: date })} label="Fecha Fin" />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground">
              <XCircle className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>
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
              <p className="text-sm max-w-xs mx-auto">No se encontraron pedidos con los filtros seleccionados.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar:</span>
                <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={String(pageSize)}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Pagination className="w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePageChange(page - 1); }}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePageChange(p); }}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePageChange(page + 1); }}
                      className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <span className="text-sm text-muted-foreground mr-2">Resultados: {pagination.total}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
