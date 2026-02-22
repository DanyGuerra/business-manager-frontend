import { useCallback, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

import { useBusinessStore } from "@/store/businessStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useOrdersApi, GetOrdersParams } from "@/lib/useOrdersApi";
import { toastErrorStyle } from "@/lib/toastStyles";

export function useGetOrders() {
    const { businessId } = useBusinessStore();
    const { setOrders, pagination, filters } = useOrdersStore();
    const ordersApi = useOrdersApi();

    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);


    const { page, limit } = pagination;
    const { status, consumptionType, sort, startDate, endDate, customer_name, paid } = filters;

    const getOrders = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);

        try {
            const params: GetOrdersParams = {
                page,
                limit,
                status: status !== "ALL" ? status : undefined,
                consumption_type:
                    consumptionType !== "ALL" ? consumptionType : undefined,
                sort,
                start_date: startDate
                    ? format(startDate, "yyyy-MM-dd'T'HH:mm:ssXXX")
                    : undefined,
                end_date: endDate
                    ? format(endDate, "yyyy-MM-dd'T'HH:mm:ssXXX")
                    : undefined,
                customer_name: customer_name || undefined,
                paid: paid !== "ALL" ? paid : undefined,
            };

            const { data } = await ordersApi.getOrdersByBusinessId(
                businessId,
                params
            );

            setOrders(data);
        } catch (error) {
            if (axios.isCancel(error)) return;
            toast.error("Failed to fetch orders", { style: toastErrorStyle });
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, [businessId, page, limit, status, consumptionType, sort, startDate, endDate, customer_name, paid, ordersApi, setOrders]);

    return { loading, getOrders };
}
