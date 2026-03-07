import { ApiResponse } from "@/app/types/auth";
import { useAxios } from "./axios";
import { BusinessIdHeader } from "@/consts/consts";

export type TicketPaperSize = 58 | 80 | 112;
export type TicketFontSize = 0.3 | 0.5 | 0.7 | 1.0 | 1.5 | 2.0;

export type TicketSetting = {
    id: string;
    paper_size: TicketPaperSize;
    font_size: TicketFontSize;
    show_notes: boolean;
    show_customer_info: boolean;
    show_business_address: boolean;
    show_thank_you_message: boolean;
    thank_you_message: string;
    show_info_message: boolean;
    info_message: string;
    show_phone: boolean;
    show_cashier: boolean;
    business_id: string;
    created_at: Date;
    updated_at: Date | null;
};

export type UpdateTicketSettingDto = Partial<Omit<TicketSetting, "id" | "business_id" | "created_at" | "updated_at">>;

import { useCallback, useMemo } from "react";

export function useTicketSettingsApi() {
    const api = useAxios();

    const getTicketSettingsByBusinessId = useCallback(
        (businessId: string) =>
            api
                .get<ApiResponse<TicketSetting>>(`/ticket-setting`, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        [api]
    );

    const updateTicketSetting = useCallback(
        (businessId: string, data: UpdateTicketSettingDto) =>
            api
                .put<ApiResponse<TicketSetting>>(`/ticket-setting`, data, {
                    headers: { [BusinessIdHeader]: businessId },
                })
                .then((res) => res.data),
        [api]
    );

    return useMemo(
        () => ({
            getTicketSettingsByBusinessId,
            updateTicketSetting,
        }),
        [getTicketSettingsByBusinessId, updateTicketSetting]
    );
}
