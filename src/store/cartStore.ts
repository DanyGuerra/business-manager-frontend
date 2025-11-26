import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/useBusinessApi';
import { Option } from '@/lib/useOptionGroupApi';



export type CartItem = {
    id: string; // Unique ID for the cart item (product_id + options hash)
    product: Product;
    selected_options: Option[];
    quantity: number;
    total_price: number;
};

type CartState = {
    items: CartItem[];
    addToCart: (product: Product, selectedOptions: Option[], quantity: number) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addToCart: (product, selectedOptions, quantity) => {
                const optionsPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
                const unitPrice = product.base_price + optionsPrice;

                // Create a unique ID based on product and sorted options to group identical items
                const optionsKey = selectedOptions
                    .map(o => o.id)
                    .sort()
                    .join('-');
                const cartItemId = `${product.id}-${optionsKey}`;

                set((state) => {
                    const existingItemIndex = state.items.findIndex(item => item.id === cartItemId);

                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += quantity;
                        newItems[existingItemIndex].total_price = newItems[existingItemIndex].quantity * unitPrice;
                        return { items: newItems };
                    } else {
                        const newItem: CartItem = {
                            id: cartItemId,
                            product,
                            selected_options: selectedOptions,
                            quantity,
                            total_price: quantity * unitPrice,
                        };
                        return { items: [...state.items, newItem] };
                    }
                });
            },

            removeFromCart: (cartItemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== cartItemId),
                }));
            },

            updateQuantity: (cartItemId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(cartItemId);
                    return;
                }

                set((state) => {
                    const newItems = state.items.map((item) => {
                        if (item.id === cartItemId) {
                            const unitPrice = item.total_price / item.quantity;
                            return {
                                ...item,
                                quantity,
                                total_price: quantity * unitPrice,
                            };
                        }
                        return item;
                    });
                    return { items: newItems };
                });
            },

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                return get().items.reduce((acc, item) => acc + item.total_price, 0);
            },

            getTotalItems: () => {
                return get().items.reduce((acc, item) => acc + item.quantity, 0);
            },
        }),
        {
            name: 'shopping-cart-storage',
        }
    )
);
