import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

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
    const isMounted = useRef(false);
    const onSearchRef = useRef(onSearch);

    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const trimmedValue = inputValue.trim();

        if (trimmedValue === "") {
            onSearchRef.current("");
            return;
        }

        const timer = setTimeout(() => {
            onSearchRef.current(trimmedValue);
        }, 600);

        return () => clearTimeout(timer);
    }, [inputValue]);

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        className="pl-8 pr-12 w-full"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onSearch(inputValue.trim());
                            }
                        }}
                    />
                    {inputValue && (
                        <div className="absolute right-1.5 top-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:bg-muted/80"
                                onClick={() => {
                                    setInputValue("");
                                    onSearch("");
                                }}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Limpiar</span>
                            </Button>
                        </div>
                    )}
                </div>
                <Button onClick={() => onSearch(inputValue)} className="shrink-0">
                    Buscar
                </Button>
            </div>
            {children && <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">{children}</div>}
        </div>
    );
}
