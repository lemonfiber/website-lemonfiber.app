// Shapes for everything the site derives from the GitHub org — "the motor".
// Kept deliberately small: only the fields a page actually renders.

export interface Repo {
  name: string;
  description: string;
  language: string;
  url: string;
  homepage?: string;
  stars: number;
  openIssues: number;
  latestRelease?: string; // tag name, e.g. "v0.1.0"
  pushedAt?: string; // ISO
  role: string; // human label: "canonical", "binary", "stack"…
  primary?: boolean;
}

export interface Issue {
  title: string;
  url: string;
  repo: string;
  number: number;
  labels: string[];
  createdAt: string;
}

export interface Release {
  repo: string;
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  // Pre-1.0, every release is a prerelease. Hiding them would show a project
  // that has never shipped, so they are carried and marked.
  prerelease?: boolean;
}

export interface SiteData {
  generatedAt: string;
  live: boolean; // true when GitHub was reachable at build time
  stars: number; // org total
  repos: Repo[];
  goodFirstIssues: Issue[];
  releases: Release[];
}
