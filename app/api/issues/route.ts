import { NextRequest, NextResponse } from "next/server";
import { GitHubIssue } from "@/types/github"; // ✅ CORRECT

export async function POST(req: NextRequest) {
  const { repo } = await req.json();
  const [owner, repoName] = repo.split("/");

  if (!owner || !repoName) {
    return NextResponse.json({ error: "Invalid repo format" }, { status: 400 });
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "GitHub API error" }, { status: res.status });
  }

  const data = await res.json();
  const filtered = data.filter((issue: GitHubIssue) => !issue.pull_request);

  return NextResponse.json(filtered);
}
