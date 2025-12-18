'use client'

import { useState, useEffect } from "react";
import FormProductGroup, {
  ProductGroupValues,
} from "@/components/FormProductGroup";
import CustomDialog from "@/components/customDialog";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useProductGroupApi } from "@/lib/useProductGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { toast } from "sonner";
import ProductGroupList from "./ProductGroupList";
import { useEditModeStore } from "@/store/editModeStore";
import { BookOpen } from "lucide-react";
import { DataTableSearch } from "@/components/DataTableSearch";
import { DataTablePagination } from "@/components/DataTablePagination";
import { ProductGroup } from "@/lib/useBusinessApi";
import ProductGroupSkeleton from "@/components/ProductGroupSkeleton";

export default function TabMenu() {
  const productGroupApi = useProductGroupApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const { isEditMode } = useEditModeStore()

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [allGroups, setProductGroups] = useState<ProductGroup[]>([]);

  const handleCreateProduct = async (data: ProductGroupValues) => {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP);
      await productGroupApi.createProductGroup(
        { ...data, description: data.description ?? "" },
        businessId
      );
      toast.success("Menú creado exitosamente", { style: toastSuccessStyle });
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP);
    }
  };

  useEffect(() => {
    const fetchProductGroups = async () => {
      if (!businessId) return;
      try {
        setLoading(true);
        const { data } = await productGroupApi.getProductGroupsByBusinessId(businessId);
        setProductGroups(data);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductGroups();
  }, [businessId, productGroupApi]);

  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalItems = filteredGroups.length;
  const totalPages = Math.ceil(totalItems / limit);

  const paginatedGroups = filteredGroups.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [search, limit]);

  return (
    <div className="flex flex-col gap-5">
      <DataTableSearch
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Buscar menús..."
        initialValue={search}
      >
        {isEditMode && (
          <CustomDialog
            modalTitle="Crear menú"
            modalDescription="Crea un menú de productos para tu negocio"
          >
            <FormProductGroup
              buttonTitle="Crear"
              handleSubmitButton={handleCreateProduct}
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP}
            />
          </CustomDialog>
        )}
      </DataTableSearch>

      {loading ? (
        <div className="flex flex-col gap-5">
          {[1, 2].map((i) => (
            <ProductGroupSkeleton key={i} />
          ))}
        </div>
      ) : paginatedGroups.length > 0 ? (
        <>
          <ProductGroupList
            productGroups={paginatedGroups}
          />

          <DataTablePagination
            currentPage={page}
            totalPages={totalPages || 1}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
            totalItems={totalItems}
            currentCount={paginatedGroups.length}
            itemName="menús"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
          <div className="bg-background p-3 rounded-full shadow-sm mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{search ? "No se encontraron menús" : "No hay menús disponibles"}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            {search ? "Prueba ajustando los filtros o tu búsqueda." : "Comienza creando un menú para organizar tus productos."}
          </p>

          {!search && isEditMode && (
            <CustomDialog
              modalTitle="Crear menú"
              modalDescription="Crea un menú de productos para tu negocio"
              textButtonTrigger="Crear primer menú"
            >
              <FormProductGroup
                buttonTitle="Crear"
                handleSubmitButton={handleCreateProduct}
                loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP}
              />
            </CustomDialog>
          )}
        </div>
      )}
    </div>
  );
}
