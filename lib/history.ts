export function logHistory(type: string, detail: string) {
  const history = JSON.parse(localStorage.getItem("forkthis-history") || "[]");
  history.unshift({ type, detail, timestamp: Date.now() });
  localStorage.setItem("forkthis-history", JSON.stringify(history.slice(0, 100)));
}