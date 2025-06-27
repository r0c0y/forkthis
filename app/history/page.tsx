"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HistoryItem {
  type: string;
  detail: string;
  timestamp: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("forkthis-history") || "[]");
    setHistory(stored);
  }, []);

  const handleRemove = (idx: number) => {
    const updated = [...history];
    updated.splice(idx, 1);
    setHistory(updated);
    localStorage.setItem("forkthis-history", JSON.stringify(updated));
  };


  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🕓 History</h1>
      {history.length === 0 ? (
        <p className="text-gray-500">No history yet.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((item, i) => (
            <li key={i} className="border rounded p-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">{item.type}</span>: {item.detail}
                <span className="ml-2 text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              <button
                onClick={() => handleRemove(i)}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => router.push("/")}
        className="mt-6 text-sm underline text-blue-600"
      >
        ← Back to Home
      </button>
      <button
        onClick={() => {
          setHistory([]);
          localStorage.setItem("forkthis-history", "[]");
        }}
        className="mt-4 text-xs bg-red-200 text-red-700 px-3 py-1 rounded hover:bg-red-300"
      >
        Clear All History
      </button>
    </main>
  );
}