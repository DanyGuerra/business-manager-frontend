
import OrderItemRow from "./OrderItemRow";
import { OrderItemGroup as OrderItemGroupType } from "@/lib/useOrderItemGroups";
import { useBusinessStore } from "@/store/businessStore";

interface OrderItemGroupProps {
    group: OrderItemGroupType;
    orderId: string;
    enableReadyToggle?: boolean;
}

export function OrderItemGroup({ group, orderId, enableReadyToggle = true }: OrderItemGroupProps) {
    const { businessId } = useBusinessStore();

    return (
        <div className="">
            {group.items.map((item, index) => (
                <OrderItemRow
                    key={item.id + index}
                    item={item}
                    businessId={businessId}
                    orderId={orderId}
                    enableReadyToggle={enableReadyToggle}
                />
            ))}
        </div>
    );
}
