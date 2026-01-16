import { state, setState } from "./state.js";
import { emit } from "./events.js";
import { safeSet } from "./storage.js";

export function createTask(data) {
  const newTask = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description.trim(),
    priority: data.priority,
    completed: data.completed === "true",
    createdAt: Date.now(),
  };

  const tasks = [...state.tasks, newTask];

  setState({
    tasks,
    ui: { ...state.ui, lastCreatedTaskId: newTask.id },
  });
  persist(tasks);

  emit("tasks:updated");
}

export function updateTask(id, patch) {
  const tasks = state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));

  setState({ tasks });
  persist(tasks);

  emit("tasks:updated");
}

export function toggleCompleted(id) {
  const t = state.tasks.find((task) => task.id === id);
  updateTask(id, { completed: !t.completed });
}

function persist(tasks) {
  safeSet("tasks", tasks);
}

export function deleteTask(id) {
  const tasks = state.tasks.filter((t) => t.id !== id);
  setState({ tasks });
  persist(tasks);
  emit("tasks:updated");
}

export function createSubtask(parentId, data) {
  const subtask = {
    id: crypto.randomUUID(),
    parentId,
    title: data.title.trim(),
    description: data.description.trim(),
    priority: data.priority,
    completed: false,
    createdAt: Date.now(),
  };

  const tasks = [...state.tasks, subtask];

  setState({ tasks });
  persist(tasks);
  emit("tasks:updated");
}

export function reorderTasks(orderedIds) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return;

  const tasksById = new Map(state.tasks.map((task) => [task.id, task]));
  const orderedTasks = orderedIds
    .map((id) => tasksById.get(id))
    .filter(Boolean);

  if (orderedTasks.length === 0) return;

  const orderedSet = new Set(orderedTasks.map((task) => task.id));
  let index = 0;

  const tasks = state.tasks.map((task) =>
    orderedSet.has(task.id) ? orderedTasks[index++] : task
  );

  setState({ tasks });
  persist(tasks);
  emit("tasks:updated");
}
