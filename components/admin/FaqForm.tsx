"use client";

import Link from "next/link";
import { useActionState, startTransition } from "react";
import type { Faq } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import RichTextEditor from "@/components/admin/RichTextEditor";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

export default function FaqForm({ action, initial }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Faq;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
        <label className="block text-sm font-medium text-slate-700">
          Question *
          <input name="question" defaultValue={initial?.question} className={input}
            placeholder="What is the best time to visit Rajasthan?" />
          {e.question && <span className="mt-1 block text-xs font-normal text-red-600">{e.question}</span>}
        </label>

        <div>
          <RichTextEditor name="answer" label="Answer *" defaultValue={initial?.answer} compact />
          {e.answer && <p className="mt-1 text-xs text-red-600">{e.answer}</p>}
        </div>
      </div>

      <div className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={initial ? initial.isActive : true} className="h-4 w-4 accent-teal-700" />
          Active (visible on the website)
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Sort order
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} className={input} />
          <span className="mt-1 block text-xs font-normal text-slate-400">Lower number shows first.</span>
        </label>

        {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

        <div className="flex gap-3 pt-2">
          <button disabled={pending}
            className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          <Link href="/admin/faqs" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
