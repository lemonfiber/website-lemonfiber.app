import { describe, expect, it } from "vitest";
import {
  compareUrl,
  driftOf,
  editUrl,
  listing,
  locate,
  provenanceUrl,
  renderedUrl,
  sourceOf,
  type Source,
} from "./fix-a-doc";

const REPO = "https://github.com/lemonfiber/lemonfiber";
const REVISION = "6510356a1b2c3d4e5f60718293a4b5c6d7e8f901";
const PATH = "reference/commands.md";
const TABLE = {
  "/commands/every-command/": {
    repository: REPO,
    path: PATH,
    revision: REVISION,
  },
};

function theEntry(): Source {
  const source = sourceOf(TABLE, "/commands/every-command/");
  if (!source) throw new Error("the fixture names the page");
  return source;
}

describe("locate", () => {
  it("reads a page on a site, with or without its scheme or slash", () => {
    for (const address of [
      "https://docs.lemonfiber.app/commands/every-command/",
      " docs.lemonfiber.app/commands/every-command ",
      "https://docs.lemonfiber.app/commands/every-command/?x=1#y",
    ])
      expect(locate(address)).toEqual({
        site: "docs.lemonfiber.app",
        route: "/commands/every-command/",
      });
    expect(locate("lemonfiber.app")).toEqual({
      site: "lemonfiber.app",
      route: "/",
    });
  });

  it("refuses another site, another scheme and what is not an address", () => {
    for (const address of [
      "https://example.com/a/",
      "http://docs.lemonfiber.app/a/",
      "https://",
    ])
      expect(locate(address)).toBeNull();
  });
});

describe("sourceOf", () => {
  it("reads an entry", () => {
    const source = theEntry();
    expect(source).toEqual({
      route: "/commands/every-command/",
      repository: REPO,
      owner: "lemonfiber",
      name: "lemonfiber",
      path: PATH,
      revision: REVISION,
    });
    expect(provenanceUrl("docs.lemonfiber.app")).toBe(
      "https://docs.lemonfiber.app/provenance.json",
    );
    expect(compareUrl(source)).toBe(
      `https://api.github.com/repos/lemonfiber/lemonfiber/compare/${REVISION}...main`,
    );
    expect(editUrl(source)).toBe(`${REPO}/edit/main/${PATH}`);
    expect(renderedUrl(source)).toBe(`${REPO}/blob/${REVISION}/${PATH}`);
  });

  it("reads nothing it cannot vouch for", () => {
    const one = (entry: unknown) => sourceOf({ "/a/": entry }, "/a/");
    expect(sourceOf(null, "/a/")).toBeNull();
    expect(sourceOf("text", "/a/")).toBeNull();
    expect(sourceOf(TABLE, "/nowhere/")).toBeNull();
    expect(one(null)).toBeNull();
    expect(one({ repository: 1, path: PATH, revision: REVISION })).toBeNull();
    expect(one({ repository: REPO, revision: REVISION })).toBeNull();
    expect(one({ repository: REPO, path: PATH })).toBeNull();
    expect(one({ repository: REPO, path: PATH, revision: "main" })).toBeNull();
    expect(one({ repository: REPO, path: "", revision: REVISION })).toBeNull();
    expect(
      one({
        repository: "https://example.com/o/r",
        path: PATH,
        revision: REVISION,
      }),
    ).toBeNull();
  });
});

describe("driftOf", () => {
  const source = theEntry();

  it("reads how far behind and whether the file moved", () => {
    expect(
      driftOf({ ahead_by: 3, files: [{ filename: PATH }, {}] }, source),
    ).toEqual({ behind: 3, changed: true });
    expect(driftOf({ ahead_by: 0 }, source)).toEqual({
      behind: 0,
      changed: false,
    });
  });

  it("reads nothing from an answer that is not a comparison", () => {
    expect(driftOf(null, source)).toBeNull();
    expect(driftOf("text", source)).toBeNull();
    expect(driftOf({ message: "Not Found" }, source)).toBeNull();
  });
});

describe("listing", () => {
  it("groups every page it reads by repository, in order", () => {
    const table = {
      "/b/": { repository: REPO, path: "b.md", revision: REVISION },
      "/a/": {
        repository: "https://github.com/lemonfiber/brand",
        path: "a.md",
        revision: REVISION,
      },
      "/c/": { repository: REPO, path: "c.md", revision: REVISION },
      "/broken/": { repository: REPO },
    };
    expect(listing(table, "docs.lemonfiber.app")).toEqual([
      {
        repository: "https://github.com/lemonfiber/brand",
        label: "lemonfiber/brand",
        pages: [
          {
            url: "https://docs.lemonfiber.app/a/",
            path: "a.md",
            edit: "https://github.com/lemonfiber/brand/edit/main/a.md",
          },
        ],
      },
      {
        repository: REPO,
        label: "lemonfiber/lemonfiber",
        pages: [
          {
            url: "https://docs.lemonfiber.app/b/",
            path: "b.md",
            edit: `${REPO}/edit/main/b.md`,
          },
          {
            url: "https://docs.lemonfiber.app/c/",
            path: "c.md",
            edit: `${REPO}/edit/main/c.md`,
          },
        ],
      },
    ]);
  });

  it("lists nothing from a site it could not read", () => {
    expect(listing(null, "docs.lemonfiber.app")).toEqual([]);
  });
});
