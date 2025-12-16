"use client";

import { useEffect, useState } from "react";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import { Product } from "@/lib/useBusinessApi";
import ProductCardList from "@/app/business/[id]/ProductCardList";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/utils/handleApiError";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import CustomPagination from "@/components/CustomPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type BusinessProductsListProps = {
    businessId: string;
};

export default function TabProducts({
    businessId,
}: BusinessProductsListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const productApi = useProductApi();
    const { startLoading, stopLoading } = useLoadingStore();
    const { business } = useBusinessStore();
    const { getBusiness } = useFetchBusiness();

    async function getProducts() {
        try {
            setLoading(true);
            const { data } = await productApi.getProductsByBusinessId(businessId, { page, limit, search });
            setProducts(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateProduct(data: ProductValues) {
        try {
            startLoading(LoadingsKeyEnum.CREATE_PRODUCT);
            const productDto: CreateProductDto = {
                ...data,
                base_price: Number(data.base_price),
                description: data.description ?? "",
                group_product_id: data.menuId ?? "",
            };

            await productApi.createProduct([productDto], businessId);
            await getProducts();
            await getBusiness(businessId);
            toast.success("Producto creado exitosamente", { style: toastSuccessStyle });
        } catch (error) {
            handleApiError(error);
        } finally {
            stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
        }
    }

    useEffect(() => {
        if (businessId) {
            getProducts();
        }
    }, [businessId, page, limit, search]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar productos..."
                        className="pl-8"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setSearch(inputValue);
                                setPage(1);
                            }
                        }}
                    />
                </div>
                <Button onClick={() => {
                    setSearch(inputValue);
                    setPage(1);
                }}>
                    Buscar
                </Button>
            </div>

            {products.length === 0 && page === 1 && !search ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                    <h3 className="text-lg font-medium">No hay productos</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Este negocio aún no tiene productos agregados.
                    </p>

                    <CustomDialog
                        modalTitle="Crear producto"
                        modalDescription="Agrega un nuevo producto a tu inventario"
                        textButtonTrigger="Crear primer producto"
                    >
                        <FormProduct
                            buttonTitle="Crear"
                            loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                            handleSubmitButton={handleCreateProduct}
                            menus={business?.product_group || []}
                        />
                    </CustomDialog>

                </div>
            ) : (
                <>
                    <ProductCardList products={products} productGroupId="" />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Mostrando {products.length} de {totalItems} productos
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">Filas por página</p>
                                <Select
                                    value={limit.toString()}
                                    onValueChange={(value) => {
                                        setLimit(Number(value));
                                        setPage(1); // Reset to first page on limit change
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={limit.toString()} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <CustomPagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                className="w-auto mx-0"
                            />

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
