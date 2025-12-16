"use client";

import { Option } from "@/lib/useOptionGroupApi";
import { cn } from "@/lib/utils";

type ProductOptionChipProps = {
    option: Option;
    isSelected: boolean;
    isEditMode: boolean;
    onClick: () => void;
};

export default function ProductOptionChip({
    option,
    isSelected,
    isEditMode,
    onClick,
}: ProductOptionChipProps) {
    return (
        <span
            onClick={onClick}
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium transition-colors border select-none",
                !isSelected &&
                option.available &&
                "bg-muted text-muted-foreground border-transparent hover:bg-muted/80 cursor-pointer",
                !option.available &&
                "bg-transparent text-muted-foreground/30 border-muted opacity-50 cursor-not-allowed line-through",
                isSelected &&
                "bg-primary text-primary-foreground border-primary cursor-pointer hover:bg-primary/90 rounded px-1.5",
                isEditMode && "cursor-default opacity-70"
            )}
        >
            {option.name}
            {option.price > 0 && ` +$${option.price}`}
        </span>
    );
}
