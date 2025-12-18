'use client'

import { ProductGroup } from "@/lib/useBusinessApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEditModeStore } from "@/store/editModeStore";
import ProductGroupItem from "./ProductGroupItem";
import { useRouter } from "next/navigation";

type ProductGroupListProps = {
  productGroups: ProductGroup[];
};

export default function ProductGroupList({
  productGroups,
}: ProductGroupListProps) {
  const { businessId } = useBusinessStore();
  const { isEditMode } = useEditModeStore();
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 gap-5">
      {productGroups.map((group) => (
        <ProductGroupItem
          key={group.id}
          group={group}
          businessId={businessId}
          isEditMode={isEditMode}
          onRefresh={handleRefresh}
        />
      ))}
    </div>
  );
}
