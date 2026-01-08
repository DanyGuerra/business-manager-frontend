"use client";

import { useEffect, useState } from "react";
import { endOfDay, format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, ShoppingBag, TrendingUp, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { useStatsApi } from "@/lib/useStatsApi";
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
    const { getSalesStats } = useStatsApi();
    const { businessId } = useBusinessStore();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
    });
    const [topLimit, setTopLimit] = useState("5");

    useEffect(() => {
        if (businessId) {
            getSalesStats(businessId, {
                start_date: date?.from ? startOfDay(date.from).toISOString() : undefined,
                end_date: date?.to ? endOfDay(date.to).toISOString() : undefined,
                top_limit: parseInt(topLimit),
            })
                .then((response) => {
                    setStats(response.data);
                })
                .finally(() => setLoading(false));
        }
    }, [businessId, getSalesStats, date, topLimit]);

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Escoge una fecha</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <Select value={topLimit} onValueChange={setTopLimit}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Límite" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">Top 5</SelectItem>
                            <SelectItem value="10">Top 10</SelectItem>
                            <SelectItem value="20">Top 20</SelectItem>
                            <SelectItem value="50">Top 50</SelectItem>
                        </SelectContent>
                    </Select>

                    {(date || topLimit) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDate(undefined);
                                setTopLimit("5");
                            }}
                        >
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Productos Más Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Opciones (Extras)</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
