export async function summarizeIssue(issueBody: string): Promise<{
  summary: string;
  difficulty: string;
}> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You're an assistant that summarizes GitHub issues in 1 line and estimates their difficulty (Easy, Medium, or Hard).",
        },
        {
          role: "user",
          content: `Summarize this GitHub issue in 1 line and estimate its difficulty:\n\n${issueBody}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenAI error:", await res.text());
    throw new Error("OpenAI request failed");
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "";

  const match = reply.match(/(Easy|Medium|Hard)/i);
  const difficulty = match?.[1] || "Unknown";

  return {
    summary: reply.trim(),
    difficulty,
  };
}
