import { Order, useOrdersApi } from "@/lib/useOrdersApi";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OrderItemGroup } from "./OrderItemGroup";
import { useBusinessStore } from "@/store/businessStore";
import { DeleteDialogConfirmation } from "./deleteDialogConfirmation";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { handleApiError } from "@/utils/handleApiError";
import { useEditModeStore } from "@/store/editModeStore";
import { useGetOrders } from "@/app/hooks/useGetOrders";

interface OrderDetailsProps {
    order: Order;
}

export function OrderGroups({ order }: OrderDetailsProps) {
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
        <div className="flex flex-col gap-4">
            {order.itemGroups.map((group) => (
                <div key={group.id}>
                    <Collapsible className="w-full border rounded-md bg-muted p-2" defaultOpen>
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {group.name}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {group.items.length} items
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-semibold">
                                        {formatCurrency(group.subtotal)}
                                    </Badge>

                                    {isEditMode && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DeleteDialogConfirmation
                                                title="Eliminar grupo"
                                                description="¿Estás seguro de que deseas eliminar este grupo y todos sus ítems?"
                                                handleContinue={() => handleDeleteGroup(group.id)}
                                            />
                                        </div>
                                    )}

                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                        <span className="sr-only">Toggle {group.name}</span>
                                    </Button>
                                </div>
                            </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <div className="pt-3">
                                <OrderItemGroup group={group} />
                                <div className="flex justify-end items-center mt-2 pt-2 border-t border-dashed border-muted/60">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                                            Subtotal {group.name}
                                        </span>
                                        <Badge variant="default" className="text-xs font-semibold">
                                            {formatCurrency(group.subtotal)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            ))}

            {order.notes && (
                <div className="mt-2 flex gap-2 bg-amber-50/80 dark:bg-amber-950/20 p-2 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                    <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Nota</span>
                        <p className="text-xs text-foreground/80 leading-snug">{order.notes}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
