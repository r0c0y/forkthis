"use client";

type Props = {
  selected: string;
  onChange: (value: string) => void;
};

export default function DifficultyFilter({ selected, onChange }: Props) {
  const difficulties = ["All", "Easy", "Medium", "Hard", "Unknown"];

  return (
    <div className="flex justify-center mt-6">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="border px-4 py-2 rounded-md shadow-sm"
      >
        {difficulties.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </div>
  );
}
