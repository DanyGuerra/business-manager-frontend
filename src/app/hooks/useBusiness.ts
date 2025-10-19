import { useBusinessApi } from "@/lib/useBusinessApi";
import { useBusinessStore } from "@/store/businessStore";
import { useLoadingStore } from "@/store/loadingStore";
import { handleApiError } from "@/utils/handleApiError";

export function useFetchBusiness() {
  const { setBusiness } = useBusinessStore();
  const apiBusiness = useBusinessApi();
  const { startLoading, stopLoading } = useLoadingStore();

  async function getBusiness(id: string) {
    try {
      startLoading("getBusiness");
      const { data } = await apiBusiness.getBusinessProducts(id);

      setBusiness(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading("getBusiness");
    }
  }

  return { getBusiness };
}
