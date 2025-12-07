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

type CartState = {
    carts: Record<BusinessId, CartItem[]>;
    addToCart: (businessId: string, product: Product, selectedOptions: Option[], quantity: number) => void;
    removeFromCart: (businessId: string, cartItemId: string) => void;
    updateQuantity: (businessId: string, cartItemId: string, quantity: number) => void;
    clearCart: (businessId: string) => void;
    getTotalPrice: (businessId: string) => number;
    getTotalItems: (businessId: string) => number;
    getItems: (businessId: string) => CartItem[];
    getOrderDetails: (businessId: string) => OrderDetails;
    orderDetails: Record<BusinessId, OrderDetails>;
    setOrderDetails: (businessId: string, details: Partial<OrderDetails>) => void;
};

export type OrderDetails = {
    customerName: string;
    comments: string;
    consumptionType: ConsumptionType;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            carts: {},
            orderDetails: {},

            setOrderDetails: (businessId, details) => {
                set((state) => ({
                    orderDetails: {
                        ...state.orderDetails,
                        [businessId]: {
                            ...(state.orderDetails[businessId] || {
                                customerName: "",
                                comments: "",
                                consumptionType: ConsumptionType.TAKE_AWAY
                            }),
                            ...details
                        }
                    }
                }));
            },

            addToCart: (businessId, product, selectedOptions, quantity) => {
                const optionsPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
                const unitPrice = product.base_price + optionsPrice;

                const optionsKey = selectedOptions
                    .map(o => o.id)
                    .sort()
                    .join('-');
                const cartItemId = `${product.id}-${optionsKey}`;

                set((state) => {
                    const currentCart = state.carts[businessId] || [];
                    const existingItemIndex = currentCart.findIndex(item => item.cart_item_id === cartItemId);

                    let newCart;
                    if (existingItemIndex > -1) {
                        newCart = [...currentCart];
                        newCart[existingItemIndex].quantity += quantity;
                        newCart[existingItemIndex].total_price = newCart[existingItemIndex].quantity * unitPrice;
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
                        newCart = [...currentCart, newItem];
                    }

                    return {
                        carts: {
                            ...state.carts,
                            [businessId]: newCart
                        }
                    };
                });
            },

            removeFromCart: (businessId, cartItemId) => {
                set((state) => ({
                    carts: {
                        ...state.carts,
                        [businessId]: (state.carts[businessId] || []).filter((item) => item.cart_item_id !== cartItemId)
                    }
                }));
            },

            updateQuantity: (businessId, cartItemId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(businessId, cartItemId);
                    return;
                }

                set((state) => {
                    const currentCart = state.carts[businessId] || [];
                    const newCart = currentCart.map((item) => {
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
                        carts: {
                            ...state.carts,
                            [businessId]: newCart
                        }
                    };
                });
            },

            clearCart: (businessId) => set((state) => ({
                carts: {
                    ...state.carts,
                    [businessId]: []
                },
                orderDetails: {
                    ...state.orderDetails,
                    [businessId]: {
                        customerName: "",
                        comments: "",
                        consumptionType: ConsumptionType.TAKE_AWAY
                    }
                }
            })),

            getTotalPrice: (businessId) => {
                const cart = get().carts[businessId] || [];
                return cart.reduce((acc, item) => acc + item.total_price, 0);
            },

            getTotalItems: (businessId) => {
                const cart = get().carts[businessId] || [];
                return cart.reduce((acc, item) => acc + item.quantity, 0);
            },

            getItems: (businessId) => {
                return get().carts[businessId] || [];
            },

            getOrderDetails: (businessId) => {
                return get().orderDetails[businessId] || {
                    customerName: "",
                    comments: "",
                    consumptionType: ConsumptionType.TAKE_AWAY
                };
            }
        }),
        {
            name: 'shopping-cart-storage',
        }
    )
);
