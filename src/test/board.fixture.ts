// A small board snapshot in format 1, for the unit tests: two areas, two
// features, a requirement of each status, three versions (one released, one
// releasable, one planned), a tracker, a draft and a ready pull request
// contesting a goal and a bot's, a repository of each tracker state, a release
// and a proposal of each kind.

import type { Board, Goal, Version } from "../lib/board";

const goal = (id: string, verdict: Goal["verdict"]): Goal => ({
  id,
  verdict,
  cited_in: [],
  done_in: [],
  partial_in: [],
  landed_in: [],
  claims: [],
});

const version = (
  v: string,
  status: string,
  milestone: string | null,
  goals: Goal[],
): Version => ({
  version: v,
  status,
  milestone,
  delivers: null,
  released_on: status === "released" ? "2026-01-01" : null,
  released_as: null,
  repos: ["lemonfiber"],
  satisfied_in: ["lemonfiber"],
  prereleases: [],
  goals,
});

export function fixtureBoard(): Board {
  return {
    format: 1,
    generated_at: "2026-10-08T00:00:00Z",
    ref: "HEAD",
    sources: { spec: "a".repeat(40), lemonfiber: "b".repeat(40) },
    unread: [{ repo: "sdk-php", reason: "sdk-php keeps no tracker" }],
    areas: [
      { id: "B", name: "Running it", directory: "b-running" },
      { id: "A", name: "Getting started", directory: "a-getting-started" },
    ],
    features: [
      {
        id: "A1",
        title: "First run",
        area: "A",
        audience: "operator",
        kind: "feature",
        status: "accepted",
        maturity: "shipped",
        shipped: "0.1.0",
        priority: null,
        labels: [],
        requires: [],
        relates: [],
        path: "a-getting-started/a1-first-run.md",
        versions: [{ version: "0.1.0", status: "released" }],
      },
      {
        id: "B1",
        title: "Forms",
        area: "B",
        audience: "operator",
        kind: "feature",
        status: "draft",
        maturity: "planned",
        shipped: null,
        priority: null,
        labels: [],
        requires: [],
        relates: [],
        path: "b-running/b1-forms.md",
        versions: [],
      },
    ],
    requirements: [
      req("A1-R1", "accepted"),
      req("A1-R2", "withdrawn"),
      req("B1-R1", "draft"),
      req("GOV-R1", "superseded"),
    ],
    versions: [
      version("0.1.0", "released", "M1", [goal("A1-R1", "met")]),
      version("0.2.0", "releasable", null, [
        goal("A1-R1", "met"),
        goal("B1-R1", "met"),
      ]),
      version("0.3.0", "planned", "M2", [
        goal("B1-R1", "open"),
        goal("A1-R1", "unknown"),
        goal("GOV-R2", "claimed"),
      ]),
    ],
    trackers: [
      {
        repo: "lemonfiber",
        present: true,
        rows: [
          {
            id: "A1-R1",
            state: "done",
            evidence: ["src/a.rs"],
            landed: null,
            path: "status/A1.toml",
          },
        ],
      },
    ],
    pulls: [
      {
        repo: "lemonfiber",
        number: 7,
        url: "https://github.com/lemonfiber/lemonfiber/pull/7",
        title: "feat: forms",
        author: "someone",
        bot: false,
        draft: true,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-02T00:00:00Z",
        head: "feat/forms",
        last_commit_at: "2026-09-01T00:00:00Z",
        stale: true,
        cites: ["GOV-R2"],
      },
      {
        repo: "lemonfiber",
        number: 8,
        url: "https://github.com/lemonfiber/lemonfiber/pull/8",
        title: "feat: the rule",
        author: "another",
        bot: false,
        draft: false,
        created_at: "2026-10-07T12:00:00Z",
        updated_at: "2026-10-07T12:00:00Z",
        head: "feat/rule",
        last_commit_at: "2026-10-07T12:00:00Z",
        stale: false,
        cites: ["GOV-R2"],
      },
      {
        repo: "spec",
        number: 9,
        url: "https://github.com/lemonfiber/spec/pull/9",
        title: "chore(deps): bump",
        author: "dependabot",
        bot: true,
        draft: false,
        created_at: null,
        updated_at: null,
        head: null,
        last_commit_at: null,
        stale: false,
        cites: [],
      },
    ],
    claims: { cap: 3, stale_days: 14 },
    contested: [{ id: "GOV-R2", pulls: ["lemonfiber#7", "lemonfiber#8"] }],
    repos: [
      { ...repo("spec", null), pages: ["../README.md"], open_pulls: 1 },
      {
        ...repo("lemonfiber", "present"),
        pages: ["lemonfiber.md"],
        open_pulls: 2,
        counted_pulls: 2,
      },
      {
        ...repo("sdk-php", "unread"),
        open_pulls: null,
        counted_pulls: null,
        over_cap: null,
      },
    ],
    releases: [
      {
        version: "0.1.0",
        tag: "v0.1.0",
        released_on: "2026-01-01",
        delivers: "The first run",
        groups: [
          {
            title: "New",
            entries: [
              { summary: "It runs", requirements: ["A1-R1"], reference: null },
            ],
          },
        ],
      },
    ],
    proposals: [
      { kind: "feature", id: "B1", title: "Forms", url: null },
      { kind: "rfc", id: 4, title: "RFC: a thing", url: "https://x/4" },
    ],
  };
}

function req(id: string, status: Board["requirements"][number]["status"]) {
  return {
    id,
    owner: id.split("-")[0] ?? id,
    namespace: id.startsWith("GOV") ? "GOV" : "feature",
    keyword: "MUST" as const,
    text: `${id} MUST hold.`,
    status,
    replaced_by: null,
    versions: [],
  };
}

function repo(name: string, tracker: Board["repos"][number]["tracker"]) {
  return {
    name,
    group: "impl",
    lang: null,
    note: null,
    pages: [],
    open_pulls: 0,
    counted_pulls: 0,
    over_cap: false,
    tracker,
  };
}
