//import "./main.scss";

import { emit } from "./scripts/events.js";
import { safeGet } from "./scripts/storage.js";
import { setState, updateFilters } from "./scripts/state.js";
import { updateModal } from "./scripts/state.js";
import { on } from "./scripts/events.js";
import { state } from "./scripts/state.js";
import { toggleCompleted } from "./scripts/tasks.service.js";
import { deleteTask } from "./scripts/tasks.service.js";
import { reorderTasks } from "./scripts/tasks.service.js";

import { initThemeToggle } from "./scripts/ui/ui.theme.js";
import { initToolbar } from "./scripts/ui/ui.toolbar.js";
import { initTaskForm } from "./scripts/ui/ui.form.js";
import { setCreateDefaults } from "./scripts/ui/ui.form.js";
import { initCustomSelects } from "./scripts/ui/ui.select.js";
import { setSelectValue } from "./scripts/ui/ui.select.js";
import { initSegmented } from "./scripts/ui/ui.segmented.js";
import { initModal } from "./scripts/ui/ui.modal.js";
import { initDraggableModal } from "./scripts/ui/ui.modal.js";
import { renderTasks } from "./scripts/ui/ui.tasks.js";
import { initTaskInlineEditing } from "./scripts/ui/ui.tasks.js";
import { initTasksDragAndDrop } from "./scripts/ui/ui.tasks.js";
import { openEditModal, openSubtaskModal } from "./scripts/ui/ui.form.js";

document.addEventListener("DOMContentLoaded", () => {
  emit("dom:ready");

  const stored = safeGet("tasks", []);
  setState({ tasks: stored });

  initThemeToggle();
  initToolbar();
  initTaskForm();
  initCustomSelects();
  initSegmented();
  initModal();
  initDraggableModal();
  renderTasks();
  initTaskInlineEditing();
  initTasksDragAndDrop();
});

document.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-action='open-create-modal']");
  if (openBtn) {
    updateModal({
      open: true,
      mode: "create",
      editingTaskId: null,
    });

    requestAnimationFrame(() => {
      setCreateDefaults();
    });
  }
});

document.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]");
  if (!action) return;

  const actionType = action.dataset.action;

  // родительская карточка
  const card = action.closest(".task-card");
  const taskId = card?.dataset.taskId;

  switch (actionType) {
    case "toggle-completed":
      toggleCompleted(taskId);
      break;

    case "edit-task":
      openEditModal(taskId);
      break;

    case "delete-task":
      deleteTask(taskId);
      break;

    case "add-subtask":
      openSubtaskModal(taskId);
      break;

    case "move-up":
      moveTaskInView(taskId, -1);
      break;

    case "move-down":
      moveTaskInView(taskId, 1);
      break;
  }
});

document.addEventListener("click", (e) => {
  const menu = document.querySelector("[data-context-menu]");

  const btn = e.target.closest("[data-action='open-context-menu']");
  if (btn) {
    const card = btn.closest(".task-card");
    const id = card.dataset.taskId;

    const rect = btn.getBoundingClientRect();

    menu.hidden = false;
    menu.style.left = "0px";
    menu.style.top = "0px";

    const { left, top } = getMenuPosition(menu, rect);

    // меню фиксированное, а не абсолютное
    menu.style.left = left + "px";
    menu.style.top = top + "px";

    menu.dataset.taskId = id;

    requestAnimationFrame(() => {
      menu.dataset.open = "true";
    });

    return;
  }

  // клик по пункту меню
  const item = e.target.closest("[data-context]");
  if (item) {
    const id = menu.dataset.taskId;
    const type = item.dataset.context;

    if (type === "edit") openEditModal(id);
    if (type === "delete") deleteTask(id);
    if (type === "subtask") openSubtaskModal(id);

    closeMenu();
    return;
  }

  // клик вне меню
  if (!e.target.closest("[data-context-menu]")) {
    closeMenu();
  }
});

function closeMenu() {
  const menu = document.querySelector("[data-context-menu]");
  menu.dataset.open = "false";
  setTimeout(() => (menu.hidden = true), 150);
}

function getMenuPosition(menu, anchorRect) {
  const margin = 8;
  const menuRect = menu.getBoundingClientRect();

  let left = anchorRect.right - menuRect.width;
  if (left + menuRect.width + margin > window.innerWidth) {
    left = window.innerWidth - menuRect.width - margin;
  }
  if (left < margin) left = margin;

  let top = anchorRect.bottom + margin;
  if (top + menuRect.height + margin > window.innerHeight) {
    top = anchorRect.top - menuRect.height - margin;
  }
  if (top < margin) top = margin;

  return { left, top };
}

function moveTaskInView(taskId, direction) {
  const root = document.querySelector("[data-tasks-root]");
  if (!root) return;

  const cards = [...root.querySelectorAll(".task-card")];
  const index = cards.findIndex((card) => card.dataset.taskId === taskId);
  if (index === -1) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= cards.length) return;

  const ids = cards.map((card) => card.dataset.taskId);
  const temp = ids[index];
  ids[index] = ids[targetIndex];
  ids[targetIndex] = temp;

  ensureManualSort();
  reorderTasks(ids);
}

function ensureManualSort() {
  if (state.filters.sort === "manual") return;

  updateFilters({ sort: "manual" });
  setSelectValue(
    document.querySelector("[data-select-type='sort']"),
    "manual"
  );
}

on("tasks:updated", renderTasks);
on("filters:updated", renderTasks);

on("modal:updated", () => {
  if (state.modal.open) {
    requestAnimationFrame(() => {
      document.querySelector("[name='title']")?.focus();
    });
  }
});

document.querySelector("[data-footer-year]").textContent =
  new Date().getFullYear();
