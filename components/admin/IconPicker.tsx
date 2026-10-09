"use client";

import { useState } from "react";
import { WHY_ICONS } from "@/lib/why-icons";

export default function IconPicker({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? WHY_ICONS[0].key);

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">Icon</legend>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {WHY_ICONS.map(({ key, label, Icon }) => (
          <label key={key} title={label} className="cursor-pointer">
            <input type="radio" name={name} value={key} checked={value === key}
              onChange={() => setValue(key)} className="peer sr-only" />
            <span className="flex h-12 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 peer-checked:border-teal-600 peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-300">
              <Icon size={22} />
            </span>
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Selected: {WHY_ICONS.find((i) => i.key === value)?.label}
      </p>
    </fieldset>
  );
}
