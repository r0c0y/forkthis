import { GitHubIssue } from "@/types/github";

export async function fetchIssues(repo: string): Promise<GitHubIssue[]> {
  const [owner, name] = repo.split("/");
  const all: GitHubIssue[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}/issues?per_page=100&page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) break;

    const data = await res.json();
    const filtered = data.filter((issue: GitHubIssue) => !issue.pull_request);
    all.push(...filtered);
    if (data.length < 100) break;

    page++;
  }

  return all;
}

