"use client";

import { Option } from "@/lib/useBusinessApi";

type OptionListProps = {
  options: Option[];
};

export default function OptionList({ options }: OptionListProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((opt) => (
        <span key={opt.id} className="px-2 py-1 border rounded text-sm">
          {opt.name} {opt.price > 0 && `+ $${opt.price}`}
        </span>
      ))}
    </div>
  );
}
