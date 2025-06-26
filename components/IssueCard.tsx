// components/IssueCard.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";

interface IssueCardProps {
  issue: {
    number: number;
    title: string;
    user: {
      login: string;
      avatar_url: string;
    };
    body: string;
    html_url: string;
    labels: { name: string; color: string }[];
    state: "open" | "closed";
    updated_at: string;
  };
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

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
        "group relative border p-4 rounded-xl hover:shadow-md transition-all",
        loading && "opacity-50"
      )}
    >
      <a
        href={issue.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 font-medium text-sm"
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
        <p className="text-xs text-gray-500">by {issue.user.login}</p>
      </div>

      {/* Status and update info */}
      <p className="text-xs mt-1">
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
    </div>
  );
}
