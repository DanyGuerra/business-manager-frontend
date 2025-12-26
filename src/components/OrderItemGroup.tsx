
import OrderItemRow from "./OrderItemRow";
import { OrderItemGroup as OrderItemGroupType } from "@/lib/useOrderItemGroups";
import { useBusinessStore } from "@/store/businessStore";

interface OrderItemGroupProps {
    group: OrderItemGroupType;
}

export function OrderItemGroup({ group }: OrderItemGroupProps) {
    const { businessId } = useBusinessStore();

    return (
        <div className="">
            {group.items.map((item, index) => (
                <OrderItemRow key={item.id + index} item={item} businessId={businessId} />
            ))}
        </div>
    );
}
