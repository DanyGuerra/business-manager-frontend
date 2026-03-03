"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedKanbanHero() {
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, 11000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto h-[400px] mt-8 mb-8 md:mt-12 perspective-[1000px]">
            <div className="w-full h-full overflow-x-auto scrollbar-hide pb-4">
                <motion.div
                    initial={{ rotateX: 20, rotateY: -10, scale: 0.9, opacity: 0 }}
                    animate={{ rotateX: 0, rotateY: 0, scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="min-w-[700px] w-full h-full bg-background/50 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="h-14 border-b border-primary/10 flex items-center px-6 justify-between bg-muted/30">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                            <span>Tablero de Pedidos Activos</span>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-primary">DG</span>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center -ml-2">
                                <span className="text-[10px] font-bold text-blue-500">MC</span>
                            </div>
                        </div>
                    </div>


                    <div key={animationKey} className="flex-1 p-6 grid grid-cols-3 gap-6 bg-muted/10">
                        <div className="bg-background/80 rounded-lg border border-border/50 flex flex-col">
                            <div className="p-3 border-b flex justify-between items-center bg-muted/50 rounded-t-lg">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500" /> Nuevos
                                </h4>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-md">
                                    2
                                </span>
                            </div>
                            <div className="p-3 space-y-3 flex-1 relative">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-card p-3 rounded-md border shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">#84</span>
                                        <span className="text-xs font-bold">$250.00</span>
                                    </div>
                                    <p className="text-xs font-medium">1x Pizza Familiar, 2x Sodas</p>
                                    <div className="mt-3 flex justify-between items-center text-muted-foreground">
                                        <span className="text-[10px]">Mesa 4</span>
                                        <div className="w-4 h-4 rounded-full bg-muted" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        type: "spring",
                                        bounce: 0.4,
                                        delay: 5.5 // Aparece casi al final del ciclo de 7 segundos
                                    }}
                                    className="bg-card p-3 rounded-md border shadow-md border-red-500/20"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded animate-pulse">#86</span>
                                        <span className="text-xs font-bold">$185.00</span>
                                    </div>
                                    <p className="text-xs font-medium">3x Tacos al Pastor, 1x Refresco</p>
                                    <div className="mt-3 flex justify-between items-center text-muted-foreground">
                                        <span className="text-[10px]">Mesa 2</span>
                                        <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-[8px] font-bold">DG</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="bg-background/80 rounded-lg border border-border/50 flex flex-col relative">
                            <div className="p-3 border-b flex justify-between items-center bg-muted/50 rounded-t-lg">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" /> Preparando
                                </h4>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-md">2</span>
                            </div>
                            <div className="p-3 space-y-3 flex-1">
                                <motion.div
                                    initial={{ x: "0%", y: 0, rotate: 0, scale: 1 }}
                                    animate={{
                                        x: ["0%", "5%", "calc(100% + 3rem)"],
                                        y: [0, -10, 0],
                                        rotate: [0, 5, 0],
                                        scale: [1, 1.05, 1],
                                        opacity: [1, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        ease: "easeInOut",
                                        delay: 2.5,
                                        times: [0, 0.2, 1]
                                    }}
                                    className="bg-card p-3 rounded-md border shadow-sm z-10 relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">#82</span>
                                        <span className="text-xs font-bold">$340.00</span>
                                    </div>
                                    <p className="text-xs font-medium">1x Pollo Entero, 2x Ensaladas</p>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: [0, 0, -80] }}
                                    transition={{
                                        duration: 2.5,
                                        ease: "easeInOut",
                                        delay: 2.5,
                                        times: [0, 0.2, 1]
                                    }}
                                    className="bg-card p-3 rounded-md border shadow-lg border-primary/50 relative z-0"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">#85</span>
                                        <span className="text-xs font-bold">$120.00</span>
                                    </div>
                                    <p className="text-xs font-medium">2x Hamburguesa, 1x Papas</p>
                                    <div className="mt-3 flex justify-between items-center text-muted-foreground">
                                        <span className="text-[10px]">Para llevar</span>
                                        <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[8px] font-bold">MC</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Column 3: Listos */}
                        <div className="bg-background/80 rounded-lg border border-border/50 flex flex-col">
                            <div className="p-3 border-b flex justify-between items-center bg-muted/50 rounded-t-lg">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" /> Listos / Entregados
                                </h4>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-md">3</span>
                            </div>
                            <div className="p-3 space-y-3 flex-1 flex flex-col opacity-70">

                                <div className="bg-card/50 p-3 rounded-md border border-dashed shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded">#81</span>
                                    </div>
                                    <p className="text-xs font-medium line-through text-muted-foreground">Café Americano</p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 4.3 }} // Appears when the other one arrives
                                    className="bg-card p-3 rounded-md border shadow-sm border-green-500/30"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded">#82</span>
                                        <span className="text-xs font-bold text-muted-foreground">Completado</span>
                                    </div>
                                    <p className="text-xs font-medium line-through text-muted-foreground">1x Pollo Entero, 2x Ensaladas</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[100px] -z-20 pointer-events-none" />
        </div>
    );
}
