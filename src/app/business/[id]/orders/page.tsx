'use client';

import { useEffect } from "react";

import { OrderStatus, ConsumptionType } from "@/lib/useOrdersApi";
import { useGetOrders } from "@/app/hooks/useGetOrders";
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
    PaginationEllipsis,
} from "@/components/ui/pagination";
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

    useEffect(() => {
        getOrders();
    }, [getOrders]);

    const { status, consumptionType, sort, startDate, endDate } = filters;
    const { page, limit } = pagination;

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };

    const hasActiveFilters = status !== "ALL" || consumptionType !== "ALL" || startDate !== undefined || endDate !== undefined;

    const renderPaginationItems = () => {
        const items = [];
        const totalPages = pagination.totalPages;
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        href="#"
                        isActive={page === 1}
                        onClick={(e) => { e.preventDefault(); handlePageChange(1); }}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (page > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (page < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        href="#"
                        isActive={page === totalPages}
                        onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="flex flex-col h-full bg-muted/10">
            <div className="flex flex-col border-b bg-background px-4 py-4 md:px-6 md:py-5 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Pedidos</h2>
                        <p className="text-sm text-muted-foreground">Gestiona y visualiza los pedidos de tu negocio.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => getOrders()} disabled={loading} className="w-full sm:w-auto">
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>


                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2 mr-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filtros:</span>
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
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                            <XCircle className="w-4 h-4 mr-2" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-auto">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>

                        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
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
                                <span className="text-sm text-muted-foreground ml-2 sm:hidden">Total: {pagination.total}</span>
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

                                    <div className="hidden sm:flex flex-row items-center gap-1">
                                        {renderPaginationItems()}
                                    </div>
                                    <div className="sm:hidden flex items-center px-4 font-medium text-sm">
                                        Página {page} de {pagination.totalPages}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePageChange(page + 1); }}
                                            className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>

                            <span className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">Resultados: {pagination.total}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
