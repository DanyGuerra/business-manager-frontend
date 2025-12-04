import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";
import { Order } from "./useOrdersApi";

interface CreateOrderItemGroupDto {
    order_id: string,
    name?: string | null
}

export interface OrderItemGroup {
    id: string
    order: Order
    name: string
    subtotal: string
    created_at: string
}

export function userOrderItemGroupsApi() {
    const api = useAxios();

    return {
        createOrderItemGroup: (data: CreateOrderItemGroupDto, businessId: string) =>
            api
                .post<ApiResponse<OrderItemGroup>>("/order-item-groups", data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),

    };
}
