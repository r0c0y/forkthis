
import { useState, useCallback, useRef } from 'react';
import { fetchIssues } from '@/lib/github';
import { summarizeIssue } from '@/lib/ai';
import { GitHubIssue } from '@/types/github';
import { logHistory } from '@/lib/history';

interface ExtendedIssue extends GitHubIssue {
  summary: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
}

export function useIssues(showSummary: boolean) {
  const [issues, setIssues] = useState<ExtendedIssue[]>([]);
  const [allIssues, setAllIssues] = useState<ExtendedIssue[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextIndex, setNextIndex] = useState(10);
  const fetchIdRef = useRef(0);

  const handleSearch = useCallback(async (repo: string) => {
    const currentFetchId = ++fetchIdRef.current;

    setError('');
    setIssues([]);
    setAllIssues([]);
    setLoading(true);

    try {
      const firstPage = await fetchIssues(repo);
      const extendedFirst: ExtendedIssue[] = await Promise.all(
        firstPage.map(async (issue) => {
          let summary = '';
          let difficulty: ExtendedIssue['difficulty'] = 'Unknown';
          if (showSummary) {
            try {
              const res = await summarizeIssue(issue.body || '');
              summary = res.summary;
              difficulty = res.difficulty;
            } catch (e) {
              console.error('Summary error:', e);
            }
          }
          return { ...issue, summary, difficulty };
        })
      );
      if (fetchIdRef.current !== currentFetchId) return;
      setIssues(extendedFirst.slice(0, 10));
      setAllIssues(extendedFirst);
      setNextIndex(10);
      setLoading(false);
    } catch {
      if (fetchIdRef.current !== currentFetchId) return;
      setError('Failed to fetch issues. Check repo name.');
      setLoading(false);
    }

    logHistory('Search', `Searched repo ${repo}`);
  }, [showSummary]);

  const loadMore = () => {
    const nextChunk = allIssues.slice(nextIndex, nextIndex + 10);
    setIssues((prev) => [...prev, ...nextChunk]);
    setNextIndex((prev) => prev + 10);
  };

  return { issues, allIssues, error, loading, handleSearch, loadMore, setIssues, setAllIssues };
}
