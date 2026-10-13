"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, MessageCircle, MessageSquareQuote } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  href: string;
  kind: "inquiry" | "testimonial";
};

export default function DashboardNotifications({
  count,
  notifications,
}: {
  count: number;
  notifications: Notification[];
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 30_000);
    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <section aria-label="New submissions" className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700">
            <Bell size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">New submissions</h2>
            <p className="text-sm text-slate-600">
              {count === 0
                ? "You’re all caught up."
                : `${count} ${count === 1 ? "submission needs" : "submissions need"} your attention`}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500">Updates automatically every 30 seconds</p>
      </div>

      {notifications.length > 0 && (
        <ul className="mt-4 divide-y divide-teal-100 rounded-lg border border-teal-100 bg-white">
          {notifications.map((notification) => {
            const Icon = notification.kind === "testimonial" ? MessageSquareQuote : MessageCircle;

            return (
              <li key={notification.id}>
                <Link
                  href={notification.href}
                  className="group flex items-center gap-3 px-3 py-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 sm:px-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-teal-700">
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{notification.title}</span>
                    <span className="block truncate text-xs text-slate-500">{notification.detail}</span>
                  </span>
                  <time
                    dateTime={notification.createdAt}
                    className="hidden shrink-0 text-xs text-slate-500 sm:block"
                  >
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
                      new Date(notification.createdAt)
                    )}
                  </time>
                  <ArrowRight size={15} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
