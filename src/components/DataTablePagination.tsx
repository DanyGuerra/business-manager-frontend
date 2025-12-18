import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CustomPagination from "@/components/CustomPagination";

interface DataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    limit: number;
    onLimitChange: (limit: number) => void;
    totalItems: number;
    currentCount: number;
    itemName?: string;
}

export function DataTablePagination({
    currentPage,
    totalPages,
    onPageChange,
    limit,
    onLimitChange,
    totalItems,
    currentCount,
    itemName = "elementos",
}: DataTablePaginationProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
                Mostrando {currentCount} de {totalItems} {itemName}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 order-1 sm:order-2 w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto space-x-2">
                    <p className="text-sm font-medium">Filas por página</p>
                    <Select
                        value={limit.toString()}
                        onValueChange={(value) => onLimitChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={limit.toString()} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <CustomPagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    className="w-auto mx-0"
                />
            </div>
        </div>
    );
}
