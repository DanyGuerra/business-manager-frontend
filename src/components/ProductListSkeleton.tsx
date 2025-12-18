import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
