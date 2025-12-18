import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderCardSkeleton() {
    return (
        <Card className="w-full border border-border/40 shadow-sm overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-muted" />

            <CardHeader className="p-3 pb-1 space-y-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-2 mt-1.5 pb-1">
                    <Skeleton className="h-4 w-24 rounded-sm" />
                    <Skeleton className="h-4 w-24 rounded-sm" />
                </div>
            </CardHeader>

            <CardContent className="p-3 py-1.5 min-h-[60px] space-y-3">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </CardContent>

            <CardFooter className="p-3 pt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1">
                        <Skeleton className="h-3 w-4 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                        <span className="opacity-30">|</span>
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>

                <div className="flex items-center justify-between w-full border-t border-dashed border-border/40 pt-2 mt-0.5">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                </div>
            </CardFooter>

            <div className="px-3 pb-3 pt-0">
                <Skeleton className="h-7 w-full rounded-md" />
            </div>
        </Card>
    );
}
