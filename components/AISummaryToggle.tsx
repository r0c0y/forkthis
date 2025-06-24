"use client";
type Props = {
  enabled: boolean;
  onToggle: () => void;
};

export default function AISummaryToggle({ enabled, onToggle }: Props) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <label className="text-sm font-medium">AI Summary:</label>
      <button
        onClick={onToggle}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          enabled ? "bg-green-600 text-white" : "bg-gray-300 text-gray-700"
        }`}
      >
        {enabled ? "On" : "Off"}
      </button>
    </div>
  );
}
