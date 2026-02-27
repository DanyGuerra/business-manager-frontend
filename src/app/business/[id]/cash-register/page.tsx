"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useCashRegisterApi, CashRegister, TransactionType } from "@/lib/useCashRegisterApi";
import { formatCurrency } from "@/utils/printTicket";
import { ArrowDownIcon, ArrowUpIcon, Wallet, Filter, XCircle } from "lucide-react";
import CustomDialog from "@/components/customDialog";
import FormCashRegister, { CashRegisterTransactionValues } from "@/components/formCashRegister";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle, toastErrorStyle } from "@/lib/toastStyles";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/utils/handleApiError";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DateTimePicker } from "@/components/DateTimePicker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CashRegisterPageProps {
    params: Promise<{
        id: string;
    }>;
}

const defaultCashRegister: CashRegister = {
    id: "",
    balance: 0,
    transactions: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    business_id: "",
    created_at: "",
    updated_at: "",
};

export default function CashRegisterPage({ params }: CashRegisterPageProps) {
    const resolvedParams = use(params);
    const businessId = resolvedParams.id;

    const { getCashRegister, addMoney, withdrawMoney } = useCashRegisterApi();
    const { startLoading, stopLoading } = useLoadingStore();

    const [cashRegister, setCashRegister] = useState<CashRegister>(defaultCashRegister);
    const [isLoading, setIsLoading] = useState(true);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openWithdrawModal, setOpenWithdrawModal] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [transactionType, setTransactionType] = useState<TransactionType | "ALL">("ALL");

    const fetchBalance = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await getCashRegister(
                businessId,
                page,
                limit,
                startDate,
                endDate,
                sort,
                transactionType === "ALL" ? undefined : transactionType
            );
            setCashRegister(data);
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    }, [businessId, getCashRegister, page, limit, startDate, endDate, sort, transactionType]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const resetFilters = () => {
        setSort("DESC");
        setStartDate(undefined);
        setEndDate(undefined);
        setTransactionType("ALL");
        setPage(1);
    };

    const hasActiveFilters = sort !== "DESC" || startDate !== undefined || endDate !== undefined || transactionType !== "ALL";

    const handleAddMoney = async (values: CashRegisterTransactionValues) => {
        try {
            startLoading(LoadingsKeyEnum.ADD_MONEY);
            await addMoney(businessId, values);
            toast.success("Ingreso registrado con éxito", { style: toastSuccessStyle });
            setOpenAddModal(false);
            fetchBalance();
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.ADD_MONEY);
        }
    };

    const handleWithdrawMoney = async (values: CashRegisterTransactionValues) => {
        try {
            if (cashRegister.balance !== null && values.amount > cashRegister.balance) {
                toast.error("Fondos insuficientes en la caja", { style: toastErrorStyle });
                return;
            }
            startLoading(LoadingsKeyEnum.WITHDRAW_MONEY);
            await withdrawMoney(businessId, values);
            toast.success("Retiro registrado con éxito", { style: toastSuccessStyle });
            setOpenWithdrawModal(false);
            fetchBalance();
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.WITHDRAW_MONEY);
        }
    };

    return (
        <div className="flex h-full flex-col gap-6 w-full p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Caja Registradora</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los ingresos y egresos de efectivo de tu negocio
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Balance actual</h3>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-6 pt-0">
                        {isLoading ? (
                            <Skeleton className="h-8 w-32 mt-1" />
                        ) : (
                            <div className="text-3xl font-bold">
                                {cashRegister !== null ? formatCurrency(cashRegister.balance) : "$0.00"}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Efectivo disponible en caja
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 justify-center">
                    <CustomDialog
                        modalTitle="Ingresar Dinero"
                        modalDescription="Añade fondos a la caja registradora especificando el monto y el concepto (ej. Fondo inicial)."
                        open={openAddModal}
                        setOpen={setOpenAddModal}
                        trigger={
                            <Button className="w-full justify-start h-12" variant="outline">
                                <ArrowUpIcon className="mr-2 h-4 w-4 text-emerald-500" />
                                Ingresar Dinero
                            </Button>
                        }
                    >
                        <FormCashRegister
                            buttonTitle="Registrar Ingreso"
                            loadingKey={LoadingsKeyEnum.ADD_MONEY}
                            handleSubmitButton={handleAddMoney}
                            currentBalance={cashRegister?.balance || 0}
                            transactionType="IN"
                        />
                    </CustomDialog>

                    <CustomDialog
                        modalTitle="Retirar Dinero"
                        modalDescription="Registra una salida de efectivo de la caja especificando el monto y el concepto (ej. Pago a proveedor)."
                        open={openWithdrawModal}
                        setOpen={setOpenWithdrawModal}
                        trigger={
                            <Button className="w-full justify-start h-12" variant="outline">
                                <ArrowDownIcon className="mr-2 h-4 w-4 text-rose-500" />
                                Retirar Dinero
                            </Button>
                        }
                    >
                        <FormCashRegister
                            buttonTitle="Registrar Retiro"
                            loadingKey={LoadingsKeyEnum.WITHDRAW_MONEY}
                            handleSubmitButton={handleWithdrawMoney}
                            currentBalance={cashRegister?.balance || 0}
                            transactionType="OUT"
                        />
                    </CustomDialog>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 w-full">
                    <h2 className="text-xl font-bold tracking-tight shrink-0">Transacciones</h2>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 shrink-0">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filtros:</span>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full">
                            <Select value={sort} onValueChange={(val: 'ASC' | 'DESC') => { setSort(val); setPage(1); }}>
                                <SelectTrigger className="h-9 text-xs w-full sm:w-[130px]">
                                    <SelectValue placeholder="Orden" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DESC">Más recientes</SelectItem>
                                    <SelectItem value="ASC">Más antiguas</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={transactionType} onValueChange={(val: TransactionType | 'ALL') => { setTransactionType(val); setPage(1); }}>
                                <SelectTrigger className="h-9 text-xs w-full sm:w-[130px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value={TransactionType.ADD}>Ingresos</SelectItem>
                                    <SelectItem value={TransactionType.WITHDRAW}>Retiros</SelectItem>
                                </SelectContent>
                            </Select>

                            <DateTimePicker
                                date={startDate}
                                setDate={(date) => { setStartDate(date); setPage(1); }}
                                label="Inicio"
                                className="h-9 w-full sm:min-w-[130px] sm:w-auto text-xs"
                            />

                            <DateTimePicker
                                date={endDate}
                                setDate={(date) => { setEndDate(date); setPage(1); }}
                                label="Fin"
                                className="h-9 w-full sm:min-w-[130px] sm:w-auto text-xs"
                            />

                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground col-span-2 sm:col-span-1 w-full sm:w-auto">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Orden</TableHead>
                                <TableHead className="text-right">Balance Anterior</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Balance Nuevo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_: unknown, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Skeleton className="h-4 w-[80px]" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-full max-w-[250px]" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : cashRegister?.transactions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No hay transacciones registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cashRegister?.transactions.data.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(tx.created_at), "dd/MM/yyyy hh:mm a")}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {tx.description}
                                        </TableCell>
                                        <TableCell>
                                            {tx.type === "ADD" ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                    Ingreso
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-rose-100/50 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                                                    Retiro
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm font-mono">
                                            {tx.order_id ? (
                                                <Link
                                                    href={`/business/${businessId}/orders/${tx.order_id}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                >
                                                    {`#${tx.order_id.substring(0, 8)}`}
                                                </Link>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {tx.previous_balance ? formatCurrency(tx.previous_balance) : "-"}
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${tx.type === "ADD" ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}>
                                            {tx.type === "ADD" ? "+" : "-"}{formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">
                                            {tx.new_balance ? formatCurrency(tx.new_balance) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DataTablePagination
                    currentPage={cashRegister?.transactions.page || 1}
                    totalPages={cashRegister?.transactions.totalPages || 1}
                    onPageChange={setPage}
                    limit={limit}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1); // Regresamos a la primer página al cambiar la cantidad de elementos.
                    }}
                    totalItems={cashRegister?.transactions.total || 0}
                    currentCount={cashRegister?.transactions.data.length || 0}
                    itemName="transacciones"
                />
            </div>
        </div>
    );
}
