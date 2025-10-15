"use client";

import { Option } from "@/lib/useOptionGroupApi";

type OptionListProps = {
  options: Option[];
};

export default function OptionList({ options }: OptionListProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.length > 0 ? (
        options.map((opt) => (
          <span key={opt.id} className="px-2 py-1 border rounded text-sm">
            {opt.name} {opt.price > 0 && `+ $${opt.price}`}
          </span>
        ))
      ) : (
        <div className="w-full flex items-center justify-center text-xs text-gray-400 min-h-10">
          <span>No hay opciones</span>
        </div>
      )}
    </div>
  );
}
