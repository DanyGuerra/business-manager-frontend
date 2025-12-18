import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DataTableSearchProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    initialValue?: string;
    children?: React.ReactNode; // For extra actions like "Create" button
}

export function DataTableSearch({
    onSearch,
    placeholder = "Buscar...",
    initialValue = "",
    children
}: DataTableSearchProps) {
    const [inputValue, setInputValue] = useState(initialValue);

    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);

    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={placeholder}
                    className="pl-8"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSearch(inputValue);
                        }
                    }}
                />
            </div>
            <Button onClick={() => onSearch(inputValue)}>
                Buscar
            </Button>
            {children && <div className="ml-auto">{children}</div>}
        </div>
    );
}
