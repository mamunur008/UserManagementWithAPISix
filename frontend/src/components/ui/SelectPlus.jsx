import { useMemo, useRef, useState } from 'react';

function getLabel(option, labelKey) {
  if (typeof option === 'string') return option;
  return option?.[labelKey] || option?.name || option?.code || option?.key || option?.id || '';
}

function getValue(option, valueKey) {
  if (typeof option === 'string') return option;
  return option?.[valueKey] || option?.id || option?.code || option?.name || '';
}

export function SelectPlus({
  label,
  value = [],
  options = [],
  valueKey = 'id',
  labelKey = 'name',
  placeholder = 'Select',
  onChange,
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const selectedValues = Array.isArray(value) ? value : [];

  const selectedLabels = useMemo(() => {
    return options
      .filter((option) => selectedValues.includes(getValue(option, valueKey)))
      .map((option) => getLabel(option, labelKey));
  }, [options, selectedValues, valueKey, labelKey]);

  function toggleValue(nextValue) {
    if (disabled) return;
    const exists = selectedValues.includes(nextValue);
    const next = exists
      ? selectedValues.filter((x) => x !== nextValue)
      : [...selectedValues, nextValue];
    onChange(next);
  }

  return (
    <div className="relative" ref={boxRef}>
      {label ? <span className="font-black text-ink">{label}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((x) => !x)}
        className="mt-2 flex min-h-12 w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-left font-semibold text-ink outline-none transition hover:border-brand focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-60"
      >
        <span className={selectedLabels.length ? 'text-ink' : 'text-muted'}>
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <span className="text-muted">⌄</span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-card">
          {options.length === 0 ? (
            <div className="px-3 py-3 text-sm font-bold text-muted">No options found</div>
          ) : (
            options.map((option) => {
              const optionValue = getValue(option, valueKey);
              const optionLabel = getLabel(option, labelKey);
              const checked = selectedValues.includes(optionValue);
              return (
                <label key={optionValue} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-panel-soft">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleValue(optionValue)}
                    className="h-5 w-5 accent-brand"
                  />
                  <span className="font-bold text-ink">{optionLabel}</span>
                </label>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
