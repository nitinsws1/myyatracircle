import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import { fmtDateTime } from "@/lib/inquiry-config";
import { getSettings } from "@/lib/settings";
import DeleteButton from "@/components/admin/DeleteButton";
import MoveButtons from "@/components/admin/MoveButtons";
import { PasswordForm, ProfileForm, SignOutEverywhere } from "@/components/admin/AccountForms";
import SettingsForm from "@/components/admin/SettingsForm";
import SocialLinkRow from "@/components/admin/SocialLinkRow";
import ToggleForm from "@/components/admin/ToggleForm";
import { createSocial, deleteSocial, moveSocial, toggleSocial, updateSocial } from "./actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const active = tab === "social" ? "social" : tab === "account" ? "account" : "general";

  const [admin, settings, links] = await Promise.all([
    getAdmin(),
    getSettings(),
    prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
  ]);

  const tabs = [
    { key: "general", label: "General", href: "/admin/settings" },
    { key: "social", label: "Social links", href: "/admin/settings?tab=social", count: links.length },
    { key: "account", label: "Account", href: "/admin/settings?tab=account" },
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Details that appear across the whole website.</p>
      </div>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              t.key === active ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
            {t.count !== undefined && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t.count}</span>}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {active === "account" ? (
          admin && (
            <div className="max-w-2xl space-y-6">
              <ProfileForm name={admin.name} email={admin.email}
                lastLogin={admin.lastLoginAt ? fmtDateTime(admin.lastLoginAt) : "first sign-in"} />
              <PasswordForm />
              <SignOutEverywhere />
            </div>
          )
        ) : active === "general" ? (
          <SettingsForm initial={settings} />
        ) : (
          <div className="max-w-4xl space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Your links</h2>
              <p className="mt-0.5 text-sm text-slate-500">Shown as icons in the footer. Use the arrows to set the order.</p>

              <ul className="mt-4 space-y-3">
                {links.map((l, i) => (
                  <li key={l.id} className="flex flex-wrap items-start gap-2">
                    <SocialLinkRow action={updateSocial.bind(null, l.id)} link={{ platform: l.platform, url: l.url }} />
                    <div className="flex items-center gap-1">
                      <MoveButtons up={moveSocial.bind(null, l.id, -1)} down={moveSocial.bind(null, l.id, 1)}
                        disableUp={i === 0} disableDown={i === links.length - 1} />
                      <ToggleForm action={toggleSocial.bind(null, l.id)} on={l.isActive} onLabel="Active" offLabel="Hidden" title="Click to change" />
                      <DeleteButton action={deleteSocial.bind(null, l.id)} message="Delete this link?" />
                    </div>
                  </li>
                ))}
                {links.length === 0 && <li className="py-4 text-sm text-slate-400">No links yet. Add the first one below.</li>}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Add a link</h2>
              <div className="mt-4"><SocialLinkRow isNew action={createSocial} /></div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
