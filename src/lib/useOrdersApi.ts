import { ApiResponse, User } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";
import { OrderItemGroup } from "./useOrderItemGroups";
import { useMemo } from "react";

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
    CANCELLED = 'cancelled',
    SCHEDULED = 'scheduled',
}

export type CreateOrderDto = {
    customer_name?: string | null,
    amount_paid?: number | null,
    status?: OrderStatus,
    paid?: boolean,
    delivered_at?: Date | string,
    scheduled_at?: Date | string,
    consumption_type?: ConsumptionType,
    table_number?: number | null,
    notes?: string | null,
}

export interface OrderLabel {
    id: string;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
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
    orderLabels: OrderLabel[]
    deleted_at: string | null
    user: Partial<User>
    table_number: number | null
    order_number: number
}



export type CreateFullOrderItemDto = {
    product_id: string;
    selected_options_ids: string[];
    quantity: number;
}

export type GroupItemsDto = {
    group_name: string | null;
    items: CreateFullOrderItemDto[];
}

export type CreateFullOrderDto = CreateOrderDto & {
    group_items: GroupItemsDto[];
}

export type UpdateFullOrderDto = CreateOrderDto & {
    group_items: GroupItemsDto[];
}

type OrdersPagination = {
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type GetOrdersParams = {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    consumption_type?: ConsumptionType;
    sort?: 'ASC' | 'DESC';
    start_date?: string;
    end_date?: string;
}

export function useOrdersApi() {
    const api = useAxios();

    return useMemo(() => ({
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
        getOrdersByBusinessId: (businessId: string, params?: GetOrdersParams) =>
            api
                .get<ApiResponse<OrdersPagination>>("/orders/business", {
                    headers: { [BusinessIdHeader]: businessId },
                    params,
                })
                .then((res) => res.data),
        deleteOrderItemGroup: (orderId: string, groupId: string, businessId: string) =>
            api
                .delete<ApiResponse<Order>>(`/orders/${orderId}/group/${groupId}`, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        deleteOrder: (orderId: string, businessId: string) =>
            api
                .delete<ApiResponse<void>>(`/orders/${orderId}`, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        updateOrder: (orderId: string, data: Partial<CreateOrderDto>, businessId: string) =>
            api
                .patch<ApiResponse<Order>>(`/orders/${orderId}`, data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        updateFullOrder: (orderId: string, data: Partial<UpdateFullOrderDto>, businessId: string) =>
            api
                .patch<ApiResponse<Order>>(`/orders/full/${orderId}`, data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        deleteOrderItem: (orderId: string, itemId: string, businessId: string) =>
            api
                .delete<ApiResponse<Order>>(`/orders/${orderId}/item/${itemId}`, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        getOrderById: (orderId: string, businessId: string) =>
            api
                .get<ApiResponse<Order>>(`/orders/${orderId}`, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
    }), [api]);
}
