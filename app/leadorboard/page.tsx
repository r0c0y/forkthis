"use client"; // Required for hooks and event handlers

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useLeaderboard } from '@/hooks/useLeaderboard';
import LeaderboardCard from '@/components/LeaderboardCard';
import RepoSearchBar from '@/components/RepoSearchBar'; // Assuming this can be reused

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const { leaderboardData, error, loading, generateLeaderboard } = useLeaderboard();
  const [currentRepo, setCurrentRepo] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin"); // Redirect to sign-in if not authenticated
    }
  }, [status]);

  const handleSearch = (searchRepo: string) => {
    if (searchRepo) {
      setCurrentRepo(searchRepo); // Set current repo when search is initiated
      generateLeaderboard(searchRepo);
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-8">Loading session...</p>;
  }

  if (!session) {
    // This should ideally be handled by the useEffect redirect,
    // but as a fallback:
    return <p className="text-center mt-8">Please sign in to view the leaderboard.</p>;
  }

  const topThree = leaderboardData.slice(0, 3);
  const restOfTheBoard = leaderboardData.slice(3);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-100">Project Contributor Leaderboard</h1>

      <RepoSearchBar onSearch={handleSearch} />

      {loading && <p className="text-center text-blue-400 mt-6">Loading leaderboard data for <span className="font-semibold">{currentRepo}</span>...</p>}
      {error && <p className="text-center text-red-500 mt-6">{error}</p>}

      {!loading && !error && currentRepo && leaderboardData.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No contributions found for <span className="font-semibold">{currentRepo}</span>, or the repository might be empty/invalid.
        </p>
      )}

      {leaderboardData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">
            Top Contributors for <span className="font-bold text-blue-400">{currentRepo}</span>
          </h2>

          {/* Podium for Top Three */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {topThree.map((entry, index) => (
                <div key={entry.user.login} className={index === 0 ? 'md:col-span-1 md:row-start-1 md:col-start-2' : ''}>
                   <LeaderboardCard user={entry.user} count={entry.count} rank={index + 1} />
                </div>
              ))}
            </div>
          )}

          {/* Rest of the Leaderboard */}
          {restOfTheBoard.length > 0 && (
            <div>
              {restOfTheBoard.map((entry, index) => (
                <LeaderboardCard key={entry.user.login} user={entry.user} count={entry.count} rank={index + 4} />
              ))}
            </div>
          )}
        </div>
      )}
       {!currentRepo && !loading && (
        <div className="text-center mt-12">
            <p className="text-xl text-gray-400">Enter a repository (e.g., <code className="bg-gray-700 p-1 rounded">owner/repo</code>) to see its leaderboard.</p>
        </div>
      )}
    </main>
  );
}
