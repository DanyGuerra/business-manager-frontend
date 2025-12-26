"use client";

import FormProductOptionGroup, {
  ProductOptionGroupValues,
} from "@/components/FormProductOptionGroup";
import CustomDialog from "@/components/customDialog";
import { toastSuccessStyle } from "@/lib/toastStyles";
import {
  CreateOptionGroupDto,
  OptionGroup,
  useOptionGroupApi,
} from "@/lib/useOptionGroupApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEditModeStore } from "@/store/editModeStore";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";
import { Layers } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import OptionGroupCard from "@/components/OptionGroupCard";
import { Skeleton } from "@/components/ui/skeleton";



import { DataTablePagination } from "@/components/DataTablePagination";
import { DataTableSearch } from "@/components/DataTableSearch";

export default function TabOptionGroups() {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");

  const optionGroupApi = useOptionGroupApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { businessId } = useBusinessStore();
  const { isEditMode } = useEditModeStore();


  const getOptionsGroups = useCallback(async (
    pageValue = page,
    limitValue = limit,
    searchValue = search
  ) => {
    try {
      setIsLoading(true);
      const { data } = await optionGroupApi.getByBusinessId(businessId, {
        page: pageValue,
        limit: limitValue,
        search: searchValue,
      });
      setOptionGroups(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, businessId]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateEmptyOpen, setIsCreateEmptyOpen] = useState(false);

  async function createOptionGroup(dataDto: ProductOptionGroupValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
      const dto: CreateOptionGroupDto = {
        ...dataDto,
        min_options: Number(dataDto.min_options),
        max_options: Number(dataDto.max_options),
      };
      await optionGroupApi.create(dto, businessId);
      await getOptionsGroups();
      toast.success("Grupo de opciones creado correctamente", {
        style: toastSuccessStyle,
      });
      setIsCreateOpen(false);
      setIsCreateEmptyOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION);
    }
  }


  useEffect(() => {
    getOptionsGroups();
  }, [getOptionsGroups]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    getOptionsGroups(1, limit, value);
  };

  return (
    <section className="flex flex-col items-center justify-center space-y-4">
      <div className="w-full">
        <DataTableSearch
          onSearch={handleSearch}
          placeholder="Buscar grupos de opciones..."
          initialValue={search}
        >
          {isEditMode && (
            <CustomDialog
              open={isCreateOpen}
              setOpen={setIsCreateOpen}
              modalTitle="Crear variante del producto"
              modalDescription="Crea un nuevo grupo de opciones para este producto"
            >
              <FormProductOptionGroup
                buttonTitle="Agregar"
                loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION}
                handleSubmitButton={createOptionGroup}
              />
            </CustomDialog>
          )}
        </DataTableSearch>
      </div>
      {isLoading ? (
        <div className="grid py-4 grid-cols-1 gap-4 sm:grid-cols-2 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="pt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : optionGroups.length > 0 ? (
        <>
          <div className="grid py-4 grid-cols-1 gap-4 sm:grid-cols-2 w-full">
            {optionGroups.map((og) => {
              return (
                <OptionGroupCard
                  key={og.id}
                  og={og}
                  onRefresh={() => getOptionsGroups()}
                />
              );
            })}
          </div>
          <div className="w-full">
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={setLimit}
              totalItems={total}
              currentCount={optionGroups.length}
              itemName="grupos de opciones"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed w-full mt-4">
          <div className="bg-background p-3 rounded-full shadow-sm mb-4">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No hay grupos de opciones</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            Crea grupos de opciones para personalizar tus productos.
          </p>

          <CustomDialog
            open={isCreateEmptyOpen}
            setOpen={setIsCreateEmptyOpen}
            modalTitle="Crear grupo de opciones"
            modalDescription="Crea un nuevo grupo de opciones para tus productos"
            textButtonTrigger="Crear grupo de opciones"
          >
            <FormProductOptionGroup
              buttonTitle="Agregar"
              loadingKey={LoadingsKeyEnum.CREATE_PRODUCT_GROUP_OPTION}
              handleSubmitButton={createOptionGroup}
            />
          </CustomDialog>

        </div >
      )
      }
    </section >
  );
}
