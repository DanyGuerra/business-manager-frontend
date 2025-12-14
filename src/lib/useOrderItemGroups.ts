import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";
import { Option } from "./useOptionGroupApi";
import { Product } from "./useBusinessApi";

export interface OrderItemOption {
    id: string;
    price: string;
    productOption: Option[]
}

export interface OrderItemOptionDetail {
    name: string;
    price: number;
    product_option_id: string;
    order_item_option_id: string;
}

type OptionGroupName = string;

export interface OrderItem {
    id: string;
    quantity: number;
    is_ready: boolean;
    product: Partial<Product>
    item_total: string;
    created_at: string;
    updated_at: string;
    grouped_options: Record<OptionGroupName, OrderItemOptionDetail[]>;
}

interface CreateOrderItemGroupDto {
    order_id: string,
    name?: string | null
}

export interface OrderItemGroup {
    id: string
    name: string
    subtotal: string
    items: OrderItem[]
    created_at: string
    deleted_at: string
}

interface UpdateOrderItemDto {
    is_ready?: boolean
    quantity?: number
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
        updateOrderItem: (itemId: string, data: UpdateOrderItemDto, businessId: string) =>
            api
                .put<ApiResponse<OrderItem>>(`/order-item/${itemId}`, data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
    };
}
