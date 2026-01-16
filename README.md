# TaskFlow

TaskFlow is a single-page task manager built with vanilla JavaScript and Vite, focused on productivity-oriented UX and clean UI patterns.

🔗 Live demo: https://den-dev-web.github.io/taskflow/

---

## 📌 About the Project

TaskFlow is designed as a lightweight, offline-first to-do application for everyday task management.  
The project demonstrates how a feature-rich SPA can be built **without frameworks**, using modular JavaScript, clear state management, and custom UI components.

---

## ✨ Key Features

- Task and subtask creation/editing via modal dialog
- Task statuses (active / completed) and priority levels
- Sorting by date and priority
- Search by title and description
- Context menu on task cards (edit / delete / add subtask)
- Inline editing via double-click (title and description)
- Drag-and-drop task reordering
- Light / dark theme with persisted user preference
- Empty and error states
- Skeleton loaders for loading states

---

## ⚙️ Tech Stack

- **Vite** — project bundling and development server
- **Vanilla JavaScript (ES Modules)** — application logic
- **Sass (main.scss)** — styling and theme management
- **HTML5** — semantic markup
- **LocalStorage** — persistent task storage with safe wrappers

---

## 🧩 Architecture & Implementation

- Modular JavaScript architecture with explicit responsibility separation
- Lightweight event layer (`events.js`) for decoupled communication
- Centralized application state (`state.js`)
- Task domain logic isolated in a service layer (`tasks.service.js`)
- Filtering and sorting logic separated into dedicated modules (`tasks.filters.js`)
- Custom UI components:
  - segmented controls
  - custom select elements
  - draggable modal dialog
- State-driven UI updates and predictable rendering

---

## 🎯 What This Project Demonstrates

- Ability to design and implement SPA-like applications without frameworks
- Clean separation of UI, state, and domain logic
- Attention to UX details and interaction patterns
- Custom component development without external libraries
- Maintainable structure suitable for further scaling

---

## 🚀 Possible Improvements

- Keyboard shortcuts for faster task management
- Task grouping and tags
- Data export/import
- API-based synchronization

