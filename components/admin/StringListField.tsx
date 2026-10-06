"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";

let uid = 0;
const nextId = () => ++uid;

// A list of single-line texts (highlights, inclusions, exclusions).
// Sends the whole list to the server as JSON in one hidden field.
export default function StringListField({ name, label, hint, placeholder, initial = [] }: {
  name: string; label: string; hint?: string; placeholder?: string; initial?: string[];
}) {
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : [""]).map((text) => ({ id: nextId(), text }))
  );
  const lastRef = useRef<HTMLInputElement>(null);

  const update = (id: number, text: string) => setRows((r) => r.map((x) => (x.id === id ? { ...x, text } : x)));
  const remove = (id: number) => setRows((r) => (r.length === 1 ? [{ id: nextId(), text: "" }] : r.filter((x) => x.id !== id)));
  const add = () => {
    setRows((r) => [...r, { id: nextId(), text: "" }]);
    setTimeout(() => lastRef.current?.focus(), 0);
  };
  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const n = [...r];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      <input type="hidden" name={name} value={JSON.stringify(rows.map((r) => r.text))} />

      <ul className="mt-2 space-y-2">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-1">
            <input
              ref={i === rows.length - 1 ? lastRef : undefined}
              value={r.text}
              onChange={(e) => update(r.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} // Enter = new row, not submit
              placeholder={placeholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
            <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={14} /></button>
            <button type="button" title="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={14} /></button>
            <button type="button" title="Remove" onClick={() => remove(r.id)}
              className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><X size={14} /></button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
        <Plus size={14} /> Add
      </button>
    </div>
  );
}
