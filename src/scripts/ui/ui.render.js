import { on } from "../events.js";
import { renderTasks } from "./ui.tasks.js";
import { renderModalState } from "./ui.modal.js";

on("tasks:updated", renderTasks);
on("modal:updated", renderModalState);
