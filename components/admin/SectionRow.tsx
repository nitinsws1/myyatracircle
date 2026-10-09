"use client";

import { useActionState, startTransition } from "react";
import type { RowState } from "@/lib/content-config";

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

// Heading and subheading of one homepage section, saved with its own button
export default function SectionRow({ action, title, subtitle }: {
  action: (prev: RowState, fd: FormData) => Promise<RowState>;
  title: string;
  subtitle: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="title" defaultValue={title} placeholder="Section heading" className={input} />
        <input name="subtitle" defaultValue={subtitle} placeholder="Short line under the heading (optional)" className={input} />
      </div>
      <div className="flex items-center gap-3">
        <button disabled={pending}
          className="rounded-lg bg-teal-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending ? "Saving…" : "Save text"}
        </button>
        {state?.ok && <span className="text-xs text-emerald-600">Saved</span>}
        {state && !state.ok && <span className="text-xs text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
