import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TicketSetting } from "@/lib/useTicketSettings";

interface TicketSettingsState {
    ticketSetting: TicketSetting | null;
    setTicketSetting: (setting: TicketSetting | null) => void;
    clearTicketSetting: () => void;
}

export const useTicketSettingsStore = create<TicketSettingsState>()(
    persist(
        (set) => {
            return {
                ticketSetting: null,

                setTicketSetting: (setting) =>
                    set({
                        ticketSetting: setting,
                    }),

                clearTicketSetting: () =>
                    set({
                        ticketSetting: null,
                    }),
            };
        },
        { name: "ticket-settings-store" }
    )
);
