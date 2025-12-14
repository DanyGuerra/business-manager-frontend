import { create } from 'zustand';
import { Order, OrderStatus, ConsumptionType } from '@/lib/useOrdersApi';

const ORDER_LIMIT = 10;

type PaginationState = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type FilterState = {
    status: OrderStatus | "ALL";
    consumptionType: ConsumptionType | "ALL";
    sort: 'ASC' | 'DESC';
    startDate: Date | undefined;
    endDate: Date | undefined;
};

type OrdersState = {
    orders: Order[];
    pagination: PaginationState;
    filters: FilterState;
    setOrders: (orders: Order[], pagination?: PaginationState) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, order: Partial<Order>) => void;
    removeOrder: (orderId: string) => void;
    setFilters: (filters: Partial<FilterState>) => void;
    resetFilters: () => void;
    setLimit: (limit: number) => void;
};

const initialFilters: FilterState = {
    status: "ALL",
    consumptionType: "ALL",
    sort: 'DESC',
    startDate: undefined,
    endDate: undefined,
};

export const useOrdersStore = create<OrdersState>((set) => ({
    orders: [],
    pagination: {
        page: 1,
        limit: ORDER_LIMIT,
        total: 0,
        totalPages: 0,
    },
    filters: initialFilters,
    setOrders: (orders, pagination) => set((state) => ({
        orders,
        pagination: pagination ? pagination : state.pagination,
    })),
    addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    updateOrder: (orderId, updatedOrder) => set((state) => ({
        orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, ...updatedOrder } : order
        ),
    })),
    removeOrder: (orderId) => set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
    })),
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
        pagination: { ...state.pagination, page: 1 }
    })),
    resetFilters: () => set(() => ({
        filters: initialFilters,
        pagination: { ...initialFilters, page: 1, limit: ORDER_LIMIT } as unknown as PaginationState
    })),
    setLimit: (limit) => set((state) => ({
        pagination: { ...state.pagination, limit, page: 1 }
    })),
}));
