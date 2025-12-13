import { create } from 'zustand';
import { Order } from '@/lib/useOrdersApi';

type OrdersState = {
    orders: Order[];
    setOrders: (orders: Order[]) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, order: Partial<Order>) => void;
    removeOrder: (orderId: string) => void;
};

export const useOrdersStore = create<OrdersState>((set) => ({
    orders: [],
    setOrders: (orders) => set({ orders }),
    addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    updateOrder: (orderId, updatedOrder) => set((state) => ({
        orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, ...updatedOrder } : order
        ),
    })),
    removeOrder: (orderId) => set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
    })),
}));
