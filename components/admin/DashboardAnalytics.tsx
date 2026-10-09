// components/admin/DashboardAnalytics.tsx

type TopInterest = { label: string; count: number };
type StatusDistribution = { status: string; count: number };

interface DashboardAnalyticsProps {
  topInterests: TopInterest[];
  statusBreakdown: StatusDistribution[];
  totalInquiries: number;
  conversionRate: number;
}

export default function DashboardAnalytics({
  topInterests,
  statusBreakdown,
  totalInquiries,
  conversionRate,
}: DashboardAnalyticsProps) {
  const maxInterest = Math.max(...topInterests.map((item) => item.count), 1);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* 1. Demand Analysis: Most Inquired Destinations / Packages */}
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">User Demand & Top Interests</h2>
            <p className="text-xs text-slate-500">Most requested destinations & tour packages</p>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
            {totalInquiries} Total Inquiries
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {topInterests.map((item, idx) => {
            const pct = Math.round((item.count / maxInterest) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="truncate max-w-[240px] text-slate-800">{item.label}</span>
                  <span className="text-slate-500">{item.count} inquiries ({Math.round((item.count / (totalInquiries || 1)) * 100)}%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {topInterests.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">No inquiry data available to aggregate yet.</p>
          )}
        </div>
      </div>

      {/* 2. Lead Pipeline & Status Resolution */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Lead Health & Resolution</h2>
          <p className="text-xs text-slate-500">Inquiry processing efficiency</p>

          <div className="mt-5 space-y-4">
            {statusBreakdown.map((st) => {
              const pct = totalInquiries ? Math.round((st.count / totalInquiries) * 100) : 0;
              const color =
                st.status === "NEW"
                  ? "bg-sky-500"
                  : st.status === "IN_PROGRESS"
                  ? "bg-amber-500"
                  : "bg-emerald-500";

              return (
                <div key={st.status} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{st.status.replace("_", " ")}</span>
                    <span className="text-slate-500">{st.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funnel Efficiency Score */}
        <div className="mt-6 rounded-lg bg-slate-50 p-3.5 border border-slate-100">
          <p className="text-xs font-medium text-slate-500">Inquiry Resolution Rate</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900">{conversionRate}%</span>
            <span className="text-xs text-slate-500">closed / addressed</span>
          </div>
        </div>
      </div>
    </div>
  );
}