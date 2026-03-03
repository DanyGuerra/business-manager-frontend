"use client"

import { Kanban } from "lucide-react";

export function FeaturedKanbanCard() {
    return (
        <div className="md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl bg-background border border-primary text-card-foreground shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all relative overflow-hidden group transform duration-300">
            <div className="absolute inset-0 bg-primary/10 -z-10 transition-colors duration-500" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-50 transition-opacity duration-700 animate-pulse" />

            <div className="relative p-6 rounded-2xl bg-primary/20 text-primary shrink-0 ring-4 ring-primary/40 shadow-inner transition-all">
                <Kanban className="h-12 w-12 animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg animate-ping" style={{ animationDuration: '2s' }}>
                    <div className="h-2 w-2 rounded-full bg-white" />
                </div>
            </div>

            <div className="space-y-3 text-center md:text-left z-10">
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    Destacado
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight text-primary">Tablero Kanban de Pedidos en Vivo</h3>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl">
                    Revolucione su cocina y despacho. Visualice cada pedido en un tablero interactivo,
                    arrastre tarjetas entre estados y mantenga a todo su equipo sincronizado en tiempo real al instante.
                </p>
            </div>
        </div>
    );
}
