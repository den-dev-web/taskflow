import { updateFilters } from "../state.js";

export function initToolbar() {
  // ===== SEARCH =====
  const search = document.querySelector("[data-filter='search']");
  if (search) {
    search.addEventListener("input", (e) => {
      updateFilters({ search: e.target.value });
    });
  }

  // ===== STATUS BUTTONS =====
  const statusButtons = document.querySelectorAll("[data-filter='status']");
  if (statusButtons.length > 0) {
    statusButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        statusButtons.forEach((b) => b.setAttribute("aria-pressed", false));

        btn.setAttribute("aria-pressed", true);

        updateFilters({ status: btn.dataset.filterValue });
      });
    });
  }

  // ===== MOBILE TABS =====
  const tabsRoot = document.querySelector("[data-toolbar-tabs]");
  const toolbar = document.querySelector("[data-toolbar]");
  if (tabsRoot && toolbar) {
    const tabs = Array.from(tabsRoot.querySelectorAll("[data-toolbar-tab]"));

    const setActive = (value) => {
      toolbar.dataset.activeTab = value;
      tabs.forEach((tab) => {
        const isActive = tab.dataset.toolbarTab === value;
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    };

    const initial = toolbar.dataset.activeTab || tabs[0]?.dataset.toolbarTab;
    if (initial) {
      setActive(initial);
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setActive(tab.dataset.toolbarTab));
    });
  }
}
