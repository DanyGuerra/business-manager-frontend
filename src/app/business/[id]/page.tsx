"use client";

import * as React from "react";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadingStore } from "@/store/loadingStore";
import BusinessContent from "./BusinessContent";
import { useBusinessStore } from "@/store/businessStore";
import { useFetchBusiness } from "@/app/hooks/useBusiness";

export default function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const { loadings } = useLoadingStore();
  const { business } = useBusinessStore();
  const { getBusiness } = useFetchBusiness();

  useEffect(() => {
    getBusiness(id);
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
    content = <BusinessContent />;
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
