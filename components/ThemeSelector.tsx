"use client";
import { useState, useEffect } from "react";

const themes = ["light", "dark", "cyberpunk", "terminal", "luxe"];

export default function ThemeSelector() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  return (
    <div className="mt-4 flex gap-2 flex-wrap justify-center">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-3 py-1 rounded-full border ${
            theme === t ? "bg-gray-800 text-white dark:bg-white dark:text-black" : ""
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
