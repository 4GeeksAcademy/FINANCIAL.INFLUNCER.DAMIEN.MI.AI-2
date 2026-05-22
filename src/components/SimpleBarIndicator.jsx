function SimpleBarIndicator({ value, tone = "primary", label }) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const segments = 20;
  const filledSegments = Math.round((clampedValue / 100) * segments);

  const toneClass = {
    primary: "bg-dashboard-deep",
    accent: "bg-dashboard-accent",
    soft: "bg-dashboard-deep/45",
  }[tone];

  return (
    <div aria-label={label ? `${label} ${clampedValue.toFixed(1)}%` : `${clampedValue.toFixed(1)}%`}>
      {label ? <p className="mb-1 text-xs font-semibold text-dashboard-sub">{label}</p> : null}
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 rounded-full bg-dashboard-mint/45 p-1">
        {Array.from({ length: segments }).map((_, index) => (
          <span
            key={`${tone}-${index}`}
            className={`h-2 rounded-sm transition-colors duration-300 ${
              index < filledSegments ? toneClass : "bg-dashboard-mint/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default SimpleBarIndicator;