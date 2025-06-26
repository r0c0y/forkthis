// app/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SavedProject {
  name: string;
  data: Record<string, unknown>;
}

export default function SavedProjectsPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const router = useRouter();

  useEffect(() => {
    const entries = Object.entries(localStorage)
      .filter(([key]) => key.startsWith("forkthis-project:"))
      .map(([key, value]) => ({
        name: key.replace("forkthis-project:", ""),
        data: JSON.parse(value),
      }));
    setProjects(entries);
  }, []);

  const handleLoad = (project: SavedProject) => {
    localStorage.setItem("forkthis-project", JSON.stringify(project.data));
    router.push("/");
  };

  const handleDelete = (name: string) => {
    localStorage.removeItem(`forkthis-project:${name}`);
    setProjects(projects.filter((p) => p.name !== name));
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">📦 Saved Projects</h1>

      {projects.length === 0 ? (
        <p className="text-gray-500">No saved projects found.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.name} className="border p-4 rounded shadow-sm">
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-sm text-gray-500 mb-2">
                Repo: {typeof project.data.repo === "string" ? project.data.repo : ""}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(project)}
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                >
                  🔄 Load
                </button>
                <button
                  onClick={() => handleDelete(project.name)}
                  className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-6 text-sm underline text-blue-600"
      >
        ← Back to Home
      </button>
    </main>
  );
}
