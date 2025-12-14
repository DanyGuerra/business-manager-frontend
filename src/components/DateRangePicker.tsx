"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DatePickerWithRangeProps {
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    className?: string
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {

    const handleTimeChange = (type: "from" | "to", time: string) => {
        if (!date) return;
        const [hours, minutes] = time.split(":").map(Number);

        const newDate = { ...date };
        const targetDate = type === "from" ? newDate.from : newDate.to;

        if (targetDate) {
            const updatedDate = new Date(targetDate);
            updatedDate.setHours(hours);
            updatedDate.setMinutes(minutes);

            if (type === "from") newDate.from = updatedDate;
            else newDate.to = updatedDate;

            setDate(newDate);
        }
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal h-9 text-xs",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, HH:mm", { locale: es })} -{" "}
                                    {format(date.to, "LLL dd, HH:mm", { locale: es })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, HH:mm", { locale: es })
                            )
                        ) : (
                            <span>Seleccionar fechas</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col sm:flex-row">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={1}
                        />
                        <div className="p-4 border-t sm:border-t-0 sm:border-l space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Hora Inicio</Label>
                                <Input
                                    type="time"
                                    className="h-8 text-xs"
                                    value={date?.from ? format(date.from, "HH:mm") : ""}
                                    onChange={(e) => handleTimeChange("from", e.target.value)}
                                    disabled={!date?.from}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Hora Fin</Label>
                                <Input
                                    type="time"
                                    className="h-8 text-xs"
                                    value={date?.to ? format(date.to, "HH:mm") : ""}
                                    onChange={(e) => handleTimeChange("to", e.target.value)}
                                    disabled={!date?.to}
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
