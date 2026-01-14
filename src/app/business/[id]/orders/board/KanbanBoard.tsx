'use client';

import { useEffect, useState, useCallback } from "react";
import { useOrdersStore } from "@/store/ordersStore";
import { OrderStatus, useOrdersApi, GetOrdersParams } from "@/lib/useOrdersApi";
import { KanbanColumn } from "./KanbanColumn";
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragStartEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from "@dnd-kit/core";
import { Order } from "@/lib/useOrdersApi";
import { OrderCard } from "@/components/OrderCard";
import { toast } from "sonner";
import { handleApiError } from "@/utils/handleApiError";
import { useBusinessStore } from "@/store/businessStore";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useSocket } from "@/context/SocketContext";

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export default function KanbanBoard() {
    const { orders, updateOrder, setOrders, pagination, setOrdersByStatus } = useOrdersStore();
    const { businessId } = useBusinessStore();
    const ordersApi = useOrdersApi();
    const [loading, setLoading] = useState(true);

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
    const preparingOrders = orders.filter(o => o.status === OrderStatus.PREPARING);
    const readyOrders = orders.filter(o => o.status === OrderStatus.READY);
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor)
    );

    const { socket, isConnected } = useSocket();

    const fetchKanbanOrders = useCallback(async (targetStatus?: OrderStatus) => {
        if (!targetStatus) setLoading(true);
        try {
            const statuses = targetStatus
                ? [targetStatus]
                : [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED];

            const commonParams = {
                limit: pagination.limit,
                page: 1,
            };

            if (targetStatus) {
                const response = await ordersApi.getOrdersByBusinessId(businessId, { ...commonParams, status: targetStatus });
                setOrdersByStatus(response.data.data, targetStatus);
            } else {
                const responses = await Promise.all(
                    statuses.map(status => {
                        const params: GetOrdersParams = { ...commonParams, status };
                        if (status === OrderStatus.COMPLETED) {
                            params.sort = 'DESC';
                        }
                        return ordersApi.getOrdersByBusinessId(businessId, params);
                    })
                );

                const allOrders: Order[] = responses.flatMap(response => response.data.data);
                const uniqueOrders = Array.from(new Map(allOrders.map(order => [order.id, order])).values());

                setOrders({
                    data: uniqueOrders,
                    page: 1,
                    limit: pagination.limit,
                    total: uniqueOrders.length,
                    totalPages: 1
                });
            }

        } catch (error) {
            handleApiError(error);
        } finally {
            if (!targetStatus) setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.limit, businessId, setOrders, setOrdersByStatus]);

    useEffect(() => {
        if (businessId) {
            fetchKanbanOrders();
        }
    }, [businessId, fetchKanbanOrders]);

    useEffect(() => {
        if (!socket || !isConnected || !businessId) return;

        socket.emit('joinBusiness', businessId);

        const handleOrderUpdate = (status: OrderStatus) => {
            fetchKanbanOrders(status);

        };

        const handleOrderDelete = (status: OrderStatus) => {
            fetchKanbanOrders(status);
        };

        socket.on('orderCreated', handleOrderUpdate);
        socket.on('orderUpdated', handleOrderUpdate);
        socket.on('orderDeleted', handleOrderDelete);

        return () => {
            socket.emit('leaveBusiness', businessId);
            socket.off('orderCreated', handleOrderUpdate);
            socket.off('orderUpdated', handleOrderUpdate);
            socket.off('orderDeleted', handleOrderDelete);
        };
    }, [socket, isConnected, businessId, fetchKanbanOrders]);

    const columns = [
        { title: "Pendientes", status: OrderStatus.PENDING, orders: pendingOrders, color: "border-l-yellow-500" },
        { title: "En Preparación", status: OrderStatus.PREPARING, orders: preparingOrders, color: "border-l-blue-500" },
        { title: "Listos", status: OrderStatus.READY, orders: readyOrders, color: "border-l-green-500" },
        { title: "Completados", status: OrderStatus.COMPLETED, orders: completedOrders, color: "border-l-primary-500" },
    ];

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const order = orders.find(o => o.id === active.id);
        if (order) setActiveOrder(order);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveOrder(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const currentOrder = orders.find(o => o.id === activeId);
        if (!currentOrder) return;

        let targetStatus: OrderStatus | undefined;

        if ((Object.values(OrderStatus) as string[]).includes(overId)) {
            targetStatus = overId as OrderStatus;
        } else {
            const overOrder = orders.find(o => o.id === overId);
            if (overOrder) {
                targetStatus = overOrder.status as OrderStatus;
            }
        }

        if (!targetStatus || currentOrder.status === targetStatus) return;

        const newStatus = targetStatus;
        const originalStatus = currentOrder.status;
        updateOrder(activeId, { status: newStatus });

        try {
            await ordersApi.updateOrder(activeId, { status: newStatus }, businessId);
            toast.success(`Pedido movido a ${newStatus}`, { style: toastSuccessStyle });
        } catch (error) {
            updateOrder(activeId, { status: originalStatus });
            handleApiError(error);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full w-full gap-4 overflow-hidden overflow-x-auto pb-4">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        title={column.title}
                        status={column.status}
                        orders={column.orders}
                        color={column.color}
                        loading={loading}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeOrder ? (
                    <div className="opacity-90 rotate-2 cursor-grabbing">
                        <OrderCard order={activeOrder} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
