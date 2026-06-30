export function EmptyState({
  title = "No data available",
  description = "There is nothing to show here yet.",
  action = null,
  children = null,
  className = "",
}) {
  const actionContent = action ?? children;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-2 w-2 rounded-full bg-slate-400" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {actionContent ? <div className="mt-5">{actionContent}</div> : null}
    </div>
  );
}

export default EmptyState;
