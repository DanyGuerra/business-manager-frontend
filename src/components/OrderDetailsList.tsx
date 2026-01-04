import { Order, useOrdersApi } from "@/lib/useOrdersApi";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OrderItemGroup } from "./OrderItemGroup";
import { useBusinessStore } from "@/store/businessStore";
import { DeleteDialogConfirmation } from "./deleteDialogConfirmation";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useEditModeStore } from "@/store/editModeStore";
import { useGetOrders } from "@/app/hooks/useGetOrders";

interface OrderDetailsListProps {
    order: Order;
}

export function OrderDetailsList({ order }: OrderDetailsListProps) {
    const { deleteOrderItemGroup } = useOrdersApi();
    const { businessId } = useBusinessStore();
    const { isEditMode } = useEditModeStore();
    const { getOrders } = useGetOrders();

    const handleDeleteGroup = async (groupId: string) => {
        try {
            await deleteOrderItemGroup(groupId, businessId);
            toast.success("Grupo eliminado correctamente", { style: toastSuccessStyle });
            getOrders()
        } catch (error) {
            handleApiError(error);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {order.itemGroups.map((group) => (
                <div key={group.id} className="border rounded-md bg-background/50 overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
                                {group.name}
                            </span>
                            <Badge variant="secondary" className="text-[10px] h-5">
                                {group.items.length} items
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditMode && (
                                <DeleteDialogConfirmation
                                    title="Eliminar grupo"
                                    description="¿Estás seguro de que deseas eliminar este grupo y todos sus ítems?"
                                    handleContinue={() => handleDeleteGroup(group.id)}
                                />
                            )}
                            <Badge variant="outline" className="text-xs font-semibold bg-background">
                                {formatCurrency(group.subtotal)}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-3">
                        <OrderItemGroup group={group} />
                    </div>
                </div>
            ))}

            {order.notes && (
                <div className="mt-2 flex gap-3 bg-muted/40 p-4 rounded-md border-2 border-dashed border-muted-foreground/20">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Nota del Cliente</span>
                        <p className="text-sm font-medium text-foreground/90 leading-relaxed">{order.notes}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
