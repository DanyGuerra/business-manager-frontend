"use client";

import { motion } from "framer-motion";

export function AnimatedUtensils() {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary overflow-visible"
        >
            {/* Tenedor (Fork) */}
            <motion.path
                d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"
                variants={{
                    hidden: { y: 0, rotate: 0 },
                    visible: { y: 0, rotate: 0 },
                    hover: { y: [0, -4, 0], rotate: [0, -10, 0], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } }
                }}
            />
            <motion.path
                d="M7 2v20"
                variants={{
                    hidden: { y: 0, rotate: 0 },
                    visible: { y: 0, rotate: 0 },
                    hover: { y: [0, -4, 0], rotate: [0, -10, 0], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } }
                }}
            />

            <motion.path
                d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"
                variants={{
                    hidden: { y: 0, rotate: 0 },
                    visible: { y: 0, rotate: 0 },
                    hover: { y: [0, -4, 0], rotate: [0, 10, 0], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 } }
                }}
            />

            <motion.path
                d="M10 16a4 4 0 0 1 4-4"
                variants={{
                    hidden: { pathLength: 0, opacity: 0, y: 0 },
                    visible: { pathLength: 0, opacity: 0, y: 0 },
                    hover: { pathLength: [0, 1, 0], opacity: [0, 1, 0], y: -5, transition: { duration: 1.5, repeat: Infinity } }
                }}
            />
        </motion.svg>
    );
}

export function AnimatedUsers() {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary overflow-visible"
        >
            <motion.path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                variants={{
                    hover: { x: [0, -2, 0], scale: [1, 1.05, 1], transition: { duration: 1 } }
                }}
            />
            <motion.circle
                cx="9" cy="7" r="4"
                variants={{
                    hover: { y: [0, -3, 0], transition: { duration: 1 } }
                }}
            />
            <motion.path
                d="M22 21v-2a4 4 0 0 0-3-3.87"
                variants={{
                    hidden: { opacity: 0.5, x: 5 }, visible: { opacity: 0.5, x: 5 },
                    hover: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                }}
            />
            <motion.path
                d="M16 3.13a4 4 0 0 1 0 7.75"
                variants={{
                    hidden: { opacity: 0.5, x: 5 }, visible: { opacity: 0.5, x: 5 },
                    hover: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                }}
            />
            <motion.path
                d="M11 12h5"
                strokeDasharray="2 2"
                variants={{
                    hidden: { opacity: 0, pathLength: 0 }, visible: { opacity: 0, pathLength: 0 },
                    hover: { opacity: 1, pathLength: 1, transition: { duration: 0.5, delay: 0.3 } }
                }}
            />
        </motion.svg>
    );
}

export function AnimatedBarChart() {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary overflow-visible"
        >
            <motion.path d="M3 3v18h18" />
            <motion.path
                d="M18 17V9"
                variants={{
                    hidden: { y: 8, strokeWidth: 1 }, visible: { y: 8, strokeWidth: 1 },
                    hover: { y: 0, strokeWidth: 3, stroke: "#3b82f6", transition: { duration: 0.4 } }
                }}
            />
            <motion.path
                d="M13 17V5"
                variants={{
                    hidden: { y: 12, strokeWidth: 1 }, visible: { y: 12, strokeWidth: 1 },
                    hover: { y: 0, strokeWidth: 4, stroke: "#10b981" } // Ganancia punta verde
                }}
                transition={{ duration: 0.5, delay: 0.1 }}
            />
            <motion.path
                d="M8 17v-3"
                variants={{
                    hidden: { y: 3, strokeWidth: 1 }, visible: { y: 3, strokeWidth: 1 },
                    hover: { y: 0, strokeWidth: 3, transition: { duration: 0.3 } }
                }}
            />
            <motion.path
                d="M7 11l4-5 4 4 5-5"
                stroke="#ef4444"
                variants={{
                    hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 0, opacity: 0 },
                    hover: { pathLength: 1, opacity: 1, transition: { duration: 0.8, delay: 0.4 } }
                }}
            />
        </motion.svg>
    );
}

export function AnimatedCalculator() {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary overflow-visible"
        >
            <motion.rect x="4" y="2" width="16" height="20" rx="2" />
            <motion.line x1="8" x2="16" y1="6" y2="6" strokeWidth={3} />

            <motion.line x1="8" x2="8" y1="10" y2="10" />
            <motion.line x1="12" x2="12" y1="10" y2="10" />
            <motion.line x1="16" x2="16" y1="10" y2="10" />

            <motion.line x1="8" x2="8" y1="14" y2="14" />
            <motion.line x1="12" x2="12" y1="14" y2="14" />
            <motion.line x1="16" x2="16" y1="14" y2="14" />

            <motion.line x1="8" x2="8" y1="18" y2="18" />
            <motion.line x1="12" x2="12" y1="18" y2="18" />
            <motion.line x1="16" x2="16" y1="18" y2="18" />

            <motion.path
                d="M6 2L6 -4L18 -4L18 2"
                fill="white"
                stroke="currentColor"
                variants={{
                    hidden: { y: 6, opacity: 0, scaleY: 0 }, visible: { y: 6, opacity: 0, scaleY: 0 },
                    hover: { y: -2, opacity: 1, scaleY: 1, transition: { duration: 0.6 } }
                }}
            />
            <motion.line
                x1="8" x2="16" y1="-2" y2="-2" strokeWidth={1}
                variants={{
                    hidden: { opacity: 0 }, visible: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.5 } }
                }}
            />
            <motion.line
                x1="8" x2="12" y1="0" y2="0" strokeWidth={1}
                variants={{
                    hidden: { opacity: 0 }, visible: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.6 } }
                }}
            />
        </motion.svg>
    );
}

export function AnimatedSparkles() {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary overflow-visible"
            variants={{ hidden: {}, visible: {}, hover: {} }}
        >
            {/* Main Center Sparkle / Star */}
            <motion.path
                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                variants={{
                    hidden: { rotate: 0, scale: 1, fill: "transparent" },
                    visible: { rotate: 0, scale: 1, fill: "transparent" },
                    hover: {
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.15, 1],
                        fill: ["transparent", "rgba(16, 185, 129, 0.5)", "transparent"],
                        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }
                }}
            />
            {/* Top Right Sparkle Combined */}
            <motion.path
                d="M20 3v4M22 5h-4"
                variants={{
                    hidden: { scale: 0, opacity: 0, rotate: 0, originX: "20px", originY: "5px" },
                    visible: { scale: 0, opacity: 0, rotate: 0, originX: "20px", originY: "5px" },
                    hover: {
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 90, 180],
                        transition: { duration: 1.5, repeat: Infinity, delay: 0.1, ease: "easeInOut" }
                    }
                }}
            />
            {/* Bottom Left Sparkle Combined */}
            <motion.path
                d="M4 17v2M5 18H3"
                variants={{
                    hidden: { scale: 0, opacity: 0, rotate: 0, originX: "4px", originY: "18px" },
                    visible: { scale: 0, opacity: 0, rotate: 0, originX: "4px", originY: "18px" },
                    hover: {
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, -90, -180],
                        transition: { duration: 1.5, repeat: Infinity, delay: 0.5, ease: "easeInOut" }
                    }
                }}
            />
            {/* Ambient Floating Magical Dust */}
            <motion.circle cx="18" cy="18" r="1.5" fill="currentColor" stroke="none"
                variants={{
                    hidden: { y: 0, x: 0, opacity: 0 },
                    visible: { y: 0, x: 0, opacity: 0 },
                    hover: {
                        y: [0, -12],
                        x: [0, -6],
                        opacity: [0, 0.8, 0],
                        transition: { duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }
                    }
                }}
            />
            <motion.circle cx="6" cy="6" r="2" fill="currentColor" stroke="none"
                variants={{
                    hidden: { y: 0, x: 0, opacity: 0 },
                    visible: { y: 0, x: 0, opacity: 0 },
                    hover: {
                        y: [0, -10],
                        x: [0, 8],
                        opacity: [0, 0.6, 0],
                        transition: { duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.9 }
                    }
                }}
            />
        </motion.svg>
    );
}

export function AnimatedPrinter() {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary overflow-visible"
        >
            {/* Cuerpo de la impresora térmica */}
            <motion.path d="M6 18H18V12H6V18Z" strokeWidth={2} />
            <motion.path d="M6 14H18" strokeWidth={1} />

            {/* Ticket de papel subiendo lentamente */}
            <motion.path
                d="M8 12V4H16V12"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                variants={{
                    hidden: { y: 6, pathLength: 0.2, opacity: 0.5 }, visible: { y: 6, pathLength: 0.2, opacity: 0.5 },
                    hover: { y: -2, pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
                }}
            />
            {/* Lineas de texto en el ticket */}
            <motion.line
                x1="10" x2="14" y1="6" y2="6" strokeWidth={1}
                variants={{
                    hidden: { opacity: 0 }, visible: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.3 } }
                }}
            />
            <motion.line
                x1="10" x2="14" y1="8" y2="8" strokeWidth={1}
                variants={{
                    hidden: { opacity: 0 }, visible: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.5 } }
                }}
            />
            <motion.line
                x1="10" x2="12" y1="10" y2="10" strokeWidth={1}
                variants={{
                    hidden: { opacity: 0 }, visible: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.7 } }
                }}
            />

            {/* Luz de estado o botón */}
            <motion.circle
                cx="16" cy="16" r="1" fill="currentColor"
                variants={{
                    hidden: { opacity: 0.5 }, visible: { opacity: 0.5 },
                    hover: { opacity: [0.5, 1, 0.5], transition: { duration: 0.5, repeat: Infinity } }
                }}
            />
        </motion.svg>
    );
}
