import { useCallback } from "react";
import { ApiResponse } from "@/app/types/auth";
import { StatsData, StatsParams } from "@/app/types/stats";
import { BusinessIdHeader } from "@/consts/consts";
import { useAxios } from "@/lib/axios";

export interface DailySalesData {
    date: string;
    total_sales: number;
}

export interface BestDayStats {
    date: string;
    revenue: number;
}

export interface DailySalesSummary {
    total_revenue: number;
    avg_daily: number;
    best_day: BestDayStats;
}

export interface DailySalesResponse {
    summary: DailySalesSummary;
    data: DailySalesData[];
}

export function useStatsApi() {
    const api = useAxios();

    const getSalesStats = useCallback((businessId: string, params?: StatsParams) =>
        api
            .get<ApiResponse<StatsData>>(`/stats/sales`, {
                headers: { [BusinessIdHeader]: businessId },
                params,
            })
            .then((res) => res.data),
        [api]);

    const getDailySales = useCallback((businessId: string, params?: StatsParams) =>
        api
            .get<ApiResponse<DailySalesResponse>>(`/stats/daily-sales`, {
                headers: { [BusinessIdHeader]: businessId },
                params,
            })
            .then((res) => res.data),
        [api]);

    return { getSalesStats, getDailySales };
}
