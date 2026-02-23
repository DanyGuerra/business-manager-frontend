import { useAxios } from "./axios";
import { useMemo } from "react";
import { BusinessIdHeader } from "@/consts/consts";
import { ApiResponse } from "@/app/types/auth";
import { Order } from "./useOrdersApi";

enum TransactionType {
    ADD = "ADD",
    WITHDRAW = "WITHDRAW"
}

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    type: TransactionType;
    created_at: string;
    updated_at: string;
    order?: Partial<Order>
}

export interface CashRegister {
    id: string;
    balance: number;
    transactions: Transaction[];
    business_id: string;
    created_at: string;
    updated_at: string;
}

export interface AddMoneyDto {
    amount: number;
    description: string;
}

export interface WithdrawMoneyDto {
    amount: number;
    description: string;
}

export const useCashRegisterApi = () => {
    const api = useAxios();

    return useMemo(() => ({
        getCashRegister: (businessId: string) =>
            api
                .get<ApiResponse<CashRegister>>(`/cash-register`, {
                    headers: { [BusinessIdHeader]: businessId }
                })
                .then((res) => res.data),

        addMoney: (businessId: string, data: AddMoneyDto) =>
            api
                .post<CashRegister>(`/cash-register/add`, data, {
                    headers: { [BusinessIdHeader]: businessId }
                })
                .then((res) => res.data),

        withdrawMoney: (businessId: string, data: WithdrawMoneyDto) =>
            api
                .post<CashRegister>(`/cash-register/withdraw`, data, {
                    headers: { [BusinessIdHeader]: businessId }
                })
                .then((res) => res.data),
    }), [api]);
};
