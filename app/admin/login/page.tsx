"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form action={action} className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-lg">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">myyatracircle.com control panel</p>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input name="email" type="email" required autoComplete="username"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input name="password" type="password" required autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </label>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

        <button disabled={pending}
          className="w-full rounded-lg bg-teal-700 py-2.5 font-medium text-white transition hover:bg-teal-800 disabled:opacity-60">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
