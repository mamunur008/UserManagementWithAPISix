export function CrudPageLayout({
  title,
  description,
  actions = null,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {title ? (
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
          ) : null}

          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {actions}
          </div>
        ) : null}
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export default CrudPageLayout;
