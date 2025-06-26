"use client";

import { useState, useEffect } from "react";
import { useCallback } from "react"; // add this with other imports

import Image from "next/image";
import RepoSearchBar from "@/components/RepoSearchBar";
import { fetchIssues } from "@/lib/github";
import { summarizeIssue } from "@/lib/ai";
import { GitHubIssue } from "@/types/github";
import DifficultyFilter from "@/components/DifficultyFilter";
import AISummaryToggle from "@/components/AISummaryToggle";
import ThemeSelector from "@/components/ThemeSelector";
import IssueControls from "@/components/IssueControls";

interface ExtendedIssue extends GitHubIssue {
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
}

export default function Home() {
  const [issues, setIssues] = useState<ExtendedIssue[]>([]);
  const [allIssues, setAllIssues] = useState<ExtendedIssue[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterLabel, setFilterLabel] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showBeginnerOnly, setShowBeginnerOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [nextIndex, setNextIndex] = useState(10);
  const [lastRepoSearched, setLastRepoSearched] = useState("");

  const handleSearch = useCallback(async (repo: string) => {
    setError("");
    setIssues([]);
    setAllIssues([]);
    setLoading(true);
    setLastRepoSearched(repo);
    localStorage.setItem("lastRepo", repo); // ✅ Save repo name for bookmark page

    try {
      const result = await fetchIssues(repo);
      const extended: ExtendedIssue[] = await Promise.all(
        result.map(async (issue) => {
          let summary = "";
          let difficulty: ExtendedIssue["difficulty"] = "Unknown";
          if (showSummary) {
            try {
              const res = await summarizeIssue(issue.body || "");
              summary = res.summary;
              difficulty = res.difficulty;
            } catch (e) {
              console.error("Summary error:", e);
            }
          }
          return {
            ...issue,
            summary,
            difficulty,
          };
        })
      );

      setAllIssues(extended);
      setIssues(extended.slice(0, 10));
      setNextIndex(10);
    } catch (err) {
      console.error("GitHub fetch error:", err);
      setError("Failed to fetch issues. Check repo name.");
    } finally {
      setLoading(false);
    }
  }, [showSummary]);

  // 🆕 Load state from localStorage project (if present)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookmarkedIssues") || "[]");
    setBookmarks(stored);

    const savedProject = localStorage.getItem("forkthis-project");
    if (savedProject) {
      const parsed = JSON.parse(savedProject);
      setFilter(parsed.filter || "All");
      setFilterLabel(parsed.filterLabel || "");
      setSortOrder(parsed.sortOrder || "newest");
      setShowOpenOnly(parsed.showOpenOnly || false);
      setShowBeginnerOnly(parsed.showBeginnerOnly || false);
      setShowBookmarksOnly(parsed.showBookmarksOnly || false);
      setShowSummary(parsed.showSummary || false);
      if (parsed.repo) handleSearch(parsed.repo);
    }
  }, [handleSearch]); // ✅ include handleSearch now that it's memoized

  useEffect(() => {
    const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
    setBookmarks(allBookmarks[lastRepoSearched] || []);
  }, [lastRepoSearched]);

  const toggleBookmark = (issueNumber: number) => {
    const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
    const repo = lastRepoSearched;
    const current = allBookmarks[repo] || [];

    const updatedRepoBookmarks = current.includes(issueNumber)
      ? current.filter((n: number)=> n !== issueNumber)
      : [...current, issueNumber];

    allBookmarks[repo] = updatedRepoBookmarks;
    setBookmarks(updatedRepoBookmarks);
    localStorage.setItem("bookmarkedIssues", JSON.stringify(allBookmarks));
  };

  const saveProject = () => {
    const name = prompt("Enter a name for this project:");
    if (!name) return;
    const projectData = {
      filter,
      filterLabel,
      sortOrder,
      showOpenOnly,
      showBeginnerOnly,
      showBookmarksOnly,
      showSummary,
      repo: lastRepoSearched,
    };
    localStorage.setItem(`forkthis-project:${name}`, JSON.stringify(projectData));
    alert("✅ Project saved!");
  };

  const handleClearProject = () => {
    localStorage.removeItem("forkthis-project");
    setFilter("All");
    setFilterLabel("");
    setSortOrder("newest");
    setShowOpenOnly(false);
    setShowBeginnerOnly(false);
    setShowBookmarksOnly(false);
    setShowSummary(false);
    setIssues([]);
    setAllIssues([]);
    setLastRepoSearched("");
    alert("Project reset.");
  };

  // Remove unused handleRepoInput, and use handleSearch directly via RepoSearchBar
  const allLabels = Array.from(
    new Set(allIssues.flatMap((issue) => issue.labels.map((label) => label.name)))
  );

  const filteredIssues = issues
    .filter((issue) => (showBookmarksOnly ? bookmarks.includes(issue.number) : true))
    .filter((issue) =>
      filterLabel === "" || filterLabel === "All"
        ? true
        : issue.labels.some((label) => label.name === filterLabel)
    )
    .filter((issue) => (filter === "All" ? true : issue.difficulty === filter))
    .filter((issue) => (showOpenOnly ? issue.state === "open" : true))
    .filter((issue) =>
      showBeginnerOnly
        ? issue.labels.some((label) =>
            /good first issue|beginner|easy/i.test(label.name)
          )
        : true
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else if (sortOrder === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">🚀 ForkThis</h1>
      <a href="/projects" className="text-sm underline text-blue-600 hover:text-blue-800">
  🗂 View Saved Projects
      </a>
      <a
  href="/bookmarks"
  className="text-sm underline text-blue-600 hover:text-blue-800 block mt-2"
>
  ⭐ View Bookmarked Issues
</a>
      <p className="text-gray-500 text-center mt-2">
        Find beginner-friendly GitHub issues.
      </p>

      <RepoSearchBar onSearch={handleSearch} />
      <button
        onClick={saveProject}
        className="text-xs border rounded px-2 py-1 mt-2 text-blue-700 border-blue-500 hover:bg-blue-50"
      >
        💾 Save This Project
      </button>
      <button
        onClick={handleClearProject}
        className="text-xs border rounded px-2 py-1 mt-2 ml-2 text-red-700 border-red-500 hover:bg-red-50"
      >
        🗑 Reset Project
      </button>
      <DifficultyFilter selected={filter} onChange={setFilter} />
      <ThemeSelector />
      <AISummaryToggle enabled={showSummary} onToggle={() => setShowSummary(!showSummary)} />

      <label className="text-sm flex items-center gap-1 mt-2">
        <input
          type="checkbox"
          checked={showOpenOnly}
          onChange={() => setShowOpenOnly(!showOpenOnly)}
          className="accent-blue-600"
        />
        Show only open issues
      </label>
      <label className="text-sm flex items-center gap-1 mt-2">
        <input
          type="checkbox"
          checked={showBeginnerOnly}
          onChange={() => setShowBeginnerOnly(!showBeginnerOnly)}
          className="accent-green-600"
        />
        Show only beginner-friendly issues
      </label>
      <label className="text-sm flex items-center gap-1 mt-2">
        <input
          type="checkbox"
          checked={showBookmarksOnly}
          onChange={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className="accent-yellow-500"
        />
        Show only bookmarked issues
      </label>

      <IssueControls
        allLabels={allLabels}
        filterLabel={filterLabel}
        setFilterLabel={setFilterLabel}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {loading && <p className="text-center mt-6 text-blue-500">⏳ Loading issues...</p>}

      {filteredIssues.length === 0 && !loading ? (
        <p className="text-center text-gray-400 mt-8">No issues match this filter.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {filteredIssues.map((issue) => (
            <li key={issue.number} className="border p-4 rounded-md shadow-sm">
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline decoration-dotted"
              >
                #{issue.number} - {issue.title}
              </a>

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

              <div className="flex flex-wrap gap-1 mt-1">
                {issue.labels.map((label) => {
                  const isBeginnerLabel = /good first issue|beginner|easy/i.test(label.name);
                  return (
                    <span
                      key={label.name}
                      className={
                        "text-xs px-2 py-0.5 rounded-full font-medium " +
                        (isBeginnerLabel
                          ? "bg-green-600 text-white border border-green-800"
                          : "text-white")
                      }
                      style={!isBeginnerLabel ? { backgroundColor: `#${label.color}` } : {}}
                    >
                      {label.name}
                    </span>
                  );
                })}
              </div>

              {showSummary && issue.summary && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  💬 {issue.summary}
                </p>
              )}

              <span className="inline-block mt-2 px-2 py-1 bg-gray-200 rounded text-sm font-medium">
                Difficulty: {issue.difficulty}
              </span>

              <p className="text-xs mt-1">
                {issue.state === "open" ? "🟢 Open" : "🔴 Closed"} • Updated {new Date(issue.updated_at).toLocaleDateString()}
              </p>

              <button
                onClick={() => toggleBookmark(issue.number)}
                className="mt-2 text-sm px-3 py-1 rounded-md transition-all flex items-center gap-1"
                style={{
                  backgroundColor: bookmarks.includes(issue.number)
                    ? "rgb(229 231 235)"
                    : "rgb(229 231 235)",
                  color: bookmarks.includes(issue.number) ? "rgb(37 99 235)" : "inherit",
                  border: bookmarks.includes(issue.number)
                    ? "1px solid rgb(37 99 235)"
                    : "1px solid transparent",
                }}
              >
                {bookmarks.includes(issue.number) ? "⭐ Bookmarked" : "⭐ Bookmark"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {issues.length < allIssues.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => {
              const nextChunk = allIssues.slice(nextIndex, nextIndex + 10);
              setIssues((prev) => [...prev, ...nextChunk]);
              setNextIndex((prev) => prev + 10);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
}
