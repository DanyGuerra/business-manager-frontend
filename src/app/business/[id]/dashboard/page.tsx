"use client";

import { useEffect, useState } from "react";
import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, DollarSign, ShoppingBag, TrendingUp, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { DailySalesResponse, useStatsApi } from "@/lib/useStatsApi";
import { DailySalesChart } from "@/components/DailySalesChart";
import { StatsData } from "@/app/types/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessStore } from "@/store/businessStore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";



export default function DashboardPage() {
    const { getSalesStats, getDailySales } = useStatsApi();
    const { businessId } = useBusinessStore();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [dailyStats, setDailyStats] = useState<DailySalesResponse | undefined>();
    const [loading, setLoading] = useState(true);

    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
    });
    const [topLimit, setTopLimit] = useState("5");

    useEffect(() => {
        if (businessId) {
            setLoading(true);
            const params = {
                start_date: date?.from ? startOfDay(date.from).toISOString() : undefined,
                end_date: date?.to ? endOfDay(date.to).toISOString() : undefined,
                top_limit: parseInt(topLimit),
            };

            Promise.all([
                getSalesStats(businessId, params),
                getDailySales(businessId, params),
            ])
                .then(([statsResponse, dailyResponse]) => {
                    setStats(statsResponse.data);
                    setDailyStats(dailyResponse.data);
                })
                .finally(() => setLoading(false));
        }
    }, [businessId, getSalesStats, getDailySales, date, topLimit]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    if (!stats) {
        return <div>No se pudieron cargar las estadísticas.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex flex-col md:flex-row w-full md:w-auto items-stretch md:items-center gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full md:w-[260px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "dd LLL, y", { locale: es })} -{" "}
                                            {format(date.to, "dd LLL, y", { locale: es })}
                                        </>
                                    ) : (
                                        format(date.from, "dd LLL, y", { locale: es })
                                    )
                                ) : (
                                    <span>Seleccionar fecha</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={1}
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>

                    <Select value={topLimit} onValueChange={setTopLimit}>
                        <SelectTrigger className="w-full md:w-[130px]">
                            <SelectValue placeholder="Límite" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">Top 5</SelectItem>
                            <SelectItem value="10">Top 10</SelectItem>
                            <SelectItem value="20">Top 20</SelectItem>
                            <SelectItem value="50">Top 50</SelectItem>
                        </SelectContent>
                    </Select>

                    {(date || topLimit !== "5") && (
                        <Button
                            variant="ghost"
                            className="w-full md:w-10 md:h-10 md:p-0"
                            onClick={() => {
                                setDate(undefined);
                                setTopLimit("5");
                            }}
                        >
                            <span className="md:hidden mr-2">Limpiar filtros</span>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats.total_sales.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ingresos totales registrados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ordenes Totales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_orders}</div>
                        <p className="text-xs text-muted-foreground">
                            Pedidos realizados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${dailyStats?.summary.avg_daily.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Media por día
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mejor Día</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${dailyStats?.summary.best_day.revenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dailyStats?.summary.best_day.date
                                ? format(parseISO(dailyStats.summary.best_day.date), "dd LLL, y", { locale: es })
                                : "N/A"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {dailyStats && (
                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Comportamiento de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <DailySalesChart data={dailyStats.data} />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Productos Más Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.top_products.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No hay productos para las fechas seleccionadas
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {stats.top_products.map((product) => (
                                    <div key={product.id} className="flex items-center">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Producto
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {product.quantity} vendidos
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Top Opciones (Extras)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.top_options.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No hay opciones para las fechas seleccionadas
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {stats.top_options.map((option) => (
                                    <div key={option.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {option.name}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {option.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
