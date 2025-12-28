import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DataTableSearchProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    initialValue?: string;
    children?: React.ReactNode;
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
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={placeholder}
                        className="pl-8 w-full"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onSearch(inputValue);
                            }
                        }}
                    />
                </div>
                <Button onClick={() => onSearch(inputValue)} className="shrink-0">
                    Buscar
                </Button>
            </div>
            {children && <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">{children}</div>}
        </div>
    );
}
