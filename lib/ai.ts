type Difficulty = "Easy" | "Medium" | "Hard" | "Unknown";

interface SummaryResult {
  summary: string;
  difficulty: Difficulty;
}

export async function summarizeIssue(
  issueBody: string
): Promise<SummaryResult> {
  const res = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: issueBody }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("AI summary (local) error:", errorText);
    throw new Error(`Local summary API failed: ${errorText}`);
  }

  const data = await res.json();
  return {
    summary: data.summary,
    difficulty: data.difficulty || "Unknown",
  };
}
