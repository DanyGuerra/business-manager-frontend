"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureShowcaseProps {
    title: string;
    description: string;
    icon: ReactNode;
    isReversed?: boolean;
    colorName?: "primary" | "orange" | "green" | "blue" | "purple" | "red";
    index?: number;
}

const colorMap = {
    primary: "from-primary/20",
    orange: "from-orange-500/20",
    green: "from-green-500/20",
    blue: "from-blue-500/20",
    purple: "from-purple-500/20",
    red: "from-red-500/20",
};

export function FeatureShowcase({
    title,
    description,
    icon,
    isReversed = false,
    colorName = "primary",
}: FeatureShowcaseProps) {
    const bgGradient = colorMap[colorName];

    return (
        <section className="relative overflow-hidden w-full py-16 md:py-32">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div
                    className={cn(
                        "flex flex-col gap-12 lg:gap-24 items-center justify-between",
                        isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                    )}
                >
                    <motion.div
                        initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="flex flex-col space-y-6 lg:w-1/2"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            {title}
                        </h2>
                        <p className="max-w-[600px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="w-full lg:w-1/2 flex justify-center items-center relative min-h-[200px]"
                    >
                        <div
                            className={cn(
                                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-tr to-transparent blur-3xl opacity-60 -z-10",
                                bgGradient
                            )}
                        />

                        <motion.div
                            initial="hidden"
                            whileHover="hover"
                            className="relative p-12 md:p-20 border border-muted-foreground/10 bg-background/40 backdrop-blur-xl rounded-[3rem] shadow-2xl flex items-center justify-center transform-gpu"
                        >
                            <div className="scale-[2.5] md:scale-[3.5] transform-origin-center">
                                {icon}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
