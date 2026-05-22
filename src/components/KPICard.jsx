function KPICard({ label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "highlight"
      ? "border-dashboard-deep/60 bg-gradient-to-br from-dashboard-mint/55 to-white"
      : "border-dashboard-mint/80 bg-white";

  return (
    <article className={`h-full rounded-2xl border p-4 shadow-sm ring-1 ring-transparent ${toneClass}`}>
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-dashboard-sub sm:text-xs">{label}</h3>
      <p
        className={`mt-2 break-words font-heading leading-tight text-dashboard-ink ${
          tone === "highlight" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-dashboard-sub">{hint}</p> : null}
    </article>
  );
}

export default KPICard;