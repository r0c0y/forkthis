import React from "react";

interface IssueControlsProps {
  allLabels: string[];
  filterLabel: string;
  setFilterLabel: (label: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A-Z" },
];

export default function IssueControls({
  allLabels,
  filterLabel,
  setFilterLabel,
  sortOrder,
  setSortOrder,
}: IssueControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-4">
      {/* Label Filter */}
      <div>
        <label className="mr-2 text-sm font-medium">Filter by Label:</label>
        <select
          value={filterLabel}
          onChange={e => setFilterLabel(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="">All</option>
          {allLabels.map(label => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {/* Sort Dropdown */}
      <div>
        <label className="mr-2 text-sm font-medium">Sort:</label>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}