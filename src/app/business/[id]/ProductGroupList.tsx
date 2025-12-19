'use client'

import { ProductGroup } from "@/lib/useBusinessApi";
import { useBusinessStore } from "@/store/businessStore";
import { useEditModeStore } from "@/store/editModeStore";
import ProductGroupItem from "./ProductGroupItem";

type ProductGroupListProps = {
  productGroups: ProductGroup[];
  onRefresh: () => void;
};

export default function ProductGroupList({
  productGroups,
  onRefresh,
}: ProductGroupListProps) {
  const { businessId } = useBusinessStore();
  const { isEditMode } = useEditModeStore();

  return (
    <div className="grid grid-cols-1 gap-5">
      {productGroups.map((group) => (
        <ProductGroupItem
          key={group.id}
          group={group}
          businessId={businessId}
          isEditMode={isEditMode}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
