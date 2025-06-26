"use client";

import { useState } from "react";
import Image from "next/image";
import RepoSearchBar from "@/components/RepoSearchBar";
import { fetchIssues } from "@/lib/github";
import { summarizeIssue } from "@/lib/ai";
import { GitHubIssue } from "@/types/github";
import DifficultyFilter from "@/components/DifficultyFilter";
import AISummaryToggle from "@/components/AISummaryToggle";
import ThemeSelector from "@/components/ThemeSelector";
import IssueTooltip from "@/components/IssueTooltip";
import IssueControls from "@/components/IssueControls";

interface ExtendedIssue extends GitHubIssue {
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
}

export default function Home() {
  const [issues, setIssues] = useState<ExtendedIssue[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterLabel, setFilterLabel] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const allLabels = Array.from(
    new Set(
      issues.flatMap(issue => issue.labels.map(label => label.name))
    )
  );

  // Filtering and sorting logic (single source of truth)
  let filteredIssues = issues;
  if (filterLabel) {
    filteredIssues = filteredIssues.filter(issue =>
      issue.labels.some(label => label.name === filterLabel)
    );
  }
  if (filter !== "All") {
    filteredIssues = filteredIssues.filter(issue => issue.difficulty === filter);
  }
  if (sortOrder === "newest") {
    filteredIssues = filteredIssues.slice().sort((a, b) => b.number - a.number);
  } else if (sortOrder === "oldest") {
    filteredIssues = filteredIssues.slice().sort((a, b) => a.number - b.number);
  } else if (sortOrder === "title") {
    filteredIssues = filteredIssues.slice().sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  const handleSearch = async (repo: string) => {
    setError("");
    setIssues([]);
    setLoading(true);

    try {
      const result = await fetchIssues(repo);

      const detailedIssues = await Promise.all(
        result.map(async (issue): Promise<ExtendedIssue> => {
          if (!showSummary) {
            return {
              ...issue,
              summary: "",
              difficulty: "Unknown",
            };
          }

          try {
            const summaryData = await summarizeIssue(issue.body || "");

            if (!summaryData.summary || summaryData.summary.trim() === "") {
              throw new Error("Empty summary");
            }

            return {
              ...issue,
              summary: summaryData.summary,
              difficulty: summaryData.difficulty,
            };
          } catch (err) {
            console.error("AI error:", err);
            if (
              err instanceof Error &&
              err.message.includes("insufficient_quota")
            ) {
              setError(
                "AI summary failed due to insufficient quota. Please check your OpenAI plan and billing details."
              );
            }
            return {
              ...issue,
              summary: "Couldn't summarize issue.",
              difficulty: "Unknown",
            };
          }
        })
      );

      setIssues(detailedIssues);
    } catch (err) {
      console.error("GitHub fetch error:", err);
      setError("Failed to fetch issues. Check repo name.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">🚀 ForkThis</h1>
      <p className="text-gray-500 text-center mt-2">
        Find beginner-friendly GitHub issues.
      </p>

      <RepoSearchBar onSearch={handleSearch} />
      <DifficultyFilter selected={filter} onChange={setFilter} />
      <ThemeSelector />
      <AISummaryToggle
        enabled={showSummary}
        onToggle={() => setShowSummary(!showSummary)}
      />

      <IssueControls
        allLabels={allLabels}
        filterLabel={filterLabel}
        setFilterLabel={setFilterLabel}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {loading && (
        <p className="text-center mt-6 text-blue-500">⏳ Loading issues...</p>
      )}

      {filteredIssues.length === 0 && !loading ? (
        <p className="text-center text-gray-400 mt-8">
          No issues match this filter.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {filteredIssues.map((issue) => (
            <li key={issue.number} className="border p-4 rounded-md shadow-sm">
              {/* Title + summary tooltip */}
              {showSummary &&
              issue.summary &&
              issue.summary !== "Couldn't summarize issue." ? (
                <IssueTooltip content={issue.summary}>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 underline decoration-dotted"
                    aria-label={`Go to GitHub issue ${issue.title}`}
                  >
                    #{issue.number} - {issue.title}
                  </a>
                </IssueTooltip>
              ) : (
                <a
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 underline decoration-dotted"
                  aria-label={`Go to GitHub issue ${issue.title}`}
                >
                  #{issue.number} - {issue.title}
                </a>
              )}

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

              {/* Optional inline summary */}
              {showSummary &&
                issue.summary &&
                issue.summary !== "Couldn't summarize issue." && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    💬 {issue.summary}
                  </p>
                )}

              <span className="inline-block mt-2 px-2 py-1 bg-gray-200 rounded text-sm font-medium">
                Difficulty: {issue.difficulty}
              </span>

              {/* Status Badge */}
              <p className="text-xs mt-1">
                {issue.state === "open" ? "🟢 Open" : "🔴 Closed"} • Updated {new Date(issue.updated_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
