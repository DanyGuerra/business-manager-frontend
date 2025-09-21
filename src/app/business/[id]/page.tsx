"use client";

import * as React from "react";
import { BusinessFull, useBusinessApi } from "@/lib/useBusinessApi";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toastErrorStyle } from "@/lib/toastStyles";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadingStore } from "@/store/loadingStore";
import BusinessContent from "./BusinessContent";

export default function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const apiBusiness = useBusinessApi();
  const [business, setBusiness] = useState<BusinessFull>();
  const { startLoading, stopLoading, loadings } = useLoadingStore();

  async function getBusiness() {
    try {
      startLoading("getBusiness");
      const { data } = await apiBusiness.getBusinessProducts(id);

      setBusiness(data);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.message, { style: toastErrorStyle });
      }
    } finally {
      stopLoading("getBusiness");
    }
  }

  useEffect(() => {
    getBusiness();
  }, [id]);

  let content;

  if (loadings["getBusiness"]) {
    content = (
      <div className="flex gap-2">
        <Skeleton className="h-[40px] w-[30%] rounded-full" />
        <Skeleton className="h-[40px] w-[40px] rounded-lg" />
      </div>
    );
  } else if (business) {
    content = <BusinessContent business={business} getBusiness={getBusiness} />;
  } else {
    content = (
      <div className="flex items-center justify-center w-full h-100">
        <h1 className="text-center text-muted-foreground scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">
          No data
        </h1>
      </div>
    );
  }

  return <>{content}</>;
}
