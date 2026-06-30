import { computed, ref } from "vue";

export function useDrawerForm(defaultValues = {}) {
  const visible = ref(false);
  const loading = ref(false);
  const mode = ref("create");
  const record = ref({ ...defaultValues });

  const isEdit = computed(() => mode.value === "edit");

  const openCreate = () => {
    mode.value = "create";
    record.value = { ...defaultValues };
    visible.value = true;
  };

  const openEdit = (row) => {
    mode.value = "edit";
    record.value = { ...defaultValues, ...(row || {}) };
    visible.value = true;
  };

  const close = () => {
    visible.value = false;
  };

  const reset = () => {
    record.value = { ...defaultValues };
  };

  const setLoading = (value) => {
    loading.value = !!value;
  };

  return {
    visible,
    loading,
    mode,
    record,
    isEdit,
    openCreate,
    openEdit,
    close,
    reset,
    setLoading,
  };
}
