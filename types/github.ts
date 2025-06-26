export interface GitHubUser {
  login: string;
  avatar_url: string;
}
export interface GitHubLabel {
  name: string;
  color: string;
}

export interface GitHubIssue {
  id: number;
  title: string;
  number: number;
  html_url: string;
  user: GitHubUser;
  body: string;
  labels: GitHubLabel[];
  state: "open" | "closed";
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  closed_at?: string; // ISO date string, optional if issue is still open
  comments: number;
  assignee?: GitHubUser | null; //
  pull_request?: object; // ✅ more specific than `any`
  summary?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Unknown";

}