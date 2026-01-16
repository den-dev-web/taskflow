const listeners = {};

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function emit(event, payload) {
  if (!listeners[event]) return;
  listeners[event].forEach((cb) => cb(payload));
}
