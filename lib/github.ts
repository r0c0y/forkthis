import { GitHubIssue } from "@/types/github";

export async function fetchIssues(repo: string): Promise<GitHubIssue[]> {
  const res = await fetch("/api/issues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repo }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Failed to fetch issues");
  }

  return await res.json();
}
