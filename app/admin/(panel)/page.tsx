import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Compass, MapPin, MessageCircle, Package, Sparkles } from "lucide-react";
import DashboardAnalytics from "@/components/admin/DashboardAnalytics";


export default async function Dashboard() {
  const now = new Date();
  const [
    destinations,
    packages,
    experiences,
    newInquiries,
    publishedDestinations,
    publishedPackages,
    publishedExperiences,
    newContactInquiries,
    newTourInquiries,
    newHolidayInquiries,
    openContactInquiries,
    openTourInquiries,
    openHolidayInquiries,
    draftBlogs,
    scheduledBlogs,
    recentContactInquiries,
    recentTourInquiries,
    recentHolidayInquiries,
    // --- Data Analytics Aggregation Queries ---
    contactInterests,
    holidayInterests,
    allTourInquiries,
    allContactInquiries,
    allHolidayInquiries,

  ] = await Promise.all([
    prisma.destination.count(),
    prisma.tourPackage.count(),
    prisma.experience.count(),
    prisma.tourInquiry.count({ where: { status: "NEW" } }),
    prisma.destination.count({ where: { status: "PUBLISHED" } }),
    prisma.tourPackage.count({ where: { status: "PUBLISHED" } }),
    prisma.experience.count({ where: { status: "PUBLISHED" } }),
    prisma.contactInquiry.count({ where: { status: "NEW" } }),
    prisma.tourInquiry.count({ where: { status: "NEW" } }),
    prisma.holidayInquiry.count({ where: { status: "NEW" } }),
    prisma.contactInquiry.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    prisma.tourInquiry.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    prisma.holidayInquiry.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    prisma.blog.count({ where: { status: "DRAFT" } }),
    prisma.blog.count({ where: { status: "PUBLISHED", publishedAt: { gt: now } } }),
    prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, destinationOfInterest: true, status: true, createdAt: true },
    }),
    prisma.tourInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { package: { select: { name: true } } },
    }),
    prisma.holidayInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, preferredDestination: true, status: true, createdAt: true },
    }),
    // Fetch analytics data
    prisma.contactInquiry.groupBy({
      by: ["destinationOfInterest"],
      _count: { destinationOfInterest: true },
      where: { destinationOfInterest: { not: null } },
      orderBy: { _count: { destinationOfInterest: "desc" } },
      take: 5,
    }),
    prisma.holidayInquiry.groupBy({
      by: ["preferredDestination"],
      _count: { preferredDestination: true },
      where: { preferredDestination: { not: null } },
      orderBy: { _count: { preferredDestination: "desc" } },
      take: 5,
    }),
    prisma.tourInquiry.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.contactInquiry.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.holidayInquiry.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const newInquiryCount = newContactInquiries + newTourInquiries + newHolidayInquiries;
  const openInquiryCount = openContactInquiries + openTourInquiries + openHolidayInquiries;

  //Analytics Computation
  const interestCounts: Record<string, number> = {};
  contactInterests.forEach((item) => {
    if (item.destinationOfInterest) {
      interestCounts[item.destinationOfInterest] = (interestCounts[item.destinationOfInterest] || 0) + item._count.destinationOfInterest;
    }
  });
  holidayInterests.forEach((item) => {
    if (item.preferredDestination) {
      interestCounts[item.preferredDestination] = (interestCounts[item.preferredDestination] || 0) + item._count.preferredDestination;
    }
  });

  const topInterests = Object.entries(interestCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const statusTotals = { NEW: 0, IN_PROGRESS: 0, CLOSED: 0 };
  [...allTourInquiries, ...allContactInquiries, ...allHolidayInquiries].forEach((st) => {
    if (st.status in statusTotals) {
      statusTotals[st.status as keyof typeof statusTotals] += st._count.status;
    }
  });

  const grandTotalInquiries = statusTotals.NEW + statusTotals.IN_PROGRESS + statusTotals.CLOSED;
  const conversionRate = grandTotalInquiries ? Math.round((statusTotals.CLOSED / grandTotalInquiries) * 100) : 0;

  const statusBreakdown = [
    { status: "NEW", count: statusTotals.NEW },
    { status: "IN_PROGRESS", count: statusTotals.IN_PROGRESS },
    { status: "CLOSED", count: statusTotals.CLOSED },
  ];

  const recentInquiries = [
    ...recentContactInquiries.map((inquiry) => ({
      ...inquiry,
      type: "contact",
      interest: inquiry.destinationOfInterest || "General inquiry",
    })),
    ...recentTourInquiries.map((inquiry) => ({
      id: inquiry.id,
      name: inquiry.name,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
      type: "tour",
      interest: inquiry.package?.name || "Tour package inquiry",
    })),
    ...recentHolidayInquiries.map((inquiry) => ({
      ...inquiry,
      type: "holiday",
      interest: inquiry.preferredDestination || "Destination not specified",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);
  const overviewCards = [
    {
      label: "New inquiries",
      value: newInquiryCount,
      detail: `${newInquiries} new tour ${newInquiries === 1 ? "inquiry" : "inquiries"}`,
      href: "/admin/inquiries",
      icon: MessageCircle,
      color: "bg-sky-50 text-sky-700",
    },
    {
      label: "Needs follow-up",
      value: openInquiryCount,
      detail: "New or in progress",
      href: "/admin/inquiries",
      icon: ArrowRight,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Destinations",
      value: publishedDestinations,
      detail: `${destinations} total`,
      href: "/admin/destinations",
      icon: MapPin,
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: "Tour packages",
      value: publishedPackages,
      detail: `${packages} total`,
      href: "/admin/packages",
      icon: Package,
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Experiences",
      value: publishedExperiences,
      detail: `${experiences} total`,
      href: "/admin/experiences",
      icon: Compass,
      color: "bg-orange-50 text-orange-700",
    },
  ];
  const fmtDate = (date: Date) =>
    date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-1 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Your travel business</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">A quick look at what is happening and what needs attention.</p>
        </div>
        <p className="text-sm text-slate-500">{fmtDate(now)}</p>
      </header>

      <section aria-label="Business overview">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Business overview</h2>
          <span className="text-xs text-slate-500">Published content and active inquiries</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {overviewCards.map(({ label, value, detail, href, icon: Icon, color }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                  <Icon size={18} />
                </span>
                <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="User Analytics & Insights">
        <DashboardAnalytics
          topInterests={topInterests}
          statusBreakdown={statusBreakdown}
          totalInquiries={grandTotalInquiries}
          conversionRate={conversionRate}
        />
      </section>
      
      <section aria-label="Blog publishing status">
        <Link
          href="/admin/blogs"
          className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-700">
              <BookOpen size={19} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Blog publishing</h2>
              <p className="text-xs text-slate-500">Content waiting in your pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-5 sm:gap-8">
            <div>
              <p className="text-xs text-slate-500">Drafts</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">{draftBlogs}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-slate-500"><CalendarClock size={13} /> Scheduled</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">{scheduledBlogs}</p>
            </div>
            <ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
          </div>
        </Link>
      </section>

      <section aria-label="Recent inquiries">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent inquiries</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {openInquiryCount} {openInquiryCount === 1 ? "inquiry needs" : "inquiries need"} a follow-up
            </p>
          </div>
          <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Trip interest</th>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInquiries.map((inquiry) => (
                <tr key={`${inquiry.type}-${inquiry.id}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{inquiry.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-600">{inquiry.interest}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDate(inquiry.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      inquiry.status === "NEW"
                        ? "bg-sky-50 text-sky-700"
                        : inquiry.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}>
                      {inquiry.status === "NEW" ? "New" : inquiry.status === "IN_PROGRESS" ? "In progress" : "Closed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/inquiries/${inquiry.type}/${inquiry.id}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                    >
                      Open <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
              {recentInquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    <Sparkles size={20} className="mx-auto mb-2 text-slate-300" />
                    No inquiries yet. New customer requests will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
