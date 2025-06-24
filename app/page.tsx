"use client";

import { useState } from "react";
import RepoSearchBar from "@/components/RepoSearchBar";
import { fetchIssues } from "@/lib/github";
import { summarizeIssue } from "@/lib/ai";
import { GitHubIssue } from "@/types/github";
import DifficultyFilter from "@/components/DifficultyFilter";
import ThemeToggle from "@/components/ThemeToggle";
import AISummaryToggle from "@/components/AISummaryToggle";
import ThemeSelector from "@/components/ThemeSelector";

interface ExtendedIssue extends GitHubIssue {
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
}

export default function Home() {
  const [issues, setIssues] = useState<ExtendedIssue[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [showSummary, setShowSummary] = useState(true);
  const [loading, setLoading] = useState(false);

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

            if (!summaryData.summary || summaryData.summary.length < 10) {
              throw new Error("Empty summary");
            }

            return {
              ...issue,
              summary: summaryData.summary,
              difficulty: summaryData.difficulty as
                | "Easy"
                | "Medium"
                | "Hard"
                | "Unknown",
            };
          } catch (err) {
            console.error("AI error:", err);
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

  const filteredIssues = issues.filter(
    (issue) => filter === "All" || issue.difficulty === filter
  );

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">🚀 ForkThis</h1>
      <p className="text-gray-500 text-center mt-2">
        Find beginner-friendly GitHub issues.
      </p>

      <RepoSearchBar onSearch={handleSearch} />
      <DifficultyFilter selected={filter} onChange={setFilter} />
      <ThemeToggle />
      <ThemeSelector />
      <AISummaryToggle
        enabled={showSummary}
        onToggle={() => setShowSummary(!showSummary)}
      />

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {loading && <p className="text-center mt-6 text-blue-500">⏳ Loading issues...</p>}

      {filteredIssues.length === 0 && !loading ? (
        <p className="text-center text-gray-400 mt-8">
          No issues match this filter.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {filteredIssues.map((issue) => (
            <li key={issue.id} className="border p-4 rounded-md shadow-sm">
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline decoration-dotted"
                aria-label={`Go to GitHub issue ${issue.title}`}
              >
                #{issue.number} - {issue.title}
              </a>
              <p className="text-sm text-gray-500 mt-1">by {issue.user.login}</p>
              {showSummary && issue.summary && issue.summary !== "Couldn't summarize issue." && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  💬 {issue.summary}
                </p>
              )}
              <span className="inline-block mt-2 px-2 py-1 bg-gray-200 rounded text-sm font-medium">
                Difficulty: {issue.difficulty}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
