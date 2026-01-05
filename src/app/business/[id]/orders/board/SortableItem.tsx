import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode, createContext } from "react";

interface SortableItemProps {
    id: string;
    children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SortableItemContext = createContext<any>(null);

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <SortableItemContext.Provider value={{ attributes, listeners, isDragging }}>
            <div ref={setNodeRef} style={style} className="touch-none">
                {children}
            </div>
        </SortableItemContext.Provider>
    );
}
