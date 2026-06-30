import { useEffect } from "react";
import { createPortal } from "react-dom";

export function CrudDrawerForm({
  modelValue = false,
  title = "",
  width = "520px",
  loading = false,
  saveText = "Save changes",
  cancelText = "Cancel",
  onUpdateModelValue,
  onSubmit,
  onCancel,
  children,
}) {
  useEffect(() => {
    if (!modelValue) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        handleClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modelValue, loading]);

  const handleClose = () => {
    if (loading) return;
    onCancel?.();
    onUpdateModelValue?.(false);
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  if (!modelValue) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="absolute right-0 top-0 flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl"
        style={{ width, maxWidth: "100vw" }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto w-full max-w-xl space-y-6">{children}</div>
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-xl justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : saveText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default CrudDrawerForm;
