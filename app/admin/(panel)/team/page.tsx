import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { iconByKey } from "@/lib/why-icons";
import DeleteButton from "@/components/admin/DeleteButton";
import MoveButtons from "@/components/admin/MoveButtons";
import ToggleForm from "@/components/admin/ToggleForm";
import { deleteMember, deleteWhy, moveMember, moveWhy, toggleMember, toggleWhy } from "./actions";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const active = tab === "why" ? "why" : "team";

  const [members, items] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.whyUsItem.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
  ]);

  const tabs = [
    { key: "team", label: "Team members", count: members.length, href: "/admin/team" },
    { key: "why", label: "Why choose us", count: items.length, href: "/admin/team?tab=why" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Team & Why Us</h1>
          <p className="text-sm text-slate-500">Content for the About Us page and the homepage.</p>
        </div>
        <Link href={active === "team" ? "/admin/team/members/new" : "/admin/team/why-us/new"}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          <Plus size={16} /> {active === "team" ? "Add team member" : "Add reason"}
        </Link>
      </div>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              t.key === active ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t.label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t.count}</span>
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {active === "team" ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Bio</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m, i) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.designation || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-3 text-slate-600"><p className="line-clamp-2">{m.bio || "-"}</p></td>
                  <td className="px-4 py-3">
                    <ToggleForm action={toggleMember.bind(null, m.id)} on={m.isActive} onLabel="Active" offLabel="Hidden" title="Click to change" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <MoveButtons up={moveMember.bind(null, m.id, -1)} down={moveMember.bind(null, m.id, 1)}
                        disableUp={i === 0} disableDown={i === members.length - 1} />
                      <Link href={`/admin/team/members/${m.id}`}
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                        <Pencil size={16} />
                      </Link>
                      <DeleteButton action={deleteMember.bind(null, m.id)} message={`Remove ${m.name} from the team?`} />
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && <Empty cols={4} text='No team members yet. Click "Add team member".' />}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((w, i) => {
                const Icon = iconByKey(w.icon);
                return (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                          {Icon ? <Icon size={20} /> : null}
                        </div>
                        <p className="font-medium text-slate-900">{w.title}</p>
                      </div>
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-600"><p className="line-clamp-2">{w.description || "-"}</p></td>
                    <td className="px-4 py-3">
                      <ToggleForm action={toggleWhy.bind(null, w.id)} on={w.isActive} onLabel="Active" offLabel="Hidden" title="Click to change" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <MoveButtons up={moveWhy.bind(null, w.id, -1)} down={moveWhy.bind(null, w.id, 1)}
                          disableUp={i === 0} disableDown={i === items.length - 1} />
                        <Link href={`/admin/team/why-us/${w.id}`}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Edit">
                          <Pencil size={16} />
                        </Link>
                        <DeleteButton action={deleteWhy.bind(null, w.id)} message={`Delete "${w.title}"?`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && <Empty cols={4} text='No reasons yet. Click "Add reason".' />}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Empty({ cols, text }: { cols: number; text: string }) {
  return <tr><td colSpan={cols} className="px-4 py-12 text-center text-slate-400">{text}</td></tr>;
}
