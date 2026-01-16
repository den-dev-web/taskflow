import { state } from "./state.js";

export function applyFilters(tasks) {
  let result = [...tasks];
  const f = state.filters;

  // search
  if (f.search.trim()) {
    const q = f.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }

  // status
  if (f.status !== "all") {
    result = result.filter((t) =>
      f.status === "completed" ? t.completed : !t.completed
    );
  }

  // priority
  if (f.priority !== "all") {
    result = result.filter((t) => t.priority === f.priority);
  }

  // sorting
  if (f.sort !== "manual") {
    result = sortTasks(result, f.sort);
  }

  return result;
}

function sortTasks(tasks, type) {
  const [key, dir] = type.split("-");
  const direction = dir === "asc" ? 1 : -1;

  return [...tasks].sort((a, b) => {
    if (key === "priority") {
      const order = { high: 3, medium: 2, low: 1 };
      return (order[a.priority] - order[b.priority]) * direction;
    }

    if (typeof a[key] === "string") {
      return a[key].localeCompare(b[key]) * direction;
    }

    return (a[key] - b[key]) * direction;
  });
}
