import EmptyState from "./EmptyState.jsx";

export function CrudTableCard({
  title = "",
  description = "",
  subtitle = "",
  loading = false,
  isEmpty = false,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters to find what you need.",
  emptyAction = null,
  footer = null,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {(title || description || subtitle) && (
        <div className="border-b border-slate-200 px-5 py-4">
          {title ? (
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          ) : null}

          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}

          {!description && subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      )}

      <div className="p-4">
        {isEmpty && !loading ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        ) : (
          children
        )}
      </div>

      {footer ? (
        <div className="border-t border-slate-200 px-5 py-4">
          {typeof footer === "function" ? footer() : footer}
        </div>
      ) : null}
    </div>
  );
}

export default CrudTableCard;
