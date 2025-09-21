"use client";

import { OptionGroup } from "@/lib/useBusinessApi";
import OptionList from "./OptionList";

type OptionGroupListProps = {
  optionGroups: OptionGroup[];
};

export default function OptionGroupList({
  optionGroups,
}: OptionGroupListProps) {
  return (
    <>
      {optionGroups.length > 0 && (
        <div className="mt-2 space-y-1">
          {optionGroups.map((og) => (
            <div key={og.id}>
              <p className="font-semibold">{og.name}</p>
              <OptionList options={og.options} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
