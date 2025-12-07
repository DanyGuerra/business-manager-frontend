import { ApiResponse, User } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";
import { OrderItemGroup } from "./useOrderItemGroups";

export enum ConsumptionType {
    DINE_IN = 'dine_in',
    TAKE_AWAY = 'take_away',
    DELIVERY = 'delivery',
}

export enum OrderStatus {
    PENDING = 'pending',
    PREPARING = 'preparing',
    READY = 'ready',
    COMPLETED = 'completed',
}


export type CreateOrderDto = {
    customer_name?: string | null,
    amount_paid?: number,
    status?: OrderStatus,
    paid?: boolean,
    delivered_at?: Date,
    scheduled_at?: Date,
    consumption_type?: ConsumptionType,
    notes?: string | null,
}

export interface Order {
    id: string
    customer_name: string
    total: string
    amount_paid: string | null
    change: string | null
    status: string
    paid: boolean
    delivered_at: string | null
    scheduled_at: string | null
    consumption_type: string
    notes: string
    created_at: string
    updated_at: string
    itemGroups: OrderItemGroup[]
    orderLabels: any[]
    deleted_at: string | null
}



export type CreateFullOrderItemDto = {
    product_id: string;
    selected_options_ids: string[];
    quantity: number;
}

export type CreateFullOrderDto = CreateOrderDto & {
    items: CreateFullOrderItemDto[];
}

export function useOrdersApi() {
    const api = useAxios();

    return {
        createOrder: (data: CreateOrderDto, businessId: string) =>
            api
                .post<ApiResponse<Order>>("/orders", data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        createFullOrder: (data: CreateFullOrderDto, businessId: string) =>
            api
                .post<ApiResponse<Order>>("/orders/full", data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        getOrdersByBusinessId: (businessId: string) =>
            api
                .get<ApiResponse<Order[]>>("/orders/business", {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
    };
}
