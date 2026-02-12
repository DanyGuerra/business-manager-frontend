"use client";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/store/cartStore";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import { OrderStatus, useOrdersApi } from "@/lib/useOrdersApi";
import { useBusinessStore } from "@/store/businessStore";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { CartDrawerContent } from "@/components/CartDrawerContent";

export default function CartDrawer() {
    const { updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart, getGroups, getOrderDetails, setOrderDetails, addGroup, getSelectedGroupId, selectGroup, removeGroup, moveItem } = useCartStore();
    const { businessId } = useBusinessStore();
    const { startLoading, stopLoading, loadings } = useLoadingStore();
    const ordersApi = useOrdersApi();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const groups = getGroups(businessId);
    const totalItems = getTotalItems(businessId);
    const totalPrice = getTotalPrice(businessId);
    const orderDetails = getOrderDetails(businessId);
    const selectedGroupId = getSelectedGroupId(businessId);

    async function handleConfirmOrder() {
        try {
            startLoading(LoadingsKeyEnum.CREATE_ORDER);

            const payload = {
                ...orderDetails,
                scheduled_at: orderDetails.scheduled_at || undefined,
                table_number: Number(orderDetails.table_number) || undefined,
                status: orderDetails.scheduled_at ? OrderStatus.SCHEDULED : OrderStatus.PENDING,
                group_items: groups
                    .filter((group) => group.items.length > 0)
                    .map((group) => ({
                        group_name: group.group_name,
                        items: group.items.map((item) => ({
                            product_id: item.product_id,
                            selected_options_ids: item.selected_options_ids,
                            quantity: item.quantity,
                        })),
                    }))
            };

            await ordersApi.createFullOrder(payload, businessId);
            toast.success("Orden creada exitosamente", { style: toastSuccessStyle });
            clearCart(businessId);
            setIsOpen(false);
        } catch (error) {
            handleApiError(error)
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_ORDER);
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="fixed bottom-4 right-4 z-50">
                <Button className="h-16 w-16 shadow-lg z-50 animate-in zoom-in duration-300 hover:scale-105 transition-transform rounded-full">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <ShoppingCartIcon />
                        {totalItems > 0 && (
                            <span className="absolute -top-3 -left-3 bg-red-500 text-white text-[12px] font-bold h-6 w-6 flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-[500px] sm:w-[70%] md:w-[60%] lg:w-[50%] p-0 border-l shadow-xl flex flex-col h-full bg-background z-[100]">
                <CartDrawerContent
                    groups={groups}
                    totalItems={totalItems}
                    totalPrice={totalPrice}
                    orderDetails={orderDetails}
                    selectedGroupId={selectedGroupId}
                    isLoading={loadings[LoadingsKeyEnum.CREATE_ORDER]}
                    onClose={() => setIsOpen(false)}
                    onClearCart={() => clearCart(businessId)}
                    onConfirm={handleConfirmOrder}
                    onAddGroup={() => addGroup(businessId)}
                    onRemoveGroup={(groupId) => removeGroup(businessId, groupId)}
                    onSelectGroup={(groupId) => selectGroup(businessId, groupId)}
                    onUpdateQuantity={(groupId, itemId, quantity) => updateQuantity(businessId, groupId, itemId, quantity)}
                    onRemoveItem={(groupId, itemId) => removeFromCart(businessId, groupId, itemId)}
                    onMoveItem={(from, to, item) => moveItem(businessId, from, to, item)}
                    setOrderDetails={(details) => setOrderDetails(businessId, details)}
                    businessId={businessId}
                    onContinueShopping={() => {
                        setIsOpen(false);
                        router.push(`/business/${businessId}/products`);
                    }}
                />
            </SheetContent>
        </Sheet>
    );
}
