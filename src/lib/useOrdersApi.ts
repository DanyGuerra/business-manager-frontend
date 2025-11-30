import { ApiResponse, User } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";
import { Business } from "./useBusinessApi";

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
    business: Business
    user: User
    total: string
    amount_paid: any
    change: any
    status: string
    paid: boolean
    delivered_at: any
    scheduled_at: any
    consumption_type: string
    notes: string
    created_at: string
    updated_at: string
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

    };
}
