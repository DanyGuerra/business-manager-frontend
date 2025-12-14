"use client";

import { cn } from "@/lib/utils";
import ProductOptionChip from "./ProductOptionChip";
import { OptionGroup } from "@/lib/useOptionGroupApi";

type ProductOptionGroupItemProps = {
    group: OptionGroup;
    selectedOptions: string[];
    onSelectOption: (
        groupId: string,
        optionId: string,
        isMulti: boolean,
        maxOptions: number
    ) => void;
    isEditMode: boolean;
};

export default function ProductOptionGroupItem({
    group,
    selectedOptions,
    onSelectOption,
    isEditMode,
}: ProductOptionGroupItemProps) {
    return (
        <div
            className={cn(
                "text-xs leading-snug",
                !group.available && "opacity-50 pointer-events-none"
            )}
        >
            <span
                className={cn(
                    "font-semibold text-foreground/90 mr-1",
                    !group.available && "line-through"
                )}
            >
                {group.name}
                {group.min_options > 0 && (
                    <span className="text-destructive ml-0.5">*</span>
                )}
                <span className="text-[10px] text-muted-foreground font-normal ml-1">
                    (Min: {group.min_options} - Max: {group.max_options})
                </span>
                :
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
                {group.options && group.options.length > 0 ? (
                    group.options.map((opt) => {
                        const isSelected = selectedOptions?.includes(opt.id) || false;
                        return (
                            <ProductOptionChip
                                key={opt.id}
                                option={opt}
                                isSelected={isSelected}
                                isEditMode={isEditMode}
                                onClick={() => {
                                    if (group.available && opt.available && !isEditMode) {
                                        onSelectOption(
                                            group.id,
                                            opt.id,
                                            group.max_options > 1,
                                            group.max_options
                                        );
                                    }
                                }}
                            />
                        );
                    })
                ) : (
                    <span className="text-muted-foreground text-xs italic">
                        Sin opciones
                    </span>
                )}
            </div>
        </div>
    );
}
