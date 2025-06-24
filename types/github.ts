export interface GitHubUser {
  login: string;
}

export interface GitHubIssue {
  id: number;
  title: string;
  number: number;
  html_url: string;
  user: GitHubUser;
  body?: string;
  pull_request?: object; // ✅ more specific than `any`
  summary?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Unknown";

}