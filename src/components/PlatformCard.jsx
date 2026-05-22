import SimpleBarIndicator from "./SimpleBarIndicator";

function PlatformCard({
  name,
  revenue,
  revenueShare,
  conversions,
  engagementRate,
  indicator,
  score,
}) {
  const statRows = [
    { label: "Revenue", value: revenue },
    { label: "ROI", value: revenueShare },
    { label: "Conversions", value: conversions },
    { label: "Engagement", value: engagementRate },
  ];

  return (
    <article className="rounded-2xl border border-dashboard-mint/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-heading text-lg leading-tight text-dashboard-ink sm:text-xl">{name}</h3>
        <span className="rounded-full bg-dashboard-mint px-3 py-1 text-xs font-semibold text-dashboard-deep">
          {indicator}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm text-dashboard-sub sm:grid-cols-2">
        {statRows.map((row) => (
          <p
            key={row.label}
            className="flex items-center justify-between rounded-xl bg-dashboard-bg/70 px-3 py-2"
          >
            <span>{row.label}</span>
            <span className="font-semibold text-dashboard-ink">{row.value}</span>
          </p>
        ))}
      </div>

      <div className="mt-4">
        <SimpleBarIndicator value={score * 100} tone="accent" label="Performance" />
      </div>
    </article>
  );
}

export default PlatformCard;