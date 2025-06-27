import { GitHubIssue } from "@/types/github";

// Token rotation
const tokens = (process.env.GITHUB_TOKENS || "").split(",").filter(Boolean);
let tokenIndex = 0;

// 🔁 Token retry logic
async function fetchWithRetry(url: string) {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[tokenIndex];
    tokenIndex = (tokenIndex + 1) % tokens.length;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    console.log("X-RateLimit-Remaining:", res.headers.get("X-RateLimit-Remaining"));

    if (res.status === 403 || res.status === 401) {
      console.warn(`⚠️ Token ${i + 1} failed (rate-limited or invalid), trying next...`);
      continue;
    }

    if (!res.ok) {
      throw new Error(`GitHub API failed with status ${res.status}`);
    }

    return res;
  }

  throw new Error("All GitHub tokens are exhausted or invalid.");
}

// 🧠 Exported function used by your app
export async function fetchIssues(repo: string, page = 1): Promise<GitHubIssue[]> {
  const [owner, name] = repo.split("/");
  const url = `https://api.github.com/repos/${owner}/${name}/issues?per_page=100&page=${page}`;
  const res = await fetchWithRetry(url);
  const data = await res.json();

  if (!Array.isArray(data)) return [];

  // Filter out pull requests
  return data.filter((issue: GitHubIssue) => !issue.pull_request);
}
