"use client";

import Link from "next/link";
import { useActionState, startTransition } from "react";
import type { BlogCategory } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

export default function CategoryForm({ action, initial }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: BlogCategory;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const e = state?.errors ?? {};

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium text-slate-700">
        Name *
        <input name="name" defaultValue={initial?.name} className={input} placeholder="Travel Tips" />
        {e.name && <span className="mt-1 block text-xs font-normal text-red-600">{e.name}</span>}
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Slug
        <input name="slug" defaultValue={initial?.slug} className={input} />
        {e.slug ? (
          <span className="mt-1 block text-xs font-normal text-red-600">{e.slug}</span>
        ) : (
          <span className="mt-1 block text-xs font-normal text-slate-400">Leave empty to create it from the name.</span>
        )}
      </label>

      {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

      <div className="flex gap-3">
        <button disabled={pending}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
        <Link href="/admin/blogs/categories" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}
