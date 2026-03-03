import { Order } from "@/lib/useOrdersApi";
import { Bell } from "lucide-react";

interface NewOrderToastProps {
    orderData: Order;
    onClick: () => void;
}

export function NewOrderToast({ orderData, onClick }: NewOrderToastProps) {
    return (
        <div
            className="group flex w-full sm:w-[356px] max-w-full items-start gap-3 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md transition-all hover:bg-card hover:shadow-primary/10 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:hover:shadow-primary/5 cursor-pointer"
            onClick={onClick}
        >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 ring-2 ring-background mt-0.5">
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary opacity-60 duration-1000" />
                <Bell className="h-5 w-5 text-primary-foreground fill-primary-foreground/20 transition-transform duration-500 group-hover:rotate-12" />
            </div>

            <div className="flex flex-1 flex-col gap-1 justify-center min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-1.5 font-bold text-sm text-foreground leading-tight tracking-tight truncate">
                        ¡Nuevo Pedido!
                        {orderData.order_number && (
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
                                #{orderData.order_number.toString().padStart(2, '0').slice(-2)}
                            </span>
                        )}
                    </h3>
                    <span className="flex h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)] animate-pulse shrink-0" />
                </div>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-primary/80 font-bold hover:underline flex items-center gap-1 group-hover:text-primary transition-colors">
                        VER TABLERO
                        <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
