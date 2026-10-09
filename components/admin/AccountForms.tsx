"use client";

import { useActionState, useEffect, useRef, useState, useTransition, startTransition } from "react";
import { Check, Eye, EyeOff, LogOut } from "lucide-react";
import type { AccountState } from "@/lib/account-types";
import { changePassword, signOutEverywhere, updateProfile } from "@/app/admin/(panel)/settings/account-actions";

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

// ---------- profile ----------
export function ProfileForm({ name, email, lastLogin }: { name: string; email: string; lastLogin: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <Card title="Profile" hint={`Last sign-in: ${lastLogin}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input name="name" defaultValue={name} className={input} />
          {state?.errors?.name && <span className="mt-1 block text-xs font-normal text-red-600">{state.errors.name}</span>}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email (used to sign in)
          <input value={email} readOnly className={`${input} cursor-not-allowed bg-slate-50 text-slate-500`} />
        </label>
        {state?.ok && <p className="text-sm text-emerald-700">{state.message}</p>}
        <button disabled={pending}
          className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {pending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </Card>
  );
}

// ---------- password ----------
const LEVELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500"];

function strength(pw: string) {
  if (pw.length < 8) return 0;
  let s = 1;
  if (pw.length >= 14) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-700" : "text-slate-400"}`}>
      <Check size={13} className={ok ? "opacity-100" : "opacity-30"} /> {children}
    </li>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const e = state?.errors ?? {};
  const level = strength(next);

  // after a successful change, empty the three boxes
  useEffect(() => {
    if (state?.ok) { setCurrent(""); setNext(""); setConfirm(""); }
  }, [state]);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => formAction(fd));
  }

  const type = show ? "text" : "password";
  return (
    <Card title="Change password" hint="You stay signed in here. Other devices are signed out.">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Current password
          <input name="current" type={type} value={current} onChange={(ev) => setCurrent(ev.target.value)}
            autoComplete="current-password" className={input} />
          {e.current && <span className="mt-1 block text-xs font-normal text-red-600">{e.current}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-700">
          New password
          <input name="next" type={type} value={next} onChange={(ev) => setNext(ev.target.value)}
            autoComplete="new-password" className={input} />
          {e.next && <span className="mt-1 block text-xs font-normal text-red-600">{e.next}</span>}
        </label>

        {next && (
          <div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= level ? COLORS[level] : "bg-slate-200"}`} />)}
            </div>
            <p className="mt-1 text-xs text-slate-500">Strength: {LEVELS[level]}</p>
          </div>
        )}

        <label className="block text-sm font-medium text-slate-700">
          Confirm new password
          <input name="confirm" type={type} value={confirm} onChange={(ev) => setConfirm(ev.target.value)}
            autoComplete="new-password" className={input} />
          {e.confirm && <span className="mt-1 block text-xs font-normal text-red-600">{e.confirm}</span>}
        </label>

        <ul className="space-y-1">
          <Rule ok={next.length >= 8}>At least 8 characters</Rule>
          <Rule ok={/[A-Za-z]/.test(next) && /\d/.test(next)}>A letter and a number</Rule>
          <Rule ok={!!next && next !== current}>Different from the current password</Rule>
          <Rule ok={!!confirm && confirm === next}>Both new passwords match</Rule>
        </ul>

        <button type="button" onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800">
          {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? "Hide" : "Show"} passwords
        </button>

        {state?.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>}
        <div>
          <button disabled={pending}
            className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {pending ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>
    </Card>
  );
}

// ---------- sign out everywhere ----------
export function SignOutEverywhere() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <Card title="Sessions" hint="Lost a laptop or used a shared computer? Sign out every other device.">
      <button type="button" disabled={pending}
        onClick={() => {
          if (!confirm("Sign out all other devices? You will stay signed in here.")) return;
          start(async () => {
            const r = await signOutEverywhere();
            setMsg(r?.message ?? "");
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setMsg(""), 4000);
          });
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60">
        <LogOut size={15} /> {pending ? "Working…" : "Sign out of all other devices"}
      </button>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
    </Card>
  );
}
