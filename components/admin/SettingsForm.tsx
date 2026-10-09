"use client";

import { useActionState, useState, startTransition } from "react";
import type { Settings } from "@/lib/settings-config";
import ImageUpload from "@/components/admin/ImageUpload";
import { saveSettings } from "@/app/admin/(panel)/settings/actions";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children }: { label: React.ReactNode; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [state, formAction, pending] = useActionState(saveSettings, undefined);
  const e = state?.errors ?? {};
  const [metaTitle, setMetaTitle] = useState(initial.siteMetaTitle);
  const [metaDesc, setMetaDesc] = useState(initial.siteMetaDescription);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  const count = (n: number, max: number) => (
    <span className={`float-right text-xs font-normal ${n > max ? "text-amber-600" : "text-slate-400"}`}>{n}/{max}</span>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Branding" hint="Shown in the website header, the browser tab and when the site is shared.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Site name *" error={e.siteName}>
            <input name="siteName" defaultValue={initial.siteName} className={input} placeholder="Myyatra Circle" />
          </Field>
          <Field label="Tagline" error={e.tagline}>
            <input name="tagline" defaultValue={initial.tagline} className={input} placeholder="Journeys worth remembering" />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUpload name="logo" label="Logo" folder="general" defaultValue={initial.logo} serverError={e.logo} />
          <ImageUpload name="favicon" label="Favicon (browser tab icon)" folder="general" defaultValue={initial.favicon} serverError={e.favicon} />
        </div>
        <p className="text-xs text-slate-400">Tip: a transparent PNG logo and a square favicon (at least 64 × 64) look best. Use "From library" to pick a file you already uploaded.</p>
      </Card>

      <Card title="Contact details" hint="Used on the Contact Us page, the header and the footer.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone" error={e.phone}>
            <input name="phone" defaultValue={initial.phone} className={input} placeholder="+91 98765 43210" />
          </Field>
          <Field label="WhatsApp number" error={e.whatsapp} hint="Digits with country code, used for the chat button.">
            <input name="whatsapp" defaultValue={initial.whatsapp} className={input} placeholder="919876543210" />
          </Field>
          <Field label="Email" error={e.email}>
            <input name="email" defaultValue={initial.email} className={input} placeholder="hello@myyatracircle.com" />
          </Field>
          <Field label="Working hours" error={e.workingHours}>
            <input name="workingHours" defaultValue={initial.workingHours} className={input} placeholder="Mon to Sat, 10 AM to 7 PM" />
          </Field>
        </div>
        <Field label="Address" error={e.address}>
          <textarea name="address" rows={3} defaultValue={initial.address} className={input} />
        </Field>
        <Field label="Google Maps embed link" error={e.mapEmbedUrl}
          hint="Google Maps > Share > Embed a map > copy the HTML. You can paste all of it, we keep only the link.">
          <textarea name="mapEmbedUrl" rows={2} defaultValue={initial.mapEmbedUrl} className={input} />
        </Field>
      </Card>

      <Card title="Footer">
        <Field label="Footer about text" error={e.footerText} hint="A short line about the company, shown at the bottom of every page.">
          <textarea name="footerText" rows={3} defaultValue={initial.footerText} className={input} />
        </Field>
        <Field label="Copyright text" error={e.copyrightText} hint='Example: © {year} Myyatra Circle. All rights reserved. ({year} turns into the current year.)'>
          <input name="copyrightText" defaultValue={initial.copyrightText} className={input} />
        </Field>
      </Card>

      <Card title="Default SEO" hint="Used for any page that does not have its own meta title and description (for example the homepage).">
        <Field label={<>Meta title {count(metaTitle.length, 60)}</>} error={e.siteMetaTitle}>
          <input name="siteMetaTitle" value={metaTitle} onChange={(ev) => setMetaTitle(ev.target.value)} className={input} />
        </Field>
        <Field label={<>Meta description {count(metaDesc.length, 160)}</>} error={e.siteMetaDescription}>
          <textarea name="siteMetaDescription" rows={3} value={metaDesc} onChange={(ev) => setMetaDesc(ev.target.value)} className={input} />
        </Field>
      </Card>

      <Card title="Google Analytics" hint="Paste only the Measurement ID. Leave empty to turn tracking off.">
        <Field label="Measurement ID" error={e.gaId} hint="Find it in Google Analytics > Admin > Data streams. It looks like G-ABC123XYZ9.">
          <input name="gaId" defaultValue={initial.gaId} className={`${input} max-w-xs`} placeholder="G-XXXXXXXXXX" />
        </Field>
      </Card>

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
        <div className="text-sm">
          {state?.ok && <span className="text-emerald-700">{state.message}</span>}
          {state && !state.ok && (state.message ? <span className="text-red-700">{state.message}</span> : <span className="text-red-700">Please fix the highlighted fields.</span>)}
        </div>
        <button disabled={pending}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
