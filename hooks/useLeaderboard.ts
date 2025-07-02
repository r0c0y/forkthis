import { useState, useCallback, useRef } from 'react';
import { fetchIssues } from '@/lib/github';
import { GitHubIssue, GitHubUser } from '@/types/github';
import { logHistory } from '@/lib/history';

interface LeaderboardEntry {
  user: GitHubUser;
  count: number;
}

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0);

  const generateLeaderboard = useCallback(async (repo: string) => {
    const currentFetchId = ++fetchIdRef.current;

    setError('');
    setLeaderboardData([]);
    setLoading(true);

    try {
      // Fetch all pages of issues. GitHub API returns up to 100 issues per page.
      // We might need to handle pagination if a repo has more than 100 issues.
      // For now, let's assume one page is enough for popular repos or simplify.
      // The fetchIssues function in lib/github.ts already fetches 100 issues.
      // To get ALL issues, we'd need to implement pagination in fetchIssues or here.
      // For this initial version, we'll work with the first 100 issues.
      const issues: GitHubIssue[] = await fetchIssues(repo);

      if (fetchIdRef.current !== currentFetchId) return;

      const userCounts: { [key: string]: LeaderboardEntry } = {};

      issues.forEach(issue => {
        if (issue.user) {
          const login = issue.user.login;
          if (!userCounts[login]) {
            userCounts[login] = {
              user: issue.user,
              count: 0,
            };
          }
          userCounts[login].count++;
        }
      });

      const sortedLeaderboard = Object.values(userCounts).sort((a, b) => b.count - a.count);

      setLeaderboardData(sortedLeaderboard);
      setLoading(false);
      logHistory('Leaderboard', `Generated leaderboard for repo ${repo}`);

    } catch (err) {
      if (fetchIdRef.current !== currentFetchId) return;
      console.error('Leaderboard generation error:', err);
      setError('Failed to generate leaderboard. Check repo name or API rate limits.');
      setLoading(false);
    }
  }, []);

  return { leaderboardData, error, loading, generateLeaderboard };
}
