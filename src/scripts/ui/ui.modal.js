import { on } from "../events.js";
import { state, updateModal } from "../state.js";

export function initModal() {
  const modal = document.querySelector("[data-modal='task']");
  if (!modal) return;

  const backdrop = modal.querySelector("[data-modal-backdrop]");
  const closeButtons = modal.querySelectorAll("[data-modal-close]");

  // Закрытие по клику на фон
  backdrop.addEventListener("click", () => {
    updateModal({ open: false });
  });

  // Закрытие по кнопкам (крестик + отмена)
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      updateModal({ open: false });
    });
  });

  // Закрытие по ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.modal.open) {
      updateModal({ open: false });
    }
  });
}

on("modal:updated", renderModalState);

export function renderModalState() {
  const modal = document.querySelector("[data-modal='task']");
  if (!modal) return;

  if (state.modal.open) {
    modal.hidden = false;

    requestAnimationFrame(() => {
      modal.dataset.state = "open";
    });
  } else {
    modal.dataset.state = "closing";

    setTimeout(() => {
      modal.hidden = true;
    }, 250); // время совпадает с CSS
  }
}

export function initDraggableModal() {
  const modal = document.querySelector("[data-modal='task']");
  const dialog = modal.querySelector(".modal__dialog");
  const handle = modal.querySelector("[data-modal-drag-handle]");
  if (!handle) return;

  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    const rect = dialog.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    dialog.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    dialog.style.position = "absolute";
    dialog.style.left = `${e.clientX - offsetX}px`;
    dialog.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    dialog.style.transition = "";
  });
}
