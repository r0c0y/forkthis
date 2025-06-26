// app/api/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";

type Provider = "openai" | "openrouter" | "gemini" | "groq";
type Difficulty = "Easy" | "Medium" | "Hard" | "Unknown";

interface ModelConfig {
  model: string;
  provider: Provider;
  getKey: () => string | undefined;
}

async function summarizeWithModel(
  issueBody: string,
  model: string,
  apiKey: string,
  provider: Provider
) {
  console.log(`⚙️ Using model: ${model} via ${provider}...`);
  console.log(`🔑 API Key Starts with: ${apiKey?.slice(0, 6)}...`);

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize this GitHub issue in 1 line and estimate difficulty (Easy, Medium, Hard):\n\n${issueBody}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = reply.match(/(Easy|Medium|Hard)/i);
    const difficulty = (match?.[1] || "Unknown") as Difficulty;
    return { summary: reply.trim(), difficulty };
  }

  if (provider === "groq") {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You're an assistant that summarizes GitHub issues in 1 line and estimates difficulty.",
          },
          {
            role: "user",
            content: `Summarize this GitHub issue and estimate difficulty (Easy, Medium, Hard):\n\n${issueBody}`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "";
    const match = reply.match(/(Easy|Medium|Hard)/i);
    const difficulty = (match?.[1] || "Unknown") as Difficulty;
    return { summary: reply.trim(), difficulty };
  }

  // OpenAI or OpenRouter
  const url =
    provider === "openai"
      ? "https://api.openai.com/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://forkthis.app";
    headers["X-Title"] = "ForkThis";
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You're an assistant that summarizes GitHub issues in 1 line and estimates their difficulty.",
        },
        {
          role: "user",
          content: `Summarize this GitHub issue and estimate difficulty (Easy, Medium, Hard):\n\n${issueBody}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "";
  const match = reply.match(/(Easy|Medium|Hard)/i);
  const difficulty = (match?.[1] || "Unknown") as Difficulty;
  return { summary: reply.trim(), difficulty };
}

export async function POST(req: NextRequest) {
  const { body: issueBodyRaw } = await req.json();
  const issueBody = issueBodyRaw && issueBodyRaw.trim().length > 0
    ? issueBodyRaw
    : "No body text provided.";

  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const modelsToTry: ModelConfig[] = [
    { model: "llama3-8b-8192", provider: "groq", getKey: () => groqKey },
    { model: "mixtral-8x7b-32768", provider: "groq", getKey: () => groqKey },
    { model: "gemini-2.0-flash", provider: "gemini", getKey: () => geminiKey },
    // If you want to use OpenAI's latest model, add it here:
    { model: "gpt-4o-mini", provider: "openai", getKey: () => openaiKey },
    // Fallback to gpt-3.5-turbo if needed:
    { model: "gpt-3.5-turbo", provider: "openai", getKey: () => openaiKey },
    // Optionally add OpenRouter here if you want:
    { model: "gpt-3.5-turbo", provider: "openrouter", getKey: () => openrouterKey },
  ];

  for (const config of modelsToTry) {
    const key = config.getKey();
    if (!key) continue;

    try {
      const result = await summarizeWithModel(
        issueBody,
        config.model,
        key,
        config.provider
      );
      return NextResponse.json(result);
    } catch (err) {
      console.warn(`❌ ${config.model} via ${config.provider} failed:`, (err as Error).message);
    }
  }

  return NextResponse.json(
    { error: "AI summary failed. All fallback models failed." },
    { status: 500 }
  );
}
