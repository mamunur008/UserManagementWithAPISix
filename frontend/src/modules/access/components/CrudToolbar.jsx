function renderContent(content) {
  return typeof content === "function" ? content() : content;
}

export function CrudToolbar({
  filters = null,
  actions = null,
  children = null,
  className = "",
}) {
  const filtersContent = filters ?? children;
  const actionsContent = actions;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-4">
          {filtersContent ? renderContent(filtersContent) : null}
        </div>

        {actionsContent ? (
          <div className="flex shrink-0 items-center gap-3">
            {renderContent(actionsContent)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CrudToolbar;
