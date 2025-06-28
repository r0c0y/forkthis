// app/learn-fork/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { GuideSection, GuideTitle } from '../../components/Guide';
import RepoSearchBar from "@/components/RepoSearchBar";
function AISummaryToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`border rounded px-2 py-1 text-xs ${
        enabled
          ? "bg-green-100 text-green-800 border-green-400"
          : "bg-gray-100 text-gray-700 border-gray-400"
      }`}
      aria-pressed={enabled}
    >
      {enabled ? "✅ AI Summary On" : "❌ AI Summary Off"}
    </button>
  );
}

export default function LearnForkPage() {
  const [showSummary, setShowSummary] = useState(false);

  function saveProject() {
    // TODO: implement the logic to save the project
    alert("Project saved!");
  }

  function handleClearProject() {
    // TODO: implement the logic to clear/reset the project
    alert("Project reset!");
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
       <nav className="mb-6">
        <ul className="flex flex-wrap gap-4 text-sm text-blue-700 underline">
          <li><a href="#search">Search</a></li>
          <li><a href="#bookmark">Bookmark</a></li>
          <li><a href="#ai">AI Summaries</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#fork">Fork</a></li>
          <li><a href="#build">Build In Public</a></li>
        </ul>
      </nav>
      <h1 className="text-4xl font-bold">🧠 Learn to Fork</h1>
      <p className="text-gray-600 text-lg">
        ForkThis is a super-tool to help you explore GitHub issues, learn, contribute,
        and build your open source journey. Here’s how to use it like a pro:
      </p>

      <GuideSection id="search">
        <GuideTitle>1️⃣ Search for Repositories</GuideTitle>
        {/* SearchBar similar to home page */}
        <div className="my-4">
          {/* Import and use the actual SearchBar component from your home page */}
          {/* Example: */}
          <RepoSearchBar onSearch={function (): void {
            throw new Error("Function not implemented.");
          } } /> 
          <p className="text-xs text-gray-500 mt-1">
            Use the search bar above to find repositories or issues to work on.
          </p>
        </div>
      </GuideSection>

      <GuideSection id="bookmark">
        <GuideTitle>2️⃣ Bookmark & Organize</GuideTitle>
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
      </GuideSection>

      <GuideSection id="ai">
        <GuideTitle>3️⃣ Use AI Summaries</GuideTitle>
        <AISummaryToggle enabled={showSummary} onToggle={() => setShowSummary(!showSummary)} />
      </GuideSection>

      <GuideSection id="projects">
        <GuideTitle>4️⃣ Save Projects</GuideTitle>
        <Link href="/projects" className="text-blue-600 underline text-sm hover:text-blue-800">
          📁 View Saved Projects
        </Link>
      </GuideSection>

      <GuideSection id="fork">
        <GuideTitle>5️⃣ Fork the Repo</GuideTitle>
        <p className="text-gray-700 text-sm">
          Found an issue you like? Click the &#39;Fork&#39; button on the top right of the issue page to create a copy of the repo under your account.
        </p>
      </GuideSection>

      <GuideSection id="build">
        <GuideTitle>6️⃣ Build In Public</GuideTitle>
        <p className="text-gray-700 text-sm">
          Share your progress and get feedback! Consider streaming your coding sessions or posting updates on social media.
        </p>
      </GuideSection>

      <div className="mt-8 flex flex-col items-center">
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mb-2"
        >
          🚀 Start Forking
        </Link>
        <a href="#" className="text-xs text-blue-600 underline">Back to top ↑</a>
      </div>
    </main>
  );
}
