import DifficultyFilter from "./DifficultyFilter";
import AISummaryToggle from "./AISummaryToggle";
import IssueControls from "./IssueControls";

interface FilterControlsProps {
  filter: string;
  setFilter: (filter: string) => void;
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  showOpenOnly: boolean;
  setShowOpenOnly: (show: boolean) => void;
  showBeginnerOnly: boolean;
  setShowBeginnerOnly: (show: boolean) => void;
  showBookmarksOnly: boolean;
  setShowBookmarksOnly: (show: boolean) => void;
  allLabels: string[];
  filterLabel: string;
  setFilterLabel: (label: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

export default function FilterControls({
  filter, setFilter,
  showSummary, setShowSummary,
  showOpenOnly, setShowOpenOnly,
  showBeginnerOnly, setShowBeginnerOnly,
  showBookmarksOnly, setShowBookmarksOnly,
  allLabels,
  filterLabel,
  setFilterLabel,
  sortOrder,
  setSortOrder
}: FilterControlsProps) {
  return (
    <>
      <DifficultyFilter selected={filter} onChange={setFilter} />
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
    </>
  );
}