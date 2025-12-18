import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGroupSkeleton() {
    return (
        <Card className="border-muted bg-muted flex flex-col h-full">
            <CardHeader className="bg-muted/20">
                <div className="flex items-start justify-between gap-1">
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-[250px]" />
                        <Skeleton className="h-4 w-2/3 max-w-[180px]" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
