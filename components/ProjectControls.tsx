
interface ProjectControlsProps {
  saveProject: () => void;
  clearProject: () => void;
  copyLink: () => void;
}

export default function ProjectControls({ saveProject, clearProject, copyLink }: ProjectControlsProps) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={saveProject}
        className="text-xs border rounded px-2 py-1 text-blue-700 border-blue-500 hover:bg-blue-50"
      >
        💾 Save This Project
      </button>
      <button
        onClick={clearProject}
        className="text-xs border rounded px-2 py-1 text-red-700 border-red-500 hover:bg-red-50"
      >
        🗑 Reset Project
      </button>
      <button
        onClick={copyLink}
        className="text-sm text-blue-600 underline"
      >
        🔗 Copy Shareable Project Link
      </button>
    </div>
  );
}
