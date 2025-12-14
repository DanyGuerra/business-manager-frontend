"use client";

import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

type QuantitySelectorProps = {
    quantity: number;
    onChange: (value: number) => void;
    min?: number;
};

export default function QuantitySelector({
    quantity,
    onChange,
    min = 1,
}: QuantitySelectorProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            onChange(min);
            return;
        }
        const num = parseInt(val);
        if (!isNaN(num) && num >= min) {
            onChange(num);
        }
    };

    return (
        <div className="flex items-center border rounded-md h-8 overflow-hidden">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none border-r"
                onClick={() => onChange(Math.max(min, quantity - 1))}
                disabled={quantity <= min}
            >
                <MinusIcon className="h-3 w-3" />
            </Button>
            <input
                className="w-10 h-full text-center text-sm font-medium focus:outline-none border-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={quantity}
                onChange={handleInputChange}
            />
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none border-l"
                onClick={() => onChange(quantity + 1)}
            >
                <PlusIcon className="h-3 w-3" />
            </Button>
        </div>
    );
}
