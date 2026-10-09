"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { SOCIAL_PLATFORMS, type SocialState } from "@/lib/settings-config";

// One editable line: [platform] [link] [Save]. The same component adds a new link (isNew).
export default function SocialLinkRow({ action, link, isNew = false }: {
  action: (prev: SocialState, fd: FormData) => Promise<SocialState>;
  link?: { platform: string; url: string };
  isNew?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [platform, setPlatform] = useState(link?.platform ?? SOCIAL_PLATFORMS[0].key);
  const ref = useRef<HTMLFormElement>(null);

  // after a successful "Add", clear the line so the next link can be typed
  useEffect(() => {
    if (state?.ok && isNew) ref.current?.reset();
  }, [state, isNew]);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <div className="min-w-0 flex-1">
      <form ref={ref} onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <select name="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}
          className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600">
          {SOCIAL_PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <input name="url" defaultValue={link?.url ?? ""} placeholder={`https://www.${platform}.com/yourpage`}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        <button disabled={pending}
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending ? "Saving…" : isNew ? "Add" : "Save"}
        </button>
      </form>
      {state && !state.ok && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      {state?.ok && !isNew && <p className="mt-1 text-xs text-emerald-600">Saved</p>}
    </div>
  );
}
