function ProductCard({
  productName,
  totalRevenue,
  totalConversions,
  totalCommissions,
  bestPlatformName,
}) {
  const rows = [
    { label: "Total Revenue", value: totalRevenue },
    { label: "Total Conversions", value: totalConversions },
    { label: "Total Commissions", value: totalCommissions },
  ];

  return (
    <article className="rounded-2xl border border-dashboard-mint/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-heading text-base leading-tight text-dashboard-ink sm:text-lg">{productName}</h3>
        <span className="rounded-full bg-dashboard-mint px-3 py-1 text-xs font-semibold text-dashboard-deep">
          {bestPlatformName}
        </span>
      </div>

      <div className="space-y-2 text-sm text-dashboard-sub">
        {rows.map((row) => (
          <p
            key={row.label}
            className="flex items-center justify-between rounded-xl bg-dashboard-bg/70 px-3 py-2"
          >
            <span>{row.label}</span>
            <span className="font-semibold text-dashboard-ink">{row.value}</span>
          </p>
        ))}
      </div>
    </article>
  );
}

export default ProductCard;