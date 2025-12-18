import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
    return (
        <div className="flex flex-col h-full rounded-xl border bg-card p-5">
            <div className="mb-4 pr-16 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex-1 mb-6 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
            </div>
            <div className="border-t pt-3 mb-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>
            <Skeleton className="h-8 w-full mt-auto" />
        </div>
    );
}
