// app/bookmarks/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchIssues } from "@/lib/github";
import { GitHubIssue } from "@/types/github";

interface ExtendedIssue extends GitHubIssue {
  summary?: string;
  repo?: string;
}

export default function BookmarksPage() {
  const [issues, setIssues] = useState<ExtendedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
        const repos = Object.keys(allBookmarks);
        let allBookmarkedIssues: ExtendedIssue[] = [];

        console.log("allBookmarks", allBookmarks);
        console.log("repos", repos);
        console.log("allBookmarkedIssues", allBookmarkedIssues);

        for (const repo of repos) {
          if (!repo) continue; // Skip empty repo keys!
          const issueNumbers: number[] = allBookmarks[repo];
          if (!issueNumbers.length) continue;
          const repoIssues = await fetchIssues(repo);
          const filtered = repoIssues
            .filter((issue) => issueNumbers.includes(issue.number))
            .map((issue) => ({ ...issue, repo }));
          allBookmarkedIssues = [...allBookmarkedIssues, ...filtered];
        }

        setIssues(allBookmarkedIssues);
      } catch (e) {
        console.error("Bookmark load error:", e);
        setError("Failed to load bookmarks.");
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">⭐ Bookmarked Issues</h1>
      <Link href="/" className="text-sm underline text-black mb-4 block">
        ← Back to Home
      </Link>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && issues.length === 0 && (
        <p className="text-gray-500">No bookmarked issues found.</p>
      )}
      <ul className="space-y-4">
        {issues.map((issue) => (
          <li key={issue.repo + "-" + issue.number} className="border p-4 rounded shadow-sm">
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline"
            >
              [{issue.repo}] #{issue.number} - {issue.title}
            </a>
            <p className="text-xs text-gray-500 mt-1">
              {issue.state === "open" ? "🟢 Open" : "🔴 Closed"}
            </p>
            <button
              onClick={() => {
                if (!issue.repo) return; // Type guard: skip if repo is undefined
                const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
                allBookmarks[issue.repo] = (allBookmarks[issue.repo] || []).filter(
                  (n: number) => n !== issue.number
                );
                localStorage.setItem("bookmarkedIssues", JSON.stringify(allBookmarks));
                setIssues((prev) =>
                  prev.filter((i) => !(i.repo === issue.repo && i.number === issue.number))
                );
              }}
              className="mt-2 text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Remove Bookmark
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}