"use client";

import { useState } from "react";

type Props = {
  onSearch: (repo: string) => void;
};

export default function RepoSearchBar({ onSearch }: Props) {
  const [repoInput, setRepoInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onSearch(repoInput.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-6">
      <input
        type="text"
        placeholder="e.g. vercel/next.js"
        value={repoInput}
        onChange={(e) => setRepoInput(e.target.value)}
        className="border px-4 py-2 rounded-md w-full shadow-sm"
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        Search
      </button>
    </form>
  );
}
