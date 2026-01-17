import { Order } from "@/lib/useOrdersApi";
import { OrderItem } from "@/lib/useOrderItemGroups";
import { Product } from "@/lib/useBusinessApi";
import { Option } from "@/lib/useOptionGroupApi";
import { OrderItemOptionDetail } from "@/lib/useOrderItemGroups";
import { CartGroup, CartItem } from "@/store/cartStore";

export type LocalCartItem = CartItem;
export type LocalCartGroup = CartGroup;

export function mapOrderToLocalCart(order: Order): CartGroup[] {
    if (!order.itemGroups) return [];

    return order.itemGroups.map((group) => ({
        group_id: group.id,
        group_name: group.name,
        items: group.items
            .map((item) => mapOrderItemToLocalItem(item))
            .filter((item): item is CartItem => item !== null),
    }));
}

function mapOrderItemToLocalItem(item: OrderItem): CartItem {
    const options = flattenOptions(item.grouped_options);
    const product = item.product as Product;

    return {
        cart_item_id: item.id,
        product: product,
        product_id: product.id,
        selected_options: options,
        selected_options_ids: options.map(o => o.id),
        quantity: item.quantity,
        total_price: parseFloat(item.item_total),
        is_ready: item.is_ready,
    };
}

function flattenOptions(grouped: Record<string, OrderItemOptionDetail[]>): Option[] {
    if (!grouped) return [];

    const options: Option[] = [];
    Object.values(grouped).forEach((details) => {
        details.forEach((detail) => {
            options.push({
                id: detail.product_option_id,
                name: detail.name,
                price: detail.price,
            } as Option);
        });
    });
    return options;
}
