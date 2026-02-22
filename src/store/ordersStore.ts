import { create } from 'zustand';
import { Order, OrderStatus, ConsumptionType } from '@/lib/useOrdersApi';

const ORDER_LIMIT = 30;

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
    customer_name: string;
    paid: boolean | "ALL";
};

type OrderResponse = {
    data: Order[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type OrdersState = {
    orders: Order[];
    pagination: PaginationState;
    filters: FilterState;
    setOrders: (response: OrderResponse) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, order: Partial<Order>) => void;
    removeOrder: (orderId: string) => void;
    setFilters: (filters: Partial<FilterState>) => void;
    setPage: (page: number) => void;
    resetFilters: () => void;
    setLimit: (limit: number) => void;
    setOrdersByStatus: (orders: Order[], status: OrderStatus) => void;
    activeOrder: Order | null;
    setActiveOrder: (order: Order | null) => void;
};

const initialFilters: FilterState = {
    status: "ALL",
    consumptionType: "ALL",
    sort: 'ASC',
    startDate: undefined,
    endDate: undefined,
    customer_name: "",
    paid: "ALL",
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
    setOrders: (response) => set(() => ({
        orders: response.data,
        pagination: {
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
        }
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
    setPage: (page) => set((state) => ({
        pagination: { ...state.pagination, page }
    })),
    resetFilters: () => set(() => ({
        filters: initialFilters,
        pagination: { ...initialFilters, page: 1, limit: ORDER_LIMIT } as unknown as PaginationState
    })),
    setLimit: (limit) => set((state) => ({
        pagination: { ...state.pagination, limit, page: 1 }
    })),
    setOrdersByStatus: (orders, status) => set((state) => {
        const otherOrders = state.orders.filter(o => o.status !== status);
        const mergedOrders = [...otherOrders, ...orders];
        const uniqueOrders = Array.from(new Map(mergedOrders.map(o => [o.id, o])).values());

        return {
            orders: uniqueOrders
        };
    }),
    activeOrder: null,
    setActiveOrder: (order) => set({ activeOrder: order }),
}));
