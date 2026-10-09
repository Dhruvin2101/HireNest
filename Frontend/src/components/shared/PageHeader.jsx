// Tinted header band used at the top of inner pages (Jobs, Browse, Saved, admin pages...).
const PageHeader = ({ eyebrow, title, description, actions, children }) => (
  <section className="relative isolate overflow-hidden border-b border-line bg-paper">
    <div aria-hidden className="absolute inset-0 -z-10 bg-blueprint opacity-70" />
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:py-12 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
        )}
        <h1 className="mt-1.5 text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {children}
  </section>
);

export default PageHeader;
