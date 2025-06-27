"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RepoSearchBar from "@/components/RepoSearchBar";
import { fetchIssues } from "@/lib/github";
import { summarizeIssue } from "@/lib/ai";
import { GitHubIssue } from "@/types/github";
import DifficultyFilter from "@/components/DifficultyFilter";
import AISummaryToggle from "@/components/AISummaryToggle";
import ThemeSelector from "@/components/ThemeSelector";
import IssueControls from "@/components/IssueControls";
import Link from "next/link";
import { logHistory } from "@/lib/history";
import IssueCard from "@/components/IssueCard";

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
  const [fetchId, setFetchId] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- SEARCH & BACKGROUND FETCH ---
  const handleSearch = useCallback(async (repo: string) => {
    const currentFetchId = fetchId + 1;
    setFetchId(currentFetchId);

    setError("");
    setIssues([]);
    setAllIssues([]);
    setLoading(true);
    setLastRepoSearched(repo);
    localStorage.setItem("lastRepo", repo);

    // Load bookmarks for this repo
    const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
    setBookmarks(allBookmarks[repo] || []);

    try {
      // Fetch first page (show instantly)
      const firstPage = await fetchIssues(repo);
      const extendedFirst: ExtendedIssue[] = await Promise.all(
        firstPage.map(async (issue) => {
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
          return { ...issue, summary, difficulty };
        })
      );
      if (fetchId + 1 !== currentFetchId) return; // Cancel if new search started
      setIssues(extendedFirst.slice(0, 10));
      setAllIssues(extendedFirst);
      setNextIndex(10);
      setLoading(false);

      // Fetch the rest in the background
      // If fetchIssues fetches all issues, no need to fetch more pages here.
    } catch {
      if (fetchId + 1 !== currentFetchId) return;
      setError("Failed to fetch issues. Check repo name.");
      setLoading(false);
    }

    logHistory("Search", `Searched repo ${repo}`);
  }, [showSummary, fetchId]);

  // --- LOAD PROJECT FROM LOCALSTORAGE ---
  useEffect(() => {
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
    //eslint-disable-next-line
  }, []);

  // --- SYNC STATE FROM URL ---
  useEffect(() => {

    const repoFromUrl = searchParams.get("repo");
    if (!repoFromUrl) return;

    setFilter(searchParams.get("filter") || "All");
    setFilterLabel(searchParams.get("filterLabel") || "");
    setSortOrder(searchParams.get("sortOrder") || "newest");
    setShowOpenOnly(searchParams.get("showOpenOnly") === "true");
    setShowBeginnerOnly(searchParams.get("showBeginnerOnly") === "true");
    setShowBookmarksOnly(searchParams.get("showBookmarksOnly") === "true");
    setShowSummary(searchParams.get("showSummary") === "true");
    setLastRepoSearched(repoFromUrl);

    // Load bookmarks for this repo
    const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
    setBookmarks(allBookmarks[repoFromUrl] || []);

    handleSearch(repoFromUrl);
    // eslint-disable-next-line
  }, []);

  // --- SYNC STATE TO URL ---
  useEffect(() => {
    const params = new URLSearchParams();
    if (lastRepoSearched) params.set("repo", lastRepoSearched);
    if (filter !== "All") params.set("filter", filter);
    if (filterLabel) params.set("filterLabel", filterLabel);
    if (sortOrder !== "newest") params.set("sortOrder", sortOrder);
    if (showOpenOnly) params.set("showOpenOnly", "true");
    if (showBeginnerOnly) params.set("showBeginnerOnly", "true");
    if (showBookmarksOnly) params.set("showBookmarksOnly", "true");
    if (showSummary) params.set("showSummary", "true");
    router.push("/?" + params.toString());
    // eslint-disable-next-line
  }, [filter, filterLabel, sortOrder, showOpenOnly, showBeginnerOnly, showBookmarksOnly, showSummary, lastRepoSearched]);

  // --- BOOKMARK HANDLERS ---
  const toggleBookmark = (issueNumber: number) => {
    const repo = lastRepoSearched;
    if (!repo) return; // Prevent empty repo keys!
    const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
    const current = allBookmarks[repo] || [];

    let updatedRepoBookmarks: number[];
    let action: "Bookmark" | "Remove Bookmark";
    if (current.includes(issueNumber)) {
      updatedRepoBookmarks = current.filter((n: number) => n !== issueNumber);
      action = "Remove Bookmark";
    } else {
      updatedRepoBookmarks = [...current, issueNumber];
      action = "Bookmark";
    }

    allBookmarks[repo] = updatedRepoBookmarks;
    setBookmarks(updatedRepoBookmarks);
    localStorage.setItem("bookmarkedIssues", JSON.stringify(allBookmarks));

    logHistory(action, `${action} issue #${issueNumber} in ${repo}`);
  };

  const handleRemoveBookmark = (issueNumber: number) => {
    const allBookmarks = JSON.parse(localStorage.getItem("bookmarkedIssues") || "{}");
    const repo = lastRepoSearched;
    const current = allBookmarks[repo] || [];

    const updatedRepoBookmarks = current.filter((n: number) => n !== issueNumber);

    allBookmarks[repo] = updatedRepoBookmarks;
    setBookmarks(updatedRepoBookmarks);
    localStorage.setItem("bookmarkedIssues", JSON.stringify(allBookmarks));

    logHistory("Remove Bookmark", `Removed issue #${issueNumber} from ${lastRepoSearched}`);
  };

  // --- PROJECT SAVE/RESET ---
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

    logHistory("Save Project", `Saved project: ${name}`);
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

    logHistory("Reset Project", "Reset all filters and cleared issues");
  };

  // --- LABELS & FILTERS ---
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

  const generateShareURL = () => {
    const params = new URLSearchParams({
      repo: lastRepoSearched,
      filter,
      filterLabel,
      sortOrder,
      showOpenOnly: showOpenOnly.toString(),
      showBeginnerOnly: showBeginnerOnly.toString(),
      showBookmarksOnly: showBookmarksOnly.toString(),
      showSummary: showSummary.toString(),
    });
    return `${window.location.origin}/?${params.toString()}`;
  };

  const handleCopyLink = () => {
    const url = generateShareURL();
    navigator.clipboard.writeText(url);
    alert("📋 Link copied to clipboard!");
  };

  // --- RENDER ---
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center">🚀 ForkThis</h1>
      <Link href="/projects" className="text-blue-600 underline text-sm hover:text-blue-800">
        📁 View Saved Projects
      </Link>
      <Link href="/bookmarks" className="text-sm underline text-blue-600 hover:text-blue-800 block mt-2">
        ⭐ View Bookmarked Issues
      </Link>
      <Link href="/history" className="text-sm underline text-blue-600 hover:text-blue-800 block mt-2">
        🕓 View History
      </Link>
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
            <IssueCard
              key={issue.number}
              issue={issue}
              isBookmarked={bookmarks.includes(issue.number)}
              onBookmark={() => toggleBookmark(issue.number)}
              onRemoveBookmark={() => handleRemoveBookmark(issue.number)}
            />
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

      <button
        onClick={handleCopyLink}
        className="mt-2 text-sm text-blue-600 underline"
      >
        🔗 Copy Shareable Project Link
      </button>
    </main>
  );
}
// --- END OF FILE ---
// --- IGNORE ---
// This is a generated file. Do not edit manually.
// This file is part of the ForkThis project, which helps users find beginner-friendly GitHub issues to contribute to open source.

