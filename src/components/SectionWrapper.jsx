function SectionWrapper({ id, title, subtitle, children }) {
  const headingId = id ? `${id}-title` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="rounded-3xl bg-dashboard-card/95 p-4 shadow-card ring-1 ring-dashboard-mint/70 backdrop-blur-sm sm:p-6"
    >
      <header className="mb-5 space-y-1">
        <h2 id={headingId} className="font-heading text-xl leading-tight text-dashboard-ink sm:text-2xl">
          {title}
        </h2>
        {subtitle ? <p className="max-w-3xl text-sm leading-relaxed text-dashboard-sub">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

export default SectionWrapper;