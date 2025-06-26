// app/api/issues/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GitHubIssue } from "@/types/github";
import { GitHubLabel } from "@/types/github";

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

  const simplifiedIssues = data
    .filter((issue: GitHubIssue) => !issue.pull_request)
    .map((issue: GitHubIssue) => ({
      number: issue.number,
      title: issue.title,
      body: issue.body,
      html_url: issue.html_url,
      user: {
        login: issue.user.login,
        avatar_url: issue.user.avatar_url,
      },
      labels: (issue.labels || []).map((label: GitHubLabel) => ({
        name: label.name,
        color: label.color,
      })),
    }));

  console.log(`✅ [API] Issues fetched for ${repo}:`, simplifiedIssues.length);
  return NextResponse.json(simplifiedIssues);
}
