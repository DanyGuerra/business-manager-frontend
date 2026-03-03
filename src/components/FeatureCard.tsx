"use client"

import { motion } from "framer-motion";

interface FeatureCardProps {
    delay: number;
    icon: React.ReactNode;
    title: string;
    description: string;
}

export function FeatureCard({ delay, icon, title, description }: FeatureCardProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
            }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay }}
            className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="p-4 rounded-full bg-primary/10 text-primary transition-colors relative overflow-hidden">
                {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground">
                {description}
            </p>
        </motion.div>
    );
}
