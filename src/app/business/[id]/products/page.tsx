"use client";

import { use, useState, useCallback, useEffect } from "react";
import TabProducts from "../TabProducts";
import { useEditModeStore } from "@/store/editModeStore";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { PackagePlus } from "lucide-react";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import { ProductGroup } from "@/lib/useBusinessApi";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { handleApiError } from "@/utils/handleApiError";
import { Button } from "@/components/ui/button";

export default function ProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isEditMode } = useEditModeStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const { getProductGroupsByBusinessId } = useProductGroupApi();
  const productApi = useProductApi();

  const [menus, setMenus] = useState<ProductGroup[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [open, setOpen] = useState<boolean>(false);

  const fetchMenus = useCallback(async (search?: string) => {
    try {
      const { data } = await getProductGroupsByBusinessId(id, { page: 1, limit: 10, search });
      setMenus(Array.isArray(data) ? (data as unknown as ProductGroup[]) : data.data);
    } catch (error) {
      handleApiError(error);
    }
  }, [id, getProductGroupsByBusinessId]);

  const handleCreateProduct = async (data: ProductValues) => {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT);
      const productDto: CreateProductDto = {
        ...data,
        base_price: Number(data.base_price),
        description: data.description ?? "",
        group_product_id: data.menuId ?? "",
      };

      await productApi.createProduct([productDto], id);
      setRefreshTrigger(prev => prev + 1);
      toast.success("Producto creado exitosamente", { style: toastSuccessStyle });
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(false);
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between sm:flex-row sm:items-center flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">
            Administra todos los productos de tu negocio.
          </p>
        </div>
        {isEditMode && (
          <CustomDialog
            open={open}
            setOpen={setOpen}
            modalTitle="Crear producto"
            modalDescription="Agrega un nuevo producto a tu inventario"
            trigger={
              <Button className="shrink-0 gap-2 w-full sm:w-auto">
                <PackagePlus className="h-4 w-4" />
                Crear Producto
              </Button>
            }
          >
            <FormProduct
              buttonTitle="Crear"
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
              handleSubmitButton={handleCreateProduct}
              menus={menus}
              onSearchMenus={fetchMenus}
            />
          </CustomDialog>
        )}
      </div>
      <TabProducts businessId={id} refreshTrigger={refreshTrigger} />
    </div>
  );
}
