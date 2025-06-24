"use client";

import { useState } from "react";
import RepoSearchBar from "@/components/RepoSearchBar";
import { fetchIssues } from "@/lib/github";
import { summarizeIssue } from "@/lib/ai";
import { GitHubIssue } from "@/types/github";
import DifficultyFilter from "@/components/DifficultyFilter";

// 🔥 Extend the GitHubIssue type to include AI-generated fields
interface ExtendedIssue extends GitHubIssue {
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
}

export default function Home() {
  const [issues, setIssues] = useState<ExtendedIssue[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const handleSearch = async (repo: string) => {
    setError("");
    setIssues([]);

    try {
      const result = await fetchIssues(repo);

      const detailedIssues = await Promise.all(
        result.map(async (issue): Promise<ExtendedIssue> => {
          try {
            const summaryData = await summarizeIssue(issue.body || "");
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

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {filteredIssues.length === 0 ? (
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
                className="font-medium text-blue-600"
              >
                #{issue.number} - {issue.title}
              </a>
              <p className="text-sm text-gray-500">by {issue.user.login}</p>
              <p className="mt-1 text-gray-700 italic">{issue.summary}</p>
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
