"use client";

import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = ["light", "dark", "midnight", "cyberpunk"];

  return (
    <div className="flex justify-center mt-4 gap-2">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-3 py-1 rounded-full border ${
            theme === t ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
