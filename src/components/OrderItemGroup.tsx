import { OrderItemRow } from "./OrderItemRow";
import { OrderItemGroup as OrderItemGroupType } from "@/lib/useOrderItemGroups";

interface OrderItemGroupProps {
    group: OrderItemGroupType;
}

export function OrderItemGroup({ group }: OrderItemGroupProps) {
    return (
        <div className="">
            {group.items.map((item, index) => (
                <OrderItemRow key={item.id + index} item={item} />
            ))}
        </div>
    );
}
