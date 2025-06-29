
import { useState, useCallback } from 'react';
import { logHistory } from '@/lib/history';

export function useBookmarks(repo: string) {
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const loadBookmarks = useCallback(() => {
    const allBookmarks = JSON.parse(localStorage.getItem('bookmarkedIssues') || '{}');
    setBookmarks(allBookmarks[repo] || []);
  }, [repo]);

  const toggleBookmark = (issueNumber: number) => {
    const allBookmarks = JSON.parse(localStorage.getItem('bookmarkedIssues') || '{}');
    const current = allBookmarks[repo] || [];

    let updatedRepoBookmarks: number[];
    let action: 'Bookmark' | 'Remove Bookmark';
    if (current.includes(issueNumber)) {
      updatedRepoBookmarks = current.filter((n: number) => n !== issueNumber);
      action = 'Remove Bookmark';
    } else {
      updatedRepoBookmarks = [...current, issueNumber];
      action = 'Bookmark';
    }

    allBookmarks[repo] = updatedRepoBookmarks;
    setBookmarks(updatedRepoBookmarks);
    localStorage.setItem('bookmarkedIssues', JSON.stringify(allBookmarks));

    logHistory(action, `${action} issue #${issueNumber} in ${repo}`);
  };

  return { bookmarks, loadBookmarks, toggleBookmark };
}
