// app/bookmarks/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchIssues } from "@/lib/github";
import { GitHubIssue } from "@/types/github";

interface ExtendedIssue extends GitHubIssue {
  summary?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Unknown";
}

export default function BookmarksPage() {
  const [issues, setIssues] = useState<ExtendedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("bookmarkedIssues") || "[]");
        const repo = localStorage.getItem("lastRepo") || "vercel/next.js";
        const all = await fetchIssues(repo);
        const filtered = all.filter((issue) => stored.includes(issue.number));
        setIssues(filtered);
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
      <Link href="/">← Back to Home</Link>

      {loading ? (
        <p className="text-blue-500 mt-4">Loading...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : issues.length === 0 ? (
        <p className="text-gray-500 mt-4">No bookmarks found.</p>
      ) : (
        <ul className="space-y-4 mt-4">
          {issues.map((issue) => (
            <li key={issue.number} className="border p-4 rounded shadow-sm">
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline"
              >
                #{issue.number} - {issue.title}
              </a>
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src={issue.user.avatar_url}
                  alt={issue.user.login}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                <p className="text-xs text-gray-500">by {issue.user.login}</p>
              </div>
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