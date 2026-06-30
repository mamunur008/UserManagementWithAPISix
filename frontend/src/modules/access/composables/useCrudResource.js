import { computed, ref } from "vue";

export function useCrudResource(initialRows = []) {
  const loading = ref(false);
  const rows = ref(initialRows);
  const total = ref(initialRows.length);
  const page = ref(1);
  const pageSize = ref(10);

  const filters = ref({
    keyword: "",
    status: "",
  });

  const pagedRows = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return rows.value.slice(start, end);
  });

  const setRows = (items) => {
    rows.value = Array.isArray(items) ? items : [];
    total.value = rows.value.length;
  };

  const setLoading = (value) => {
    loading.value = !!value;
  };

  const resetFilters = () => {
    filters.value = {
      keyword: "",
      status: "",
    };
    page.value = 1;
  };

  const applyFilters = (predicate) => {
    if (typeof predicate !== "function") return;
    const nextRows = initialRows.filter(predicate);
    setRows(nextRows);
  };

  const removeRow = (id) => {
    const next = rows.value.filter((item) => item.id !== id);
    rows.value = next;
    total.value = next.length;
  };

  const upsertRow = (payload) => {
    const index = rows.value.findIndex((item) => item.id === payload.id);

    if (index >= 0) {
      rows.value[index] = { ...rows.value[index], ...payload };
      rows.value = [...rows.value];
    } else {
      rows.value = [{ ...payload }, ...rows.value];
      total.value = rows.value.length;
    }
  };

  return {
    loading,
    rows,
    total,
    page,
    pageSize,
    pagedRows,
    filters,
    setRows,
    setLoading,
    resetFilters,
    applyFilters,
    removeRow,
    upsertRow,
  };
}
