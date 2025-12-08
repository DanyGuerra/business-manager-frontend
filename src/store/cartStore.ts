import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/useBusinessApi';
import { Option } from '@/lib/useOptionGroupApi';
import { ConsumptionType } from '@/lib/useOrdersApi';


type BusinessId = string;

export type CartItem = {
    cart_item_id: string; // Unique ID for the cart item (product_id + options hash)
    product: Product;
    product_id: string;
    selected_options: Option[];
    selected_options_ids: string[];
    quantity: number;
    total_price: number;
};

export type OrderDetails = {
    customerName: string;
    comments: string;
    consumptionType: ConsumptionType;
};

export type CartGroup = {
    group_id: string;
    group_name: string;
    items: CartItem[];
};

type CartState = {
    carts: Record<BusinessId, CartGroup[]>; // Store groups
    orderDetails: Record<BusinessId, OrderDetails>; // Store global details

    // Actions
    addToCart: (businessId: string, product: Product, selectedOptions: Option[], quantity: number, groupId?: string) => void;
    removeFromCart: (businessId: string, groupId: string, cartItemId: string) => void;
    updateQuantity: (businessId: string, groupId: string, cartItemId: string, quantity: number) => void;
    clearCart: (businessId: string) => void;

    // Group Management
    addGroup: (businessId: string) => void;
    removeGroup: (businessId: string, groupId: string) => void;
    updateGroupName: (businessId: string, groupId: string, name: string) => void;

    // Details Management
    setOrderDetails: (businessId: string, details: Partial<OrderDetails>) => void;

    // Getters
    getTotalPrice: (businessId: string) => number;
    getTotalItems: (businessId: string) => number;
    getGroups: (businessId: string) => CartGroup[];
    getOrderDetails: (businessId: string) => OrderDetails;
};

const DEFAULT_ORDER_DETAILS: OrderDetails = {
    customerName: "",
    comments: "",
    consumptionType: ConsumptionType.TAKE_AWAY
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            carts: {},
            orderDetails: {},

            getGroups: (businessId) => {
                return get().carts[businessId] || [];
            },

            getOrderDetails: (businessId) => {
                return get().orderDetails[businessId] || DEFAULT_ORDER_DETAILS;
            },

            setOrderDetails: (businessId, details) => {
                set((state) => ({
                    orderDetails: {
                        ...state.orderDetails,
                        [businessId]: {
                            ...(state.orderDetails[businessId] || DEFAULT_ORDER_DETAILS),
                            ...details
                        }
                    }
                }));
            },

            addGroup: (businessId) => {
                set((state) => {
                    const currentGroups = state.carts[businessId] || [];
                    const newGroup: CartGroup = {
                        group_id: crypto.randomUUID(),
                        group_name: `Bolsa ${currentGroups.length + 1}`,
                        items: []
                    };
                    return {
                        carts: {
                            ...state.carts,
                            [businessId]: [...currentGroups, newGroup]
                        }
                    };
                });
            },

            removeGroup: (businessId, groupId) => {
                set((state) => ({
                    carts: {
                        ...state.carts,
                        [businessId]: (state.carts[businessId] || []).filter(g => g.group_id !== groupId)
                    }
                }));
            },

            updateGroupName: (businessId, groupId, name) => {
                set((state) => {
                    const currentGroups = state.carts[businessId] || [];
                    const newGroups = currentGroups.map(group => {
                        if (group.group_id === groupId) {
                            return { ...group, group_name: name };
                        }
                        return group;
                    });
                    return { carts: { ...state.carts, [businessId]: newGroups } };
                });
            },

            addToCart: (businessId, product, selectedOptions, quantity, targetGroupId) => {
                const optionsPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
                const unitPrice = product.base_price + optionsPrice;
                const optionsKey = selectedOptions.map(o => o.id).sort().join('-');
                const cartItemId = `${product.id}-${optionsKey}`;

                set((state) => {
                    let currentGroups = state.carts[businessId] || [];

                    if (currentGroups.length === 0) {
                        currentGroups = [{
                            group_id: crypto.randomUUID(),
                            group_name: "Bolsa 1",
                            items: []
                        }];
                    }

                    let groupIndex = 0;
                    if (targetGroupId) {
                        groupIndex = currentGroups.findIndex(g => g.group_id === targetGroupId);
                        if (groupIndex === -1) groupIndex = 0;
                    } else {
                        groupIndex = currentGroups.length - 1;
                    }

                    const targetGroup = currentGroups[groupIndex];
                    const existingItemIndex = targetGroup.items.findIndex(item => item.cart_item_id === cartItemId);

                    let newItems = [...targetGroup.items];

                    if (existingItemIndex > -1) {
                        newItems[existingItemIndex].quantity += quantity;
                        newItems[existingItemIndex].total_price = newItems[existingItemIndex].quantity * unitPrice;
                    } else {
                        const newItem: CartItem = {
                            cart_item_id: cartItemId,
                            product,
                            product_id: product.id,
                            selected_options: selectedOptions,
                            selected_options_ids: selectedOptions.map(o => o.id),
                            quantity,
                            total_price: quantity * unitPrice,
                        };
                        newItems.push(newItem);
                    }

                    const newGroups = [...currentGroups];
                    newGroups[groupIndex] = {
                        ...targetGroup,
                        items: newItems
                    };

                    return {
                        carts: {
                            ...state.carts,
                            [businessId]: newGroups
                        }
                    };
                });
            },

            removeFromCart: (businessId, groupId, cartItemId) => {
                set((state) => {
                    const currentGroups = state.carts[businessId] || [];
                    const newGroups = currentGroups.map(group => {
                        if (group.group_id === groupId) {
                            return {
                                ...group,
                                items: group.items.filter(item => item.cart_item_id !== cartItemId)
                            };
                        }
                        return group;
                    });
                    return { carts: { ...state.carts, [businessId]: newGroups } };
                });
            },

            updateQuantity: (businessId, groupId, cartItemId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(businessId, groupId, cartItemId);
                    return;
                }

                set((state) => {
                    const currentGroups = state.carts[businessId] || [];
                    const newGroups = currentGroups.map(group => {
                        if (group.group_id === groupId) {
                            const newItems = group.items.map(item => {
                                if (item.cart_item_id === cartItemId) {
                                    const unitPrice = item.total_price / item.quantity;
                                    return {
                                        ...item,
                                        quantity,
                                        total_price: quantity * unitPrice,
                                    };
                                }
                                return item;
                            });
                            return {
                                ...group,
                                items: newItems
                            };
                        }
                        return group;
                    });

                    return { carts: { ...state.carts, [businessId]: newGroups } };
                });
            },

            clearCart: (businessId) => set((state) => ({
                carts: {
                    ...state.carts,
                    [businessId]: []
                },
                orderDetails: {
                    ...state.orderDetails,
                    [businessId]: DEFAULT_ORDER_DETAILS
                }
            })),

            getTotalPrice: (businessId) => {
                const groups = get().carts[businessId] || [];
                return groups.reduce((totalAcc, group) => {
                    const groupTotal = group.items.reduce((acc, item) => acc + item.total_price, 0);
                    return totalAcc + groupTotal;
                }, 0);
            },

            getTotalItems: (businessId) => {
                const groups = get().carts[businessId] || [];
                return groups.reduce((totalAcc, group) => {
                    const groupItemsCount = group.items.reduce((acc, item) => acc + item.quantity, 0);
                    return totalAcc + groupItemsCount;
                }, 0);
            },
        }),
        {
            name: 'shopping-cart-storage-v3', // Changed storage key to ensure fresh start
        }
    )
);
