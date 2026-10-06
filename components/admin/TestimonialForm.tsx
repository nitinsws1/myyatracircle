"use client";

import Link from "next/link";
import { useActionState, startTransition } from "react";
import type { Testimonial } from "@/app/generated/prisma/client";
import type { FormState } from "@/lib/form-state";
import ImageUpload from "@/components/admin/ImageUpload";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

export default function TestimonialForm({ action, initial }: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Testimonial;
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Traveler name *" error={e.travelerName}>
            <input name="travelerName" defaultValue={initial?.travelerName} className={input} placeholder="Rahul Sharma" />
          </Field>
          <Field label="Location" hint="Where the traveler is from.">
            <input name="location" defaultValue={initial?.location ?? ""} className={input} placeholder="Mumbai, India" />
          </Field>
        </div>
        <Field label="Feedback *" error={e.feedback} hint="What the traveler said, 10 to 1500 characters.">
          <textarea name="feedback" rows={7} defaultValue={initial?.feedback} className={input} />
        </Field>
        <ImageUpload name="imageUrl" label="Traveler photo (optional)" folder="general"
          defaultValue={initial?.imageUrl} serverError={e.imageUrl} />
      </div>

      <div className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" name="isApproved" defaultChecked={initial?.isApproved} className="h-4 w-4 accent-teal-700" />
          Approved (visible on the website)
        </label>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} className="h-4 w-4 accent-teal-700" />
            Show on homepage (featured)
          </label>
          {e.isFeatured && <p className="mt-1 text-xs text-red-600">{e.isFeatured}</p>}
        </div>
        <Field label="Sort order" hint="Lower number shows first.">
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} className={input} />
        </Field>

        {state?.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}

        <div className="flex gap-3 pt-2">
          <button disabled={pending}
            className="flex-1 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          <Link href="/admin/testimonials" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
