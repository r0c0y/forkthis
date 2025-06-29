
import { useState } from 'react';

export function useFilters() {
  const [filter, setFilter] = useState('All');
  const [filterLabel, setFilterLabel] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showBeginnerOnly, setShowBeginnerOnly] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const resetFilters = () => {
    setFilter('All');
    setFilterLabel('');
    setSortOrder('newest');
    setShowOpenOnly(false);
    setShowBeginnerOnly(false);
    setShowBookmarksOnly(false);
  };

  return {
    filter, setFilter,
    filterLabel, setFilterLabel,
    sortOrder, setSortOrder,
    showOpenOnly, setShowOpenOnly,
    showBeginnerOnly, setShowBeginnerOnly,
    showBookmarksOnly, setShowBookmarksOnly,
    resetFilters
  };
}
