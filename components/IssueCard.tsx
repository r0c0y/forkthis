// components/IssueCard.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface IssueCardProps {
  issue: {
    number: number;
    title: string;
    user: { login: string; avatar_url: string };
    body: string;
    html_url: string;
    labels: { name: string; color: string }[];
    state: "open" | "closed";
    updated_at: string;
  };
  isBookmarked: boolean;
  onBookmark: () => void;
  onRemoveBookmark: () => void;
}

export default function IssueCard({
  issue,
  isBookmarked,
  onBookmark,
  onRemoveBookmark,
}: IssueCardProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [showForkModal, setShowForkModal] = useState(false);

  const handleSummaryClick = async () => {
    if (summary || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: issue.body || "No body text provided." }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: { summary?: string } = await res.json();
      setSummary(data.summary ?? "⚠️ No summary returned");
    } catch (e) {
      console.error("Summary fetch error:", e);
      setSummary("⚠️ Failed to load summary");
    } finally {
      setLoading(false);
      setVisible(true);
    }
  };

  return (
    <div
      className={cn(
        "group relative border rounded-xl hover:shadow-md transition-all",
        "p-4 sm:p-6 md:p-8",
        isBookmarked && "bg-yellow-50 border-yellow-400"
      )}
    >
      <a
        href={issue.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 font-medium text-base sm:text-lg"
      >
        #{issue.number} - {issue.title}
      </a>

      {/* Avatar and user */}
      <div className="flex items-center gap-2 mb-1 mt-1">
        <Image
          src={issue.user.avatar_url}
          alt={issue.user.login}
          width={24}
          height={24}
          className="w-6 h-6 rounded-full"
        />
        <p className="text-xs sm:text-sm text-gray-500">by {issue.user.login}</p>
      </div>

      {/* Status and update info */}
      <p className="text-xs sm:text-sm mt-1">
        {issue.state === "open" ? "🟢 Open" : "🔴 Closed"} •{" "}
        {`Updated ${new Date(issue.updated_at).toLocaleDateString()}`}
      </p>

      {/* Label Tags */}
      <div className="flex flex-wrap gap-1 mt-1">
        {issue.labels.map((label) => (
          <span
            key={label.name}
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: `#${label.color}` }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Hover button */}
      <button
        onClick={handleSummaryClick}
        className="absolute right-4 top-4 bg-white border border-gray-300 px-2 py-1 text-xs rounded shadow hidden group-hover:block"
        aria-busy={loading}
        aria-live="polite"
        disabled={loading}
      >
        {loading ? "Loading..." : "🔍 View Summary"}
      </button>

      {/* Summary display */}
      {visible && summary && (
        <div className="mt-2 text-sm text-gray-800">
          <p className="text-gray-600">💡 {summary}</p>
        </div>
      )}

      {/* Bookmark/Remove buttons */}
      <div className="flex gap-2 mt-2">
        {isBookmarked && (
          <button
            onClick={onRemoveBookmark}
            className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
          >
            🗑 Remove Bookmark
          </button>
        )}
        <button
          onClick={onBookmark}
          className={`text-sm px-3 py-1 rounded border ${
            isBookmarked
              ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
              : "bg-gray-200 border-gray-300 hover:bg-gray-300"
          }`}
        >
          ⭐ {isBookmarked ? "Toggle Bookmark" : "Bookmark"}
        </button>
      </div>

      {/* Fork button */}
      <button
        onClick={() => setShowForkModal(true)}
        className="mt-2 text-sm px-3 py-1 bg-purple-600 text-white rounded"
      >
        🧠 Fork
      </button>

      {/* Fork modal */}
      {showForkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Fork this repo?</h2>
            <p className="text-sm mb-4 text-gray-600">
              Want to fork{" "}
              <strong>
                {issue.html_url.split("/").slice(0, 5).join("/")}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="text-sm px-3 py-1 bg-gray-300 rounded"
                onClick={() => setShowForkModal(false)}
              >
                Cancel
              </button>
              <button
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => {
                  const repoUrl = issue.html_url.split("/").slice(0, 5).join("/");
                  window.open(`${repoUrl}/fork`, "_blank");
                  setShowForkModal(false);
                }}
              >
                Fork Now
              </button>
              <button
                className="text-sm px-3 py-1 bg-green-600 text-white rounded"
                onClick={() => {
                  setShowForkModal(false);
                  window.location.href = "/learn-fork";
                }}
              >
                Learn Forking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
