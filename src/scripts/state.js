import { emit } from "./events.js";

export const state = {
  tasks: [],
  ui: {
    lastCreatedTaskId: null,
  },
  filters: {
    search: "",
    status: "all",
    priority: "all",
    sort: "createdAt-desc",
  },
  modal: {
    open: false,
    mode: "create", // create | edit
    editingTaskId: null,
  },
  storageAvailable: true,
};

export function setState(patch) {
  Object.assign(state, patch);
  emit("state:updated", state);
}

export function updateFilters(patch) {
  Object.assign(state.filters, patch);
  emit("filters:updated", state.filters);
}

export function updateModal(patch) {
  Object.assign(state.modal, patch);
  emit("modal:updated", state.modal);
}
