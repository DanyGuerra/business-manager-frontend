'use client'

import KanbanBoard from "./KanbanBoard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useOrdersStore } from "@/store/ordersStore";

export default function OrdersBoardPage() {
    const { pagination, setLimit } = useOrdersStore();

    return (
        <div className="flex flex-col h-full p-4 md:p-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-b mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Tablero de pedidos</h1>
                <div className="flex items-center justify-start w-full sm:w-auto gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar:</span>
                    <Select
                        value={pagination.limit.toString()}
                        onValueChange={(value) => setLimit(Number(value))}
                    >
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="20" />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20, 30, 40, 50].map((val) => (
                                <SelectItem key={val} value={val.toString()}>
                                    {val}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <KanbanBoard />
            </div>
        </div>
    );
}
