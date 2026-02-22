import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useBusinessStore } from "@/store/businessStore";
import { useOrdersApi, Order, ConsumptionType, OrderStatus } from "@/lib/useOrdersApi";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { useProductApi } from "@/lib/useProductApi";
import { Product } from "@/lib/useBusinessApi";
import ProductCardList from "@/app/business/[id]/ProductCardList";
import ProductListSkeleton from "@/components/ProductListSkeleton";
import { DataTableSearch } from "@/components/DataTableSearch";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Option } from "@/lib/useOptionGroupApi";
import { mapOrderToLocalCart } from "@/utils/orderMapper";
import { CartGroup, CartItem, OrderDetails } from "@/store/cartStore";
import { CartDrawerContent } from "@/components/CartDrawerContent";
import { printOrderTicket } from "@/utils/printTicket";
import { toastErrorStyle } from "@/lib/toastStyles";

interface AddOrderItemsSheetProps {
    order: Order;
    onSuccess?: (order?: Order) => void;
    trigger?: React.ReactNode;
    defaultView?: 'products' | 'cart';
}

export function AddOrderItemsSheet({ order, onSuccess, trigger, defaultView = 'products' }: AddOrderItemsSheetProps) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'products' | 'cart'>(defaultView);
    const { businessId, business } = useBusinessStore();
    const { startLoading, stopLoading, loadings } = useLoadingStore();
    const apiOrders = useOrdersApi();
    const productApi = useProductApi();

    const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
    const [orderDetails, setOrderDetails] = useState<OrderDetails>({
        customer_name: "", notes: "", scheduled_at: "", consumption_type: ConsumptionType.TAKE_AWAY, amount_paid: undefined, table_number: "", status: OrderStatus.PENDING
    });
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);

    useEffect(() => {
        if (open && order) {
            setCartGroups(mapOrderToLocalCart(order));
            setOrderDetails({
                customer_name: order.customer_name || "",
                notes: order.notes || "",
                scheduled_at: order.scheduled_at || "",
                consumption_type: order.consumption_type as ConsumptionType || ConsumptionType.TAKE_AWAY,
                amount_paid: order.amount_paid !== null ? parseFloat(order.amount_paid) : undefined,
                table_number: order.table_number?.toString() || "",
                status: order.status as OrderStatus,
                paid: order.paid
            });

            if (order.itemGroups && order.itemGroups.length > 0) {
                setSelectedGroupId(order.itemGroups[0].id);
            }
        }
    }, [open, order]);

    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalProductItems, setTotalProductItems] = useState(0);

    const getProducts = useCallback(async () => {
        try {
            setLoadingProducts(true);
            const { data } = await productApi.getProductsByBusinessId(businessId, { page, limit, search });
            setProducts(data.data);
            setTotalPages(data.totalPages);
            setTotalProductItems(data.total);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoadingProducts(false);
        }
    }, [businessId, page, limit, search, productApi]);

    useEffect(() => {
        if (open && view === 'products') {
            getProducts();
        }
    }, [open, view, getProducts]);


    const handleLocalAddToCart = (product: Product, options: Option[], quantity: number) => {
        const optionsTotal = options.reduce((acc, opt) => acc + opt.price, 0);
        const unitPrice = product.base_price + optionsTotal;
        const total = unitPrice * quantity;
        const optionsKey = options.map(o => o.id).sort().join('-');
        const cartItemId = `${product.id}-${optionsKey}-${Math.random().toString(36).substr(2, 5)}`; // Unique ID for local items

        const newItem: CartItem = {
            cart_item_id: cartItemId,
            product,
            product_id: product.id,
            selected_options: options,
            selected_options_ids: options.map(o => o.id),
            quantity,
            total_price: total,
            is_ready: false
        };

        setCartGroups(prev => {
            const newGroups = [...prev];
            let targetGroupIndex = -1;

            if (selectedGroupId) {
                targetGroupIndex = newGroups.findIndex(g => g.group_id === selectedGroupId);
            }

            if (targetGroupIndex === -1 && newGroups.length > 0) {
                targetGroupIndex = 0;
            }

            if (targetGroupIndex === -1) {
                const newGroupId = Math.random().toString(36).substr(2, 9);
                const newGroup: CartGroup = {
                    group_id: newGroupId,
                    group_name: "",
                    items: [newItem]
                };
                setSelectedGroupId(newGroupId);
                return [...newGroups, newGroup];
            }

            const targetGroup = { ...newGroups[targetGroupIndex] };
            const existingItemIndex = targetGroup.items.findIndex(i => i.product_id === product.id && i.selected_options.length === options.length && i.selected_options.every(opt => options.some(o => o.id === opt.id)));

            if (existingItemIndex > -1) {
                const existingItem = targetGroup.items[existingItemIndex];
                targetGroup.items[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity,
                    total_price: (existingItem.quantity + quantity) * unitPrice
                };
            } else {
                targetGroup.items = [...targetGroup.items, newItem];
            }

            newGroups[targetGroupIndex] = targetGroup;
            return newGroups;
        });

        toast.success("Agregado a la selección", { style: toastSuccessStyle });
    };

    const handleUpdateQuantity = (groupId: string, itemId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(groupId, itemId);
            return;
        }

        setCartGroups(prev => prev.map(group => {
            if (group.group_id === groupId) {
                const updatedItems = group.items.map(item => {
                    if (item.cart_item_id === itemId) {
                        const unitPrice = item.total_price / item.quantity;
                        return {
                            ...item,
                            quantity,
                            total_price: unitPrice * quantity
                        };
                    }
                    return item;
                });
                return { ...group, items: updatedItems };
            }
            return group;
        }));
    };

    const handleRemoveItem = (groupId: string, itemId: string) => {
        setCartGroups(prev => prev.map(group => {
            if (group.group_id === groupId) {
                return {
                    ...group,
                    items: group.items.filter(item => item.cart_item_id !== itemId)
                };
            }
            return group;
        }).filter(group => group.items.length > 0 || group.items.length === 0));
    };

    const handleRemoveGroup = (groupId: string) => {
        setCartGroups(prev => prev.filter(g => g.group_id !== groupId));
        if (selectedGroupId === groupId) setSelectedGroupId(null);
    };

    const handleAddGroup = () => {
        const newGroupId = Math.random().toString(36).substr(2, 9);
        const newGroup: CartGroup = {
            group_id: newGroupId,
            group_name: "",
            items: []
        };
        setCartGroups(prev => [...prev, newGroup]);
        setSelectedGroupId(newGroupId);
    };

    const handleMoveItem = (fromGroupId: string, toGroupId: string, itemId: string) => {
        setCartGroups(prev => {
            const newGroups = [...prev];
            const sourceGroupIdx = newGroups.findIndex(g => g.group_id === fromGroupId);
            const targetGroupIdx = newGroups.findIndex(g => g.group_id === toGroupId);

            if (sourceGroupIdx === -1 || targetGroupIdx === -1) return prev;

            const sourceGroup = { ...newGroups[sourceGroupIdx] };
            const itemIndex = sourceGroup.items.findIndex(i => i.cart_item_id === itemId);

            if (itemIndex === -1) return prev;

            const [itemToMove] = sourceGroup.items.splice(itemIndex, 1);
            newGroups[sourceGroupIdx] = sourceGroup;

            const targetGroup = { ...newGroups[targetGroupIdx] };
            targetGroup.items = [...targetGroup.items, itemToMove];
            newGroups[targetGroupIdx] = targetGroup;

            return newGroups;
        });
    };

    const handleCreateGroupWithItem = (fromGroupId: string, cartItemId: string) => {
        setCartGroups(prev => {
            const newGroups = [...prev];
            const sourceGroupIdx = newGroups.findIndex(g => g.group_id === fromGroupId);

            if (sourceGroupIdx === -1) return prev;

            const sourceGroup = { ...newGroups[sourceGroupIdx] };
            const itemIndex = sourceGroup.items.findIndex(i => i.cart_item_id === cartItemId);

            if (itemIndex === -1) return prev;

            // Remove item from source
            const [itemToMove] = sourceGroup.items.splice(itemIndex, 1);
            newGroups[sourceGroupIdx] = sourceGroup;

            // Create new group
            const newGroupId = Math.random().toString(36).substr(2, 9);
            const newGroup: CartGroup = {
                group_id: newGroupId,
                group_name: "",
                items: [itemToMove]
            };

            newGroups.push(newGroup);

            setTimeout(() => setSelectedGroupId(newGroupId), 0);

            return newGroups;
        });
    };

    const handleConfirmUpdate = async (shouldPrint?: boolean) => {
        try {
            startLoading(LoadingsKeyEnum.UPDATE_ORDER);
            const filteredCartGroups = cartGroups.filter(group => group.items.length > 0);
            const payload = {
                ...orderDetails,
                scheduled_at: orderDetails.scheduled_at || undefined,
                table_number: Number(orderDetails.table_number) || undefined,
                group_items: filteredCartGroups.map(group => ({
                    group_name: group.group_name,
                    items: group.items.map(item => ({
                        product_id: item.product.id,
                        selected_options_ids: item.selected_options.map(opt => opt.id),
                        quantity: item.quantity,
                        is_ready: item.is_ready
                    }))
                }))
            };

            await apiOrders.updateFullOrder(order.id, payload, businessId);
            const { data: updatedOrder } = await apiOrders.getOrderById(order.id, businessId);

            toast.success("Orden actualizada correctamente", { style: toastSuccessStyle });
            setOpen(false);

            if (shouldPrint && updatedOrder) {
                try {
                    printOrderTicket(updatedOrder, business);
                } catch {
                    toast.error("Orden actualizada pero falló la impresión.", { style: toastErrorStyle });
                }
            }

            if (onSuccess) onSuccess(updatedOrder);
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.UPDATE_ORDER);
        }
    };

    const totalItemsCount = cartGroups.reduce((acc, group) => acc + group.items.reduce((sum, item) => sum + item.quantity, 0), 0);
    const totalAmount = cartGroups.reduce((acc, group) => acc + group.items.reduce((sum, item) => sum + item.total_price, 0), 0);

    const normalizeGroups = useCallback((groups: CartGroup[]) => {
        const normalized = groups.map(g => ({
            name: g.group_name || "",
            items: g.items.map(i => ({
                pid: i.product.id || "",
                opts: i.selected_options_ids.sort().join('-'),
                q: i.quantity
            })).sort((a, b) => a.pid.localeCompare(b.pid))
        })).sort((a, b) => a.name.localeCompare(b.name));
        return JSON.stringify(normalized);
    }, []);

    const hasChanges = useCallback(() => {
        const originalGroupsStr = normalizeGroups(mapOrderToLocalCart(order));
        const currentGroupsStr = normalizeGroups(cartGroups);

        const originalDetailsStr = JSON.stringify({
            customer_name: order.customer_name || "",
            notes: order.notes || "",
            scheduled_at: order.scheduled_at || "",
            consumption_type: order.consumption_type,
            amount_paid: order.amount_paid !== null ? parseFloat(order.amount_paid) : undefined,
            table_number: order.table_number?.toString() || ""
        });

        const currentDetailsStr = JSON.stringify({
            customer_name: orderDetails.customer_name || "",
            notes: orderDetails.notes || "",
            scheduled_at: orderDetails.scheduled_at || "",
            consumption_type: orderDetails.consumption_type,
            amount_paid: orderDetails.amount_paid,
            table_number: orderDetails.table_number || ""
        });

        const groupsChanged = originalGroupsStr !== currentGroupsStr;
        const detailsChanged = originalDetailsStr !== currentDetailsStr;

        return groupsChanged || detailsChanged;
    }, [order, orderDetails, cartGroups, normalizeGroups]);



    return (
        <Sheet open={open} onOpenChange={(val) => {
            if (!val) {
                if (hasChanges()) {
                    setShowExitConfirmation(true);
                    return;
                }
            }
            setOpen(val);
            if (!val) {
                setView(defaultView);
            } else {
                setView(defaultView);
            }
        }}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-dashed" >
                        <PlusIcon className="h-3.5 w-3.5" />
                        Agregar / Editar
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-none sm:w-full md:w-full lg:w-full p-0 border-l shadow-xl flex flex-col h-full z-[100]">
                {view === 'products' ? (
                    <div className="flex flex-col h-full">
                        <SheetHeader className="px-6 py-4 border-b shrink-0">
                            <SheetTitle className="flex items-center gap-2">
                                <PlusIcon className="h-5 w-5 text-primary" />
                                Modificar Orden
                            </SheetTitle>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-6 pb-16">
                            <div className="flex flex-col gap-5">
                                <DataTableSearch
                                    onSearch={(val) => {
                                        setSearch(val);
                                        setPage(1);
                                    }}
                                    placeholder="Buscar productos..."
                                    initialValue={search}
                                />

                                {loadingProducts ? (
                                    <ProductListSkeleton />
                                ) : products.length === 0 && page === 1 && !search ? (
                                    <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
                                        <h3 className="text-lg font-medium text-muted-foreground">No hay productos disponibles</h3>
                                    </div>
                                ) : (
                                    <>
                                        <ProductCardList
                                            products={products}
                                            onRefresh={getProducts}
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                                            forceViewMode={true}
                                            onAddToCart={handleLocalAddToCart}
                                        />
                                        <DataTablePagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            onPageChange={setPage}
                                            limit={limit}
                                            onLimitChange={(val) => {
                                                setLimit(val);
                                                setPage(1);
                                            }}
                                            totalItems={totalProductItems}
                                            currentCount={products.length}
                                            itemName="productos"
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {totalItemsCount > 0 && (
                            <div className="absolute bottom-6 right-6 z-50 animate-in zoom-in duration-300">
                                <Button
                                    className="h-12 px-6 rounded-full shadow-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-3"
                                    onClick={() => setView('cart')}
                                >
                                    <span className="font-semibold text-lg">Ver Orden Actual</span>
                                    <div className="flex items-center justify-center bg-background/20 rounded-full h-8 w-8">
                                        <span className="font-bold text-sm">{totalItemsCount}</span>
                                    </div>
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <CartDrawerContent
                            groups={cartGroups}
                            totalItems={totalItemsCount}
                            totalPrice={totalAmount}
                            orderDetails={orderDetails}
                            selectedGroupId={selectedGroupId}
                            isLoading={loadings[LoadingsKeyEnum.UPDATE_ORDER]}
                            onClose={() => setOpen(false)}
                            onClearCart={() => setCartGroups([])}
                            onUpdate={handleConfirmUpdate}
                            onAddGroup={handleAddGroup}
                            onRemoveGroup={handleRemoveGroup}
                            onSelectGroup={setSelectedGroupId}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            onMoveItem={handleMoveItem}
                            onCreateGroupWithItem={handleCreateGroupWithItem}
                            setOrderDetails={(details) => setOrderDetails(prev => ({ ...prev, ...details }))}
                            businessId={businessId}
                            disableSubmit={!hasChanges()}
                            onAddProductsToGroup={(groupId) => {
                                setSelectedGroupId(groupId);
                                setView('products');
                            }}
                            onContinueShopping={() => setView('products')}
                        />
                    </div>
                )}
            </SheetContent>
            <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
                <AlertDialogContent className="z-[105]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de que deseas salir?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tienes cambios sin guardar. Si sales ahora, se perderán todos los cambios.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setShowExitConfirmation(false);
                            setOpen(false);
                            setView(defaultView);
                        }}>
                            Salir sin guardar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sheet>
    );
}
