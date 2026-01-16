import { state, updateFilters } from "../state.js";
import { applyFilters } from "../tasks.filters.js";
import { reorderTasks, updateTask } from "../tasks.service.js";
import { setSelectValue } from "./ui.select.js";

const ICON_UNCHECKED = `
<svg viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
  <rect x="5" y="5" width="14" height="14" rx="3" />
</svg>`;

const ICON_CHECKED = `
<svg viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
  <rect x="5" y="5" width="14" height="14" rx="3" />
  <path d="M9 12.5l2.5 2.5L15 10" />
</svg>`;

export function renderTasks() {
  const root = document.querySelector("[data-tasks-root]");
  const empty = document.querySelector("[data-state='empty']");
  const error = document.querySelector("[data-state='error']");
  const skeleton = document.querySelector("[data-state='loading']");

  const tasks = applyFilters(state.tasks);

  skeleton.hidden = true;
  error.hidden = state.storageAvailable;
  empty.hidden = tasks.length > 0;

  root.innerHTML = "";

  const tpl = document.getElementById("task-card-template");

  const { lastCreatedTaskId } = state.ui;

  tasks.forEach((task, index) => {
    const li = tpl.content.cloneNode(true);

    const card = li.querySelector(".task-card");
    card.style.animationDelay = `${index * 40}ms`;
    card.dataset.taskId = task.id;
    card.dataset.state = task.completed ? "completed" : "active";
    card.dataset.priority = task.priority;

    const checkbox = li.querySelector("[data-task-checkbox]");
    checkbox.innerHTML = task.completed ? ICON_CHECKED : ICON_UNCHECKED;

    // для анимаций/стилей
    checkbox.dataset.state = task.completed ? "checked" : "unchecked";

    if (task.id === lastCreatedTaskId) {
      card.classList.add("task-card--new");
    }

    li.querySelector("[data-task-title]").textContent = task.title;
    li.querySelector("[data-task-description]").textContent = task.description;
    li.querySelector("[data-task-priority]").textContent = formatPriority(
      task.priority
    );

    const dt = new Date(task.createdAt);
    const dateEl = li.querySelector("[data-task-date]");
    const dateStr = dt.toLocaleDateString("ru-RU");
    const timeStr = dt.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    dateEl.innerHTML = `<span>${dateStr}</span><span>${timeStr}</span>`;
    root.appendChild(li);
  });

  /*document.querySelector(
    "[data-tasks-count]"
  ).textContent = `${tasks.length} задач`;*/
}

export function initTaskInlineEditing() {
  const root = document.querySelector("[data-tasks-root]");
  if (!root) return;

  root.addEventListener("dblclick", (e) => {
    const titleEl = e.target.closest("[data-task-title]");
    const descEl = e.target.closest("[data-task-description]");

    if (titleEl) enterEdit(titleEl, "title");
    if (descEl) enterEdit(descEl, "description");
  });

  function enterEdit(textEl, field) {
    const card = textEl.closest(".task-card");
    const id = card.dataset.taskId;
    const initial = textEl.textContent.trim();

    const input =
      field === "title"
        ? document.createElement("input")
        : document.createElement("textarea");

    input.className = textEl.className + " task-card__input";
    input.value = initial;
    input.rows = field === "description" ? 3 : undefined;

    textEl.replaceWith(input);
    input.focus();
    input.select?.();

    const finish = (submit) => {
      const value = input.value.trim();
      const newText = submit && value ? value : initial;

      const span = document.createElement(field === "title" ? "h3" : "p");
      span.className = textEl.className;
      span.dataset[field === "title" ? "taskTitle" : "taskDescription"] = "";
      span.textContent = newText;

      input.replaceWith(span);

      if (submit && value !== initial) {
        updateTask(id, { [field]: newText });
      }
    };

    input.addEventListener("blur", () => finish(true));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && field === "title") {
        e.preventDefault();
        finish(true);
      }
      if (e.key === "Escape") finish(false);
    });
  }
}

function formatPriority(value) {
  const map = {
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
  };

  return map[value] ?? value;
}

export function initTasksDragAndDrop() {
  const root = document.querySelector("[data-tasks-root]");
  if (!root) return;

  let dragId = null;

  root.addEventListener("dragstart", (e) => {
    const handle = e.target.closest("[data-drag-handle]");
    if (!handle) {
      e.preventDefault();
      return;
    }

    const item = handle.closest(".task-item");
    if (!item) return;

    dragId = item.querySelector(".task-card")?.dataset.taskId;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dragId || "");
    item.classList.add("task-item--dragging");
  });

  root.addEventListener("dragend", (e) => {
    const item = e.target.closest(".task-item");
    item?.classList.remove("task-item--dragging");
    clearDropTarget(root);
    dragId = null;
  });

  root.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = root.querySelector(".task-item--dragging");
    if (!dragging) return;

    const overItem = e.target.closest(".task-item");
    if (!overItem || overItem === dragging) {
      clearDropTarget(root);
      if (!overItem) root.appendChild(dragging);
      return;
    }

    setDropTarget(root, overItem);
    const reference = getInsertReference(
      overItem,
      e.clientX,
      e.clientY,
      dragging
    );

    if (reference == null) {
      root.appendChild(dragging);
    } else {
      root.insertBefore(dragging, reference);
    }
  });

  root.addEventListener("drop", () => {
    // сохраняем новый порядок в state
    const ids = [...root.querySelectorAll(".task-card")].map(
      (card) => card.dataset.taskId
    );
    clearDropTarget(root);
    if (state.filters.sort !== "manual") {
      updateFilters({ sort: "manual" });
      setSelectValue(
        document.querySelector("[data-select-type='sort']"),
        "manual"
      );
    }

    reorderTasks(ids);
  });

  function getInsertReference(overItem, x, y, dragging) {
    const box = overItem.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const useX = Math.abs(dx) > Math.abs(dy);
    const insertAfter = useX ? dx > 0 : dy > 0;

    if (!insertAfter) return overItem;

    let next = overItem.nextElementSibling;
    while (next && next === dragging) {
      next = next.nextElementSibling;
    }
    return next;
  }

  function clearDropTarget(container) {
    container
      .querySelectorAll(".task-item--drop-target")
      .forEach((item) => item.classList.remove("task-item--drop-target"));
  }

  function setDropTarget(container, target) {
    clearDropTarget(container);
    if (!target) return;
    target.classList.add("task-item--drop-target");
  }
}
