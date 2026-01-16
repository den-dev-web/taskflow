import { createTask, updateTask, createSubtask } from "../tasks.service.js";
import { state, updateModal } from "../state.js";
import { updateFilters } from "../state.js";
import { setSelectValue } from "./ui.select.js";

export function initTaskForm() {
  const form = document.querySelector("[data-task-form]");

  // inline-валидация
  form.addEventListener("input", (e) => {
    const field = e.target;
    const name = field.name;

    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (rules[name]) {
      const msg = rules[name](field.value);
      if (msg) {
        errorEl.textContent = msg;
        field.closest(".field").dataset.invalid = "true";
      } else {
        errorEl.textContent = "";
        field.closest(".field").dataset.invalid = "false";
      }
    }
  });

  // submit формы
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;

    // финальная проверка
    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      const errorEl = form.querySelector(`[data-error-for="${name}"]`);
      const msg = rules[name](field.value);

      if (msg) {
        errorEl.textContent = msg;
        field.closest(".field").dataset.invalid = "true";
        valid = false;
      } else {
        errorEl.textContent = "";
        field.closest(".field").dataset.invalid = "false";
      }
    });

    if (!valid) return;

    // ВАЖНО: собираем FormData только один раз
    const data = Object.fromEntries(new FormData(form));
    const payload = { ...data, completed: data.completed === "true" };

    if (state.modal.mode === "create") {
      createTask(payload);
    } else if (state.modal.mode === "subtask") {
      createSubtask(state.modal.parentId, payload);
    } else {
      updateTask(state.modal.editingTaskId, payload);
    }

    updateModal({ open: false });
    form.reset();
  });
}

const rules = {
  title(value) {
    if (!value.trim()) return "Введите заголовок";
    if (value.length < 3) return "Минимум 3 символа";
    return null;
  },
  description(value) {
    if (value.length > 500) return "Описание слишком длинное";
    return null;
  },
};

export function openEditModal(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  // открываем модалку
  updateModal({
    open: true,
    mode: "edit",
    editingTaskId: taskId,
  });

  requestAnimationFrame(() => {
    const form = document.querySelector("[data-task-form]");

    form.elements.title.value = task.title;
    form.elements.description.value = task.description;
    form.elements.priority.value = task.priority;
    form.elements.completed.value = task.completed;

    const prioritySelect = document.querySelector(
      "[data-select-type='modal-priority']"
    );
    const statusSelect = document.querySelector(
      "[data-select-type='modal-status']"
    );

    setSelectValue(prioritySelect, task.priority);
    setSelectValue(statusSelect, String(task.completed));

    form.elements.title.focus();
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function openSubtaskModal(parentId) {
  updateModal({
    open: true,
    mode: "subtask",
    parentId,
  });

  requestAnimationFrame(() => {
    const form = document.querySelector("[data-task-form]");
    form.reset();
    form.elements.title.focus();

    document.querySelector("[data-modal-title]").textContent =
      "Новая подзадача";
  });
}

export function setCreateDefaults() {
  const form = document.querySelector("[data-task-form]");
  if (!form) return;

  form.reset();

  // скрытые поля по умолчанию
  form.elements.priority.value = "medium";
  form.elements.completed.value = "false";

  const prioritySelect = document.querySelector(
    "[data-select-type='modal-priority']"
  );
  const statusSelect = document.querySelector(
    "[data-select-type='modal-status']"
  );

  setSelectValue(prioritySelect, "medium");
  setSelectValue(statusSelect, "false");

  const title = document.querySelector("[data-modal-title]");
  if (title) title.textContent = "Новая задача";
}
