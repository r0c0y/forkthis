"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RepoSearchBar from "@/components/RepoSearchBar";

import SessionWrapper from "@/components/SessionWrapper";
import { useSession } from "next-auth/react";
import { useIssues } from "@/hooks/useIssues";
import { useFilters } from "@/hooks/useFilters";
import { useBookmarks } from "@/hooks/useBookmarks";
import IssueList from "@/components/IssueList";
import FilterControls from "@/components/FilterControls";
import ProjectControls from "@/components/ProjectControls";
import Header from "@/components/Header";

export default function Home() {
  return (
    <SessionWrapper>
      <HomeContent />
    </SessionWrapper>
  );
}

function HomeContent() {
  const [showSummary, setShowSummary] = useState(false);
  const { issues, allIssues, error, loading, handleSearch, loadMore, setIssues, setAllIssues } = useIssues(showSummary);
  const { 
    filter, setFilter, 
    filterLabel, setFilterLabel, 
    sortOrder, setSortOrder, 
    showOpenOnly, setShowOpenOnly, 
    showBeginnerOnly, setShowBeginnerOnly, 
    showBookmarksOnly, setShowBookmarksOnly, 
    resetFilters 
  } = useFilters();
  const [lastRepoSearched, setLastRepoSearched] = useState("");
  const { bookmarks, loadBookmarks, toggleBookmark } = useBookmarks(lastRepoSearched);
  const [lastSession, setLastSession] = useState<Record<string, unknown> | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  useSession();

  const onSearch = useCallback((repo: string) => {
    setLastRepoSearched(repo);
    handleSearch(repo);
  }, [handleSearch]);

  useEffect(() => {
    if(lastRepoSearched) loadBookmarks();
  }, [lastRepoSearched, loadBookmarks])

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
      if (parsed.repo) onSearch(parsed.repo);
    }

    const session = localStorage.getItem("forkthis-last-session");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setLastSession(parsed);
        setShowRestorePrompt(true);
      } catch {
        // ignore
      }
    }
  }, [onSearch, setFilter, setFilterLabel, setSortOrder, setShowOpenOnly, setShowBeginnerOnly, setShowBookmarksOnly]);

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
    onSearch(repoFromUrl);
  }, [searchParams, onSearch, setFilter, setFilterLabel, setSortOrder, setShowOpenOnly, setShowBeginnerOnly, setShowBookmarksOnly]);

  // --- SYNC STATE TO URL ---
  useEffect(() => {
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
    router.push("/?" + params.toString());
  }, [router, lastRepoSearched, filter, filterLabel, sortOrder, showOpenOnly, showBeginnerOnly, showBookmarksOnly, showSummary]);

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
  };

  const handleClearProject = () => {
    localStorage.removeItem("forkthis-project");
    resetFilters();
    setIssues([]);
    setAllIssues([]);
    setLastRepoSearched("");
    alert("Project reset.");
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
      <Header />
      <h1 className="text-4xl font-bold text-center">🚀 ForkThis</h1>
      <p className="text-gray-500 text-center mt-2">
        Find beginner-friendly GitHub issues.
      </p>

      <RepoSearchBar onSearch={onSearch} />
      <ProjectControls saveProject={saveProject} clearProject={handleClearProject} copyLink={handleCopyLink} />
      <FilterControls 
        filter={filter}
        setFilter={setFilter}
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        showOpenOnly={showOpenOnly}
        setShowOpenOnly={setShowOpenOnly}
        showBeginnerOnly={showBeginnerOnly}
        setShowBeginnerOnly={setShowBeginnerOnly}
        showBookmarksOnly={showBookmarksOnly}
        setShowBookmarksOnly={setShowBookmarksOnly}
        allLabels={allLabels}
        filterLabel={filterLabel}
        setFilterLabel={setFilterLabel}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      <IssueList 
        issues={filteredIssues}
        loading={loading}
        bookmarks={bookmarks}
        toggleBookmark={toggleBookmark}
      />

      {issues.length < allIssues.length && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Load More
          </button>
        </div>
      )}

      {showRestorePrompt && lastSession && (
        <div className="bg-yellow-100 border border-yellow-300 p-4 mb-4 rounded shadow-sm">
          <p className="mb-2 font-medium">🕘 Previous session detected:</p>
          <p className="text-sm mb-3">
            Restore project <strong>{typeof lastSession.repo === "string" ? lastSession.repo : "previous project"}</strong>?
          </p>
          <div className="flex gap-4">
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded"
              onClick={() => {
                setShowRestorePrompt(false);
                if (lastSession.repo) {
                  onSearch(lastSession.repo as string);
                  setFilter(lastSession.filter as string || "All");
                  setFilterLabel(lastSession.filterLabel as string || "");
                  setSortOrder(lastSession.sortOrder as string || "newest");
                  setShowOpenOnly(!!lastSession.showOpenOnly);
                  setShowBeginnerOnly(!!lastSession.showBeginnerOnly);
                  setShowBookmarksOnly(!!lastSession.showBookmarksOnly);
                  setShowSummary(!!lastSession.showSummary);
                }
              }}
            >
              🔁 Restore Session
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => setShowRestorePrompt(false)}
            >
              ❌ Dismiss
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

