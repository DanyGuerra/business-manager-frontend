"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

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

interface DateTimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    label?: string
    className?: string
}

export function DateTimePicker({
    date,
    setDate,
    label = "Fecha",
    className,
}: DateTimePickerProps) {

    const [isOpen, setIsOpen] = React.useState(false);
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(date);

    React.useEffect(() => {
        setInternalDate(date);
    }, [date]);

    const handleTimeChange = (time: string) => {
        if (!time) return;
        const [hours, minutes] = time.split(":").map(Number);

        const baseDate = internalDate || new Date();
        const newDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            hours,
            minutes,
            0,
            0
        );
        setInternalDate(newDate);
    };

    const handleApply = () => {
        setDate(internalDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setInternalDate(date);
        setIsOpen(false);
    };

    const clearDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDate(undefined);
        setInternalDate(undefined);
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal h-9 text-xs relative",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        date.toLocaleString('es-MX', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    ) : (
                        <span>{label}</span>
                    )}

                    {date && (
                        <div
                            role="button"
                            onClick={clearDate}
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-muted p-1 rounded-full"
                        >
                            <X className="h-3 w-3" />
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col sm:flex-row">
                    <Calendar
                        mode="single"
                        selected={internalDate}
                        onSelect={setInternalDate}
                        initialFocus
                    />
                    <div className="p-4 border-t sm:border-t-0 sm:border-l space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                            <Label className="text-xs">Hora</Label>
                            <Input
                                type="time"
                                className="h-8 text-xs"
                                value={internalDate ? format(internalDate, "HH:mm") : ""}
                                onChange={(e) => handleTimeChange(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-7 text-xs">
                                Cancelar
                            </Button>
                            <Button size="sm" onClick={handleApply} className="h-7 text-xs">
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
