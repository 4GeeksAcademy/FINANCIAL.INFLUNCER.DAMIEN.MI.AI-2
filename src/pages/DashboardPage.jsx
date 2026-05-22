import { useMemo, useState } from "react";
import KPICard from "../components/KPICard";
import PlatformCard from "../components/PlatformCard";
import ProductCard from "../components/ProductCard";
import SectionWrapper from "../components/SectionWrapper";
import SimpleBarIndicator from "../components/SimpleBarIndicator";
import { campaigns, platforms, products, platformMetrics, productPlatformMetrics } from "../data";
import { buildDashboardModel, getPerformanceIndicator } from "../utils/consolidation";
import {
  formatCurrency,
  formatDateRange,
  formatNumber,
  formatPercent,
  formatRatio,
} from "../utils/formatters";

function renderAlertTone(level) {
  if (level === "critical") {
    return "border-red-300 bg-red-50 text-red-700";
  }
  if (level === "positive") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }
  return "border-amber-300 bg-amber-50 text-amber-700";
}

function MobileDataCard({ title, stats }) {
  return (
    <article
      aria-label={`${title} details`}
      className="rounded-2xl border border-dashboard-mint/75 bg-white p-3 shadow-sm"
    >
      <h4 className="font-heading text-base text-dashboard-ink">{title}</h4>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <dt className="truncate text-dashboard-sub" title={stat.label}>
              {stat.label}
            </dt>
            <dd className="break-words font-semibold text-dashboard-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function DashboardPage() {
  const [listMetric, setListMetric] = useState("revenue");

  const model = useMemo(
    () =>
      buildDashboardModel({
        platforms,
        products,
        platformMetrics,
        productPlatformMetrics,
        campaigns,
      }),
    []
  );

  const kpis = model.kpis;

  const rankingLists = {
    revenue: {
      title: "Top products",
      items: model.operations.lists.topProductsByRevenue.map((row) => ({
        id: row.productId,
        name: row.productName,
        value: formatCurrency(row.revenue),
      })),
    },
    platform: {
      title: "Top platforms",
      items: model.operations.lists.topPlatformsByRoi.map((row) => ({
        id: row.id,
        name: row.name,
        value: formatRatio(row.roi),
      })),
    },
    campaigns: {
      title: "Top campaigns",
      items: model.operations.lists.topCampaignsByRevenue.map((row) => ({
        id: row.id,
        name: row.name,
        value: formatCurrency(row.revenue),
      })),
    },
    opportunities: {
      title: "Improvement opportunities",
      items: model.operations.lists.improvementOpportunities.map((row) => ({
        id: row.id,
        name: row.name,
        value: row.reason,
      })),
    },
  };

  const selectedList = rankingLists[listMetric];

  const tabButtonClass =
    "min-h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-deep focus-visible:ring-offset-2";

  return (
    <main className="min-h-screen overflow-x-clip bg-hero px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 sm:gap-6">
        <header className="rounded-3xl bg-dashboard-card/95 p-5 shadow-card ring-1 ring-dashboard-mint/70 backdrop-blur-sm sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dashboard-sub sm:text-xs">
            Single Source Of Truth
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight text-dashboard-ink sm:text-4xl">
            Influencer Analytics Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-dashboard-sub sm:text-base">
            Unified performance view across Instagram, TikTok, and YouTube with a consistent 15%
            commission model.
          </p>

          <nav className="mt-4 flex flex-wrap gap-2" aria-label="Dashboard sections">
            <a
              href="#kpi"
              className="min-h-10 rounded-full bg-dashboard-mint px-4 py-2 text-sm font-semibold text-dashboard-deep transition-colors hover:bg-dashboard-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-deep focus-visible:ring-offset-2"
            >
              KPI outcomes
            </a>
            <a
              href="#drivers"
              className="min-h-10 rounded-full bg-dashboard-mint px-4 py-2 text-sm font-semibold text-dashboard-deep transition-colors hover:bg-dashboard-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-deep focus-visible:ring-offset-2"
            >
              Drivers
            </a>
            <a
              href="#operations"
              className="min-h-10 rounded-full bg-dashboard-mint px-4 py-2 text-sm font-semibold text-dashboard-deep transition-colors hover:bg-dashboard-deep hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-deep focus-visible:ring-offset-2"
            >
              Operations
            </a>
          </nav>
        </header>

        <SectionWrapper
          id="kpi"
          title="KPI Outcomes"
          subtitle="A compact snapshot of revenue, conversion, retention, satisfaction, and efficiency"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard
              label="Commissions Generated"
              value={formatCurrency(kpis.revenue.commissions)}
              tone="highlight"
            />
            <KPICard
              label="Top Revenue Product"
              value={kpis.topProduct ? kpis.topProduct.productName : "N/A"}
              hint={kpis.topProduct ? formatCurrency(kpis.topProduct.revenue) : "No data"}
            />
            <KPICard
              label="Conversion"
              value={formatPercent(kpis.performance.conversionRate, 2)}
              hint="Conversions / reach"
            />
            <KPICard
              label="Best Platform Return"
              value={kpis.bestPlatform ? kpis.bestPlatform.name : "N/A"}
              hint={kpis.bestPlatform ? `${formatRatio(kpis.bestPlatform.roi)} revenue/cost` : "No data"}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <KPICard
              label="Volume"
              value={`${formatNumber(kpis.volume.sales)} sales`}
              hint={`${formatNumber(kpis.volume.signUps)} sign-ups | ${formatNumber(
                kpis.volume.activeUsers
              )} active`}
            />
            <KPICard
              label="Revenue"
              value={formatCurrency(kpis.revenue.revenue)}
              hint={`MRR ${formatCurrency(kpis.revenue.estimatedMrr)} | ASP ${formatCurrency(
                kpis.revenue.averageSellingPrice
              )}`}
            />
            <KPICard
              label="Engagement"
              value={formatPercent(kpis.engagement.rate, 2)}
              hint={`${formatNumber(kpis.engagement.interactions)} interactions`}
            />
            <KPICard
              label="Retention"
              value={formatPercent(kpis.retention.persistenceRate, 1)}
              hint={`Churn ${formatPercent(kpis.retention.churnRate, 1)} | Completion ${formatPercent(
                kpis.retention.completionRate,
                1
              )}`}
            />
            <KPICard
              label="Performance"
              value={formatNumber(kpis.performance.totalConversions)}
              hint={`CTR ${formatPercent(kpis.performance.ctr, 2)} | CVR ${formatPercent(
                kpis.performance.conversionRate,
                2
              )}`}
            />
            <KPICard
              label="Satisfaction"
              value={`NPS ${kpis.satisfaction.nps.toFixed(0)}`}
              hint={`CSAT ${formatPercent(kpis.satisfaction.csat, 1)}`}
            />
            <KPICard
              label="Efficiency"
              value={formatCurrency(kpis.efficiency.costPerOutcome)}
              hint={`Margin ${formatPercent(kpis.efficiency.margin, 1)} | Lead time ${kpis.efficiency.leadTimeDays.toFixed(
                1
              )} days`}
            />
          </div>
        </SectionWrapper>

        <SectionWrapper
          id="drivers"
          title="Drivers"
          subtitle="Funnel performance, channel quality, and product-level engagement signals"
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <article className="rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
              <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">
                Funnel Conversion by Stage
              </h3>
              <div className="mt-3 space-y-4">
                <div>
                  <p className="mb-1 text-sm text-dashboard-sub">Reach to Click</p>
                  <SimpleBarIndicator value={model.drivers.funnel.reachToClick} tone="accent" />
                  <p className="mt-1 text-xs font-semibold text-dashboard-ink">
                    {formatPercent(model.drivers.funnel.reachToClick, 2)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-dashboard-sub">Click to Sign-up</p>
                  <SimpleBarIndicator value={model.drivers.funnel.clickToSignup} tone="primary" />
                  <p className="mt-1 text-xs font-semibold text-dashboard-ink">
                    {formatPercent(model.drivers.funnel.clickToSignup, 2)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-dashboard-sub">Sign-up to Conversion</p>
                  <SimpleBarIndicator value={model.drivers.funnel.signupToConversion} tone="soft" />
                  <p className="mt-1 text-xs font-semibold text-dashboard-ink">
                    {formatPercent(model.drivers.funnel.signupToConversion, 2)}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
              <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">Quality by Platform</h3>

              <div className="mt-3 space-y-2 sm:hidden">
                {model.drivers.qualityByPlatform.map((row) => (
                  <MobileDataCard
                    key={row.platformId}
                    title={row.platformName}
                    stats={[
                      { label: "Qualified", value: formatPercent(row.qualifiedLeadRatio, 1) },
                      { label: "Attendance", value: formatPercent(row.attendanceRate, 1) },
                      { label: "Pass rate", value: formatPercent(row.passRate, 1) },
                    ]}
                  />
                ))}
              </div>

              <div className="mt-3 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[440px] text-left text-sm">
                  <caption className="sr-only">
                    Platform quality comparison with qualified lead, attendance, and pass rates
                  </caption>
                  <thead className="text-dashboard-sub">
                    <tr>
                      <th scope="col" className="pb-2">Platform</th>
                      <th scope="col" className="pb-2">Qualified Lead Ratio</th>
                      <th scope="col" className="pb-2">Attendance Rate</th>
                      <th scope="col" className="pb-2">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody className="text-dashboard-ink">
                    {model.drivers.qualityByPlatform.map((row) => (
                      <tr key={row.platformId} className="border-t border-dashboard-mint/60">
                        <td className="py-2 font-semibold">{row.platformName}</td>
                        <td className="py-2">{formatPercent(row.qualifiedLeadRatio, 1)}</td>
                        <td className="py-2">{formatPercent(row.attendanceRate, 1)}</td>
                        <td className="py-2">{formatPercent(row.passRate, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {model.drivers.platformPerformance.map((platform) => (
              <PlatformCard
                key={platform.id}
                name={platform.name}
                revenue={formatCurrency(platform.revenue)}
                revenueShare={formatRatio(platform.roi)}
                conversions={formatNumber(platform.conversions)}
                engagementRate={formatPercent(platform.engagementRate, 2)}
                indicator={getPerformanceIndicator(platform.performanceScore)}
                score={platform.performanceScore}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            <div className="space-y-3">
              {model.drivers.productPerformance.map((product) => (
                <ProductCard
                  key={product.productId}
                  productName={product.productName}
                  totalRevenue={formatCurrency(product.revenue)}
                  totalConversions={formatNumber(product.conversions)}
                  totalCommissions={formatCurrency(product.commissions)}
                  bestPlatformName={product.bestPlatformName}
                />
              ))}
            </div>

            <article className="rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
              <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">
                Engagement and Activity by Platform
              </h3>

              <div className="mt-3 space-y-2 sm:hidden">
                {model.drivers.engagementByPlatform.map((row) => {
                  const activity = model.drivers.activityByPlatform.find(
                    (candidate) => candidate.platformId === row.platformId
                  );

                  return (
                    <MobileDataCard
                      key={row.platformId}
                      title={row.platformName}
                      stats={[
                        { label: "Engagement", value: formatPercent(row.engagementRate, 2) },
                        { label: "Likes", value: formatNumber(row.likes) },
                        { label: "Comments", value: formatNumber(row.comments) },
                        { label: "Shares", value: formatNumber(row.shares) },
                        { label: "Saves", value: formatNumber(row.saves) },
                        {
                          label: "Posts/Stories/Reels/Videos",
                          value: activity
                            ? `${activity.posts}/${activity.stories}/${activity.reels}/${activity.videos}`
                            : "0/0/0/0",
                        },
                      ]}
                    />
                  );
                })}
              </div>

              <div className="mt-3 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[550px] text-left text-sm">
                  <caption className="sr-only">
                    Engagement and publishing activity by platform
                  </caption>
                  <thead className="text-dashboard-sub">
                    <tr>
                      <th scope="col" className="pb-2">Platform</th>
                      <th scope="col" className="pb-2">Likes</th>
                      <th scope="col" className="pb-2">Comments</th>
                      <th scope="col" className="pb-2">Shares</th>
                      <th scope="col" className="pb-2">Saves</th>
                      <th scope="col" className="pb-2">Posts/Stories/Reels/Videos</th>
                    </tr>
                  </thead>
                  <tbody className="text-dashboard-ink">
                    {model.drivers.engagementByPlatform.map((row) => {
                      const activity = model.drivers.activityByPlatform.find(
                        (candidate) => candidate.platformId === row.platformId
                      );

                      return (
                        <tr key={row.platformId} className="border-t border-dashboard-mint/60">
                          <td className="py-2 font-semibold">
                            {row.platformName}
                            <span className="ml-2 text-xs text-dashboard-sub">
                              ({formatPercent(row.engagementRate, 2)})
                            </span>
                          </td>
                          <td className="py-2">{formatNumber(row.likes)}</td>
                          <td className="py-2">{formatNumber(row.comments)}</td>
                          <td className="py-2">{formatNumber(row.shares)}</td>
                          <td className="py-2">{formatNumber(row.saves)}</td>
                          <td className="py-2">
                            {activity
                              ? `${activity.posts}/${activity.stories}/${activity.reels}/${activity.videos}`
                              : "0/0/0/0"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-dashboard-sub">
                  Engagement Rate by Product
                </h4>
                <div className="mt-2 space-y-3">
                  {model.drivers.engagementByProduct.map((row) => (
                    <div key={row.productId}>
                      <p className="mb-1 flex justify-between text-sm text-dashboard-sub">
                        <span>{row.productName}</span>
                        <span className="font-semibold text-dashboard-ink">
                          {formatPercent(row.engagementRate, 2)}
                        </span>
                      </p>
                      <SimpleBarIndicator value={row.engagementRate} tone="accent" />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </SectionWrapper>

        <SectionWrapper
          id="operations"
          title="Operations"
          subtitle="Detailed tables, anomaly alerts, and filterable rankings"
        >
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <article className="rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
              <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">Products</h3>

              <div className="mt-3 space-y-2 md:hidden">
                {model.operations.productsTable.map((row) => (
                  <MobileDataCard
                    key={row.productId}
                    title={row.productName}
                    stats={[
                      { label: "Price", value: formatCurrency(row.price) },
                      { label: "Commissions", value: formatCurrency(row.commissions) },
                      { label: "Conversions", value: formatNumber(row.conversions) },
                      { label: "ROI", value: formatRatio(row.roi) },
                    ]}
                  />
                ))}
              </div>

              <div className="mt-3 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <caption className="sr-only">Product pricing, commissions, conversion, and ROI table</caption>
                  <thead className="text-dashboard-sub">
                    <tr>
                      <th scope="col" className="pb-2">Product</th>
                      <th scope="col" className="pb-2">Price</th>
                      <th scope="col" className="pb-2">Commissions</th>
                      <th scope="col" className="pb-2">Conversions</th>
                      <th scope="col" className="pb-2">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="text-dashboard-ink">
                    {model.operations.productsTable.map((row) => (
                      <tr key={row.productId} className="border-t border-dashboard-mint/60">
                        <td className="py-2 font-semibold">{row.productName}</td>
                        <td className="py-2">{formatCurrency(row.price)}</td>
                        <td className="py-2">{formatCurrency(row.commissions)}</td>
                        <td className="py-2">{formatNumber(row.conversions)}</td>
                        <td className="py-2">{formatRatio(row.roi)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
              <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">Platforms</h3>

              <div className="mt-3 space-y-2 md:hidden">
                {model.operations.platformsTable.map((row, index) => (
                  <MobileDataCard
                    key={row.id}
                    title={row.name}
                    stats={[
                      { label: "Reach", value: formatNumber(row.reach) },
                      { label: "Engagement", value: formatPercent(row.engagementRate, 2) },
                      { label: "Conversions", value: formatNumber(row.conversions) },
                      {
                        label: "Best metric",
                        value: index === 0 ? "Overall performance" : "Support channel",
                      },
                    ]}
                  />
                ))}
              </div>

              <div className="mt-3 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[570px] text-left text-sm">
                  <caption className="sr-only">Platform reach, engagement, and conversion table</caption>
                  <thead className="text-dashboard-sub">
                    <tr>
                      <th scope="col" className="pb-2">Platform</th>
                      <th scope="col" className="pb-2">Reach</th>
                      <th scope="col" className="pb-2">Engagement</th>
                      <th scope="col" className="pb-2">Conversions</th>
                      <th scope="col" className="pb-2">Best metric</th>
                    </tr>
                  </thead>
                  <tbody className="text-dashboard-ink">
                    {model.operations.platformsTable.map((row, index) => (
                      <tr key={row.id} className="border-t border-dashboard-mint/60">
                        <td className="py-2 font-semibold">{row.name}</td>
                        <td className="py-2">{formatNumber(row.reach)}</td>
                        <td className="py-2">{formatPercent(row.engagementRate, 2)}</td>
                        <td className="py-2">{formatNumber(row.conversions)}</td>
                        <td className="py-2">{index === 0 ? "Overall performance" : "Support channel"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <article className="mt-3 rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
            <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">Campaigns</h3>

            <div className="mt-3 space-y-2 md:hidden">
              {model.operations.campaignsTable.map((row) => (
                <MobileDataCard
                  key={row.id}
                  title={row.name}
                  stats={[
                    { label: "Dates", value: formatDateRange(row.startDate, row.endDate) },
                    { label: "Product", value: row.productName },
                    { label: "Platform", value: row.platformName },
                    { label: "Conversions", value: formatNumber(row.conversions) },
                    { label: "Revenue", value: formatCurrency(row.revenue) },
                    { label: "ROI", value: formatRatio(row.roi) },
                  ]}
                />
              ))}
            </div>

            <div className="mt-3 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[780px] text-left text-sm">
                <caption className="sr-only">Campaign performance table with dates, platform, and ROI</caption>
                <thead className="text-dashboard-sub">
                  <tr>
                    <th scope="col" className="pb-2">Campaign</th>
                    <th scope="col" className="pb-2">Dates</th>
                    <th scope="col" className="pb-2">Product</th>
                    <th scope="col" className="pb-2">Platform</th>
                    <th scope="col" className="pb-2">Conversions</th>
                    <th scope="col" className="pb-2">Revenue</th>
                    <th scope="col" className="pb-2">ROI</th>
                  </tr>
                </thead>
                <tbody className="text-dashboard-ink">
                  {model.operations.campaignsTable.map((row) => (
                    <tr key={row.id} className="border-t border-dashboard-mint/60">
                      <td className="py-2 font-semibold">{row.name}</td>
                      <td className="py-2">{formatDateRange(row.startDate, row.endDate)}</td>
                      <td className="py-2">{row.productName}</td>
                      <td className="py-2">{row.platformName}</td>
                      <td className="py-2">{formatNumber(row.conversions)}</td>
                      <td className="py-2">{formatCurrency(row.revenue)}</td>
                      <td className="py-2">{formatRatio(row.roi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
            <article className="rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
              <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">Alerts</h3>
              <div className="mt-3 space-y-2" role="status" aria-live="polite">
                {model.operations.alerts.length ? (
                  model.operations.alerts.map((alert, index) => (
                    <p
                      key={`${alert.level}-${index}`}
                      className={`rounded-xl border px-3 py-2 text-sm leading-relaxed ${renderAlertTone(
                        alert.level
                      )}`}
                    >
                      {alert.message}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-dashboard-sub">No alerts in the current period.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-dashboard-mint/75 bg-white p-4 shadow-sm">
              <h3 className="font-heading text-lg text-dashboard-ink sm:text-xl">Top Lists</h3>
              <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Ranking list filters">
                <button
                  type="button"
                  onClick={() => setListMetric("revenue")}
                  role="tab"
                  aria-selected={listMetric === "revenue"}
                  aria-controls="top-list-panel"
                  className={`${tabButtonClass} ${
                    listMetric === "revenue"
                      ? "bg-dashboard-deep text-white"
                      : "bg-dashboard-mint text-dashboard-deep"
                  }`}
                >
                  Top products
                </button>
                <button
                  type="button"
                  onClick={() => setListMetric("platform")}
                  role="tab"
                  aria-selected={listMetric === "platform"}
                  aria-controls="top-list-panel"
                  className={`${tabButtonClass} ${
                    listMetric === "platform"
                      ? "bg-dashboard-deep text-white"
                      : "bg-dashboard-mint text-dashboard-deep"
                  }`}
                >
                  Top platforms
                </button>
                <button
                  type="button"
                  onClick={() => setListMetric("campaigns")}
                  role="tab"
                  aria-selected={listMetric === "campaigns"}
                  aria-controls="top-list-panel"
                  className={`${tabButtonClass} ${
                    listMetric === "campaigns"
                      ? "bg-dashboard-deep text-white"
                      : "bg-dashboard-mint text-dashboard-deep"
                  }`}
                >
                  Top campaigns
                </button>
                <button
                  type="button"
                  onClick={() => setListMetric("opportunities")}
                  role="tab"
                  aria-selected={listMetric === "opportunities"}
                  aria-controls="top-list-panel"
                  className={`${tabButtonClass} ${
                    listMetric === "opportunities"
                      ? "bg-dashboard-deep text-white"
                      : "bg-dashboard-mint text-dashboard-deep"
                  }`}
                >
                  Opportunities
                </button>
              </div>

              <h4 id="top-list-title" className="mt-4 text-sm font-semibold uppercase tracking-wide text-dashboard-sub">
                {selectedList.title}
              </h4>
              <ul id="top-list-panel" role="tabpanel" aria-labelledby="top-list-title" className="mt-2 space-y-2">
                {selectedList.items.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-dashboard-mint/70 px-3 py-3 text-sm"
                  >
                    <span className="text-dashboard-sub">
                      {index + 1}. <span className="font-semibold text-dashboard-ink">{item.name}</span>
                    </span>
                    <span className="font-semibold text-dashboard-ink">{item.value}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </SectionWrapper>
      </div>
    </main>
  );
}

export default DashboardPage;
