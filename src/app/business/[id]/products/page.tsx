"use client";

import { use } from "react";
import TabProducts from "../TabProducts";
import { useEditModeStore } from "@/store/editModeStore";
import CustomDialog from "@/components/customDialog";
import FormProduct, { ProductValues } from "@/components/formProduct";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";
import { PackagePlus } from "lucide-react";
import { CreateProductDto, useProductApi } from "@/lib/useProductApi";
import { handleApiError } from "@/utils/handleApiError";

export default function ProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isEditMode } = useEditModeStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const { business } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();
  const productApi = useProductApi();

  async function handleCreateProduct(data: ProductValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT);
      const productDto: CreateProductDto = {
        ...data,
        base_price: Number(data.base_price),
        description: data.description ?? "",
        group_product_id: data.menuId ?? "",
      };

      await productApi.createProduct([productDto], id);
      await getBusiness(id);
      toast.success("Producto creado exitosamente", { style: toastSuccessStyle });
      window.location.reload();
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT);
    }
  }

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
          <div className="flex justify-end">
            <CustomDialog
              modalTitle="Crear producto"
              modalDescription="Agrega un nuevo producto a tu inventario"
              trigger={
                <div className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  <PackagePlus className="h-4 w-4" />
                  Crear Producto
                </div>
              }
            >
              <FormProduct
                buttonTitle="Crear"
                loadingKey={LoadingsKeyEnum.CREATE_PRODUCT}
                handleSubmitButton={handleCreateProduct}
                menus={business?.product_group || []}
              />
            </CustomDialog>
          </div>
        )}
      </div>
      <TabProducts businessId={id} />
    </div>
  );
}
