import { toastErrorStyle } from "@/lib/toastStyles";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function handleApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || "Error en la petición";
    toast.error(message, { style: toastErrorStyle });
  } else {
    toast.error("Algo salió mal, intenta más tarde", {
      style: toastErrorStyle,
    });
  }
}
