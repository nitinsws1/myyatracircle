"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

let uid = 0;
const nextId = () => ++uid;

export type ItineraryItem = { title: string; description: string };

// Day numbers are not typed by hand: Day 1, Day 2... always follow the order on screen.
export default function ItineraryField({ name, initial = [] }: { name: string; initial?: ItineraryItem[] }) {
  const [days, setDays] = useState(() =>
    (initial.length ? initial : [{ title: "", description: "" }]).map((d) => ({ id: nextId(), ...d }))
  );

  const patch = (id: number, p: Partial<ItineraryItem>) =>
    setDays((all) => all.map((d) => (d.id === id ? { ...d, ...p } : d)));
  const add = () => setDays((all) => [...all, { id: nextId(), title: "", description: "" }]);
  const remove = (id: number) =>
    setDays((all) => (all.length === 1 ? [{ id: nextId(), title: "", description: "" }] : all.filter((d) => d.id !== id)));
  const move = (i: number, dir: -1 | 1) =>
    setDays((all) => {
      const j = i + dir;
      if (j < 0 || j >= all.length) return all;
      const n = [...all];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div>
      <input type="hidden" name={name}
        value={JSON.stringify(days.map(({ title, description }) => ({ title, description })))} />

      <div className="space-y-4">
        {days.map((d, i) => (
          <div key={d.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-medium text-white">Day {i + 1}</span>
              <div className="flex">
                <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={14} /></button>
                <button type="button" title="Move down" disabled={i === days.length - 1} onClick={() => move(i, 1)}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={14} /></button>
                <button type="button" title="Remove day" onClick={() => remove(d.id)}
                  className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>

            <input value={d.title} onChange={(e) => patch(d.id, { title: e.target.value })}
              placeholder="Day title, e.g. Arrival in Jaipur & city tour"
              className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />

            <RichTextEditor compact defaultValue={d.description} onChange={(html) => patch(d.id, { description: html })} />
          </div>
        ))}
      </div>

      <button type="button" onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
        <Plus size={14} /> Add day
      </button>
    </div>
  );
}
