'use client';

import { useEffect, useState } from "react";

import { OrderStatus, ConsumptionType } from "@/lib/useOrdersApi";
import { useGetOrders } from "@/app/hooks/useGetOrders";
import { OrderCard } from "@/components/OrderCard";
import { ShoppingBag, Filter, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrdersStore } from "@/store/ordersStore";
import { OrderCardSkeleton } from "@/components/OrderCardSkeleton";
import { DataTablePagination } from "@/components/DataTablePagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/DateTimePicker";

export default function OrdersPage() {
    const { orders, pagination, filters, setFilters, resetFilters, setLimit, setPage } = useOrdersStore();
    const { loading, getOrders } = useGetOrders();
    const [initialized, setInitialized] = useState(false);

    const { status, consumptionType, sort, startDate, endDate, customer_name } = filters;
    const { page, limit } = pagination;

    const [localCustomerName, setLocalCustomerName] = useState(customer_name);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localCustomerName !== customer_name) {
                setFilters({ customer_name: localCustomerName.trim() });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localCustomerName, customer_name, setFilters]);

    useEffect(() => {
        if (!initialized) {
            const date = new Date();
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            setFilters({
                sort: "DESC",
                startDate,
                endDate
            });
            setInitialized(true);
        }
    }, [setFilters, initialized]);

    useEffect(() => {
        if (initialized) {
            getOrders();
        }
    }, [getOrders, initialized, customer_name, status, consumptionType, sort, startDate, endDate, page, limit]);

    const hasActiveFilters = status !== "ALL" || consumptionType !== "ALL" || startDate !== undefined || endDate !== undefined || customer_name !== "";

    return (
        <div className="flex flex-col h-full bg-muted/10">
            <div className="flex flex-col border-b bg-background px-4 py-4 md:px-6 md:py-5 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Pedidos</h2>
                        <p className="text-sm text-muted-foreground">Gestiona y visualiza los pedidos de tu negocio.</p>
                    </div>
                </div>


                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2 mr-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filtros:</span>
                    </div>

                    <div className="relative flex-1 min-w-[140px] max-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={localCustomerName}
                            onChange={(e) => setLocalCustomerName(e.target.value.trimStart())}
                            className="h-9 w-full pl-9 text-xs"
                        />
                    </div>

                    <Select value={status} onValueChange={(val: OrderStatus | "ALL") => setFilters({ status: val })}>
                        <SelectTrigger className="h-9 text-xs flex-1 min-w-[140px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todo estado</SelectItem>
                            <SelectItem value={OrderStatus.PENDING}>Pendiente</SelectItem>
                            <SelectItem value={OrderStatus.PREPARING}>Preparando</SelectItem>
                            <SelectItem value={OrderStatus.READY}>Listo</SelectItem>
                            <SelectItem value={OrderStatus.COMPLETED}>Completado</SelectItem>
                            <SelectItem value={OrderStatus.CANCELLED}>Cancelado</SelectItem>
                            <SelectItem value={OrderStatus.SCHEDULED}>Agendado</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={consumptionType} onValueChange={(val: ConsumptionType | "ALL") => setFilters({ consumptionType: val })}>
                        <SelectTrigger className="h-9 text-xs flex-1 min-w-[140px]">
                            <SelectValue placeholder="Consumo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todo tipo</SelectItem>
                            <SelectItem value={ConsumptionType.DINE_IN}>Comer aquí</SelectItem>
                            <SelectItem value={ConsumptionType.TAKE_AWAY}>Para llevar</SelectItem>
                            <SelectItem value={ConsumptionType.DELIVERY}>Domicilio</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={(val: 'ASC' | 'DESC') => setFilters({ sort: val })}>
                        <SelectTrigger className="h-9 text-xs flex-1 min-w-[140px]">
                            <SelectValue placeholder="Orden" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DESC">Recientes</SelectItem>
                            <SelectItem value="ASC">Antiguos</SelectItem>
                        </SelectContent>
                    </Select>

                    <DateTimePicker
                        date={startDate}
                        setDate={(date) => setFilters({ startDate: date })}
                        label="Inicio"
                        className="flex-1 min-w-[140px] w-auto"
                    />
                    <DateTimePicker
                        date={endDate}
                        setDate={(date) => setFilters({ endDate: date })}
                        label="Fin"
                        className="flex-1 min-w-[140px] w-auto"
                    />

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={() => {
                            resetFilters();
                            setLocalCustomerName("");
                        }} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                            <XCircle className="w-4 h-4 mr-2" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-auto">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <OrderCardSkeleton key={i} />
                        ))}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} onOrderUpdate={getOrders} />
                            ))}
                        </div>

                        <DataTablePagination
                            currentPage={page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            limit={limit}
                            onLimitChange={(val) => { setLimit(val); setPage(1) }}
                            totalItems={pagination.total}
                            currentCount={orders.length}
                            itemName="pedidos"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
