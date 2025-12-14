import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useBusinessStore } from "@/store/businessStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useOrdersApi, GetOrdersParams } from "@/lib/useOrdersApi";
import { toastErrorStyle } from "@/lib/toastStyles";

export function useGetOrders() {
    const { businessId } = useBusinessStore();
    const ordersApi = useOrdersApi();
    const { setOrders, pagination, filters } = useOrdersStore();
    const [loading, setLoading] = useState(true);

    const { status, consumptionType, sort, startDate, endDate } = filters;
    const { page, limit } = pagination;

    const getOrders = useCallback(
        async (newPage = page) => {
            setLoading(true);
            try {
                const params: GetOrdersParams = {
                    page: newPage,
                    limit,
                    status: status !== "ALL" ? status : undefined,
                    consumption_type:
                        consumptionType !== "ALL" ? consumptionType : undefined,
                    sort,
                };

                if (startDate) {
                    params.start_date = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
                }
                if (endDate) {
                    params.end_date = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
                }

                const { data } = await ordersApi.getOrdersByBusinessId(
                    businessId,
                    params
                );

                setOrders(data.data, {
                    page: data.page,
                    limit: data.limit,
                    total: data.total,
                    totalPages: data.totalPages,
                });
            } catch {
                toast.error("Failed to fetch orders", { style: toastErrorStyle });
            } finally {
                setLoading(false);
            }
        },
        [
            page,
            limit,
            status,
            consumptionType,
            sort,
            startDate,
            endDate,
            businessId,
            ordersApi,
            setOrders,
        ]
    );

    useEffect(() => {
        getOrders(page);
    }, [page, getOrders]);

    return { getOrders, loading };
}
