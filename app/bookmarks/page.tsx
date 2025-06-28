// app/bookmarks/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchIssues } from "@/lib/github";
import { GitHubIssue } from "@/types/github";

interface ExtendedIssue extends GitHubIssue {
  repo: string;
}

export default function BookmarksPage() {
  const [bookmarkedIssuesByRepo, setBookmarkedIssuesByRepo] = useState<Record<string, ExtendedIssue[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllBookmarks = async () => {
      const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
      const repos = Object.keys(allBookmarks).filter(Boolean);
      const result: Record<string, ExtendedIssue[]> = {};

      for (const repo of repos) {
        const issueNumbers: number[] = allBookmarks[repo];
        if (!issueNumbers.length) continue;
        try {
          const repoIssues = await fetchIssues(repo);
          result[repo] = repoIssues
            .filter((issue) => issueNumbers.includes(issue.number))
            .map((issue) => ({ ...issue, repo }));
        } catch {
          result[repo] = [];
        }
      }
      setBookmarkedIssuesByRepo(result);
      setLoading(false);
    };
    loadAllBookmarks();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">⭐ All Bookmarked Issues</h1>
      <Link href="/" className="text-sm underline text-black mb-4 block">
        ← Back to Home
      </Link>
      {loading && <p>Loading...</p>}
      {!loading && Object.keys(bookmarkedIssuesByRepo).length === 0 && (
        <p className="text-gray-500">No bookmarked issues found.</p>
      )}
      {!loading && Object.entries(bookmarkedIssuesByRepo).map(([repo, issues]) => (
        <div key={repo} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{repo}</h2>
          {issues.length === 0 ? (
            <p className="text-gray-400 text-sm mb-4">No issues bookmarked for this repo.</p>
          ) : (
            <ul className="space-y-4">
              {issues.map((issue) => (
                <li key={repo + "-" + issue.number} className="border p-4 rounded shadow-sm">
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 underline"
                  >
                    #{issue.number} - {issue.title}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    {issue.state === "open" ? "🟢 Open" : "🔴 Closed"}
                  </p>
                  <button
                    onClick={() => {
                      const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
                      allBookmarks[repo] = (allBookmarks[repo] || []).filter(
                        (n: number) => n !== issue.number
                      );
                      localStorage.setItem("bookmarkedIssues", JSON.stringify(allBookmarks));
                      setBookmarkedIssuesByRepo((prev) => {
                        const updated = { ...prev };
                        updated[repo] = updated[repo].filter((i) => i.number !== issue.number);
                        return updated;
                      });
                    }}
                    className="mt-2 text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                  >
                    Remove Bookmark
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </main>
  );
}