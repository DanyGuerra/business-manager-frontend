import { useCallback } from "react";
import { ApiResponse } from "@/app/types/auth";
import { StatsData, StatsParams } from "@/app/types/stats";
import { BusinessIdHeader } from "@/consts/consts";
import { useAxios } from "@/lib/axios";

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

    return { getSalesStats };
}
