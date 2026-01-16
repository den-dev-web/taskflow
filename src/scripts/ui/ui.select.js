import { updateFilters } from "../state.js";

export function initCustomSelects() {
  document.querySelectorAll("[data-select]").forEach(initSelect);
}

export function setSelectValue(root, value) {
  if (!root) return;

  const trigger = root.querySelector("[data-select-trigger]");
  const valueEl = root.querySelector("[data-select-value]");
  const options = root.querySelectorAll(".select-option");

  const target = Array.from(options).find((opt) => opt.dataset.value === value);
  if (!target) return;

  options.forEach((o) => o.removeAttribute("aria-selected"));
  target.setAttribute("aria-selected", "true");

  valueEl.textContent = target.textContent;
  root.dataset.value = value;

  trigger?.setAttribute("aria-expanded", "false");

  syncHiddenInput(root, value);
}

function initSelect(root) {
  const trigger = root.querySelector("[data-select-trigger]");
  const dropdown = root.querySelector("[data-select-dropdown]");
  const valueEl = root.querySelector("[data-select-value]");
  const options = root.querySelectorAll(".select-option");
  let open = false;

  function closeAllSelects(except = null) {
    document.querySelectorAll("[data-select]").forEach((other) => {
      if (other !== except) {
        other.dataset.open = "false";
        const dd = other.querySelector("[data-select-dropdown]");
        if (dd) {
          dd.dataset.open = "false";
          dd.hidden = true;
        }
      }
    });
  }

  function openDropdown() {
    open = true;
    dropdown.hidden = false;

    requestAnimationFrame(() => {
      dropdown.dataset.open = "true";
      root.dataset.open = "true";
    });
  }

  function closeDropdown() {
    open = false;
    dropdown.dataset.open = "false";
    root.dataset.open = "false";

    setTimeout(() => (dropdown.hidden = true), 140);
  }

  // ← FIX: перед открытием закрываем все другие селекторы
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!open) {
      closeAllSelects(root); // ← ЭТО РЕШАЕТ ПРОБЛЕМУ
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  options.forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();

      applyValue(opt);

      closeDropdown();

      handleFilters(root, opt.dataset.value);

      root.dispatchEvent(
        new CustomEvent("select:change", {
          detail: { value: opt.dataset.value },
        })
      );
    });

    trigger.addEventListener("keydown", (e) => {
      const items = Array.from(options);
      const active =
        items.find((o) => o.dataset.active === "true") ||
        items.find((o) => o.getAttribute("aria-selected") === "true");
      let index = items.indexOf(active);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) {
            closeAllSelects(root);
            openDropdown();
          }
          clearOptionFocus(items);
          index = Math.min(index + 1, items.length - 1);
          focusOption(items[index]);
          break;

        case "ArrowUp":
          e.preventDefault();
          if (!open) {
            closeAllSelects(root);
            openDropdown();
          }
          clearOptionFocus(items);
          index = Math.max(index - 1, 0);
          focusOption(items[index]);
          break;

        case "Enter":
          if (open && active) {
            e.preventDefault();
            active.click();
          }
          break;

        case "Escape":
          if (open) {
            e.preventDefault();
            closeDropdown();
            trigger.focus();
          }
          break;
      }
    });
  });

  function applyValue(optionEl) {
    const value = optionEl.dataset.value;

    options.forEach((o) => o.removeAttribute("aria-selected"));
    optionEl.setAttribute("aria-selected", "true");

    valueEl.textContent = optionEl.textContent;
    root.dataset.value = value;

    syncHiddenInput(root, value);
  }

  // клик вне закрывает текущий
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target) && open) closeDropdown();
  });
}

function focusOption(opt) {
  opt.focus();
  opt.dataset.active = "true";
}

function clearOptionFocus(options) {
  options.forEach((o) => delete o.dataset.active);
}

function handleFilters(root, value) {
  const type = root.dataset.selectType;

  if (type === "priority") {
    updateFilters({ priority: value });
  }

  if (type === "sort") {
    updateFilters({ sort: value });
  }
}

function syncHiddenInput(root, value) {
  const type = root.dataset.selectType;

  if (type === "modal-priority") {
    const hidden = root.parentElement.querySelector("input[name='priority']");
    if (hidden) hidden.value = value;
  }

  if (type === "modal-status") {
    const hidden = root.parentElement.querySelector("input[name='completed']");
    if (hidden) hidden.value = value;
  }
}
