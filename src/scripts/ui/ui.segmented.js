import { updateFilters } from "../state.js";

export function initSegmented() {
  const root = document.querySelector("[data-segmented]");
  if (!root) return;

  const indicator = root.querySelector("[data-indicator]");
  const buttons = [...root.querySelectorAll(".segment")];

  // начальная установка
  positionIndicator(
    buttons.find((b) => b.getAttribute("aria-pressed") === "true")
  );

  // обработчики
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");

      positionIndicator(btn);

      updateFilters({ status: btn.dataset.filterValue });
    });
  });

  function positionIndicator(btn) {
    const { offsetLeft, offsetWidth } = btn;

    indicator.style.left = `${offsetLeft - 0}px`;
    indicator.style.width = `${offsetWidth}px`;
    indicator.style.opacity = "1";
  }
}
