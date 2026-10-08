import { describe, expect, it } from "vitest";
import { services } from "../data/site";
import { drift, holdTo, included } from "./stack";

const ROOT = `schema_version = 1
include = [
  "services/prowlarr.toml",
  "services/request-gate.toml",
]

[[profile]]
id = "search"
`;

describe("the stack's services", () => {
  it("reads the include list's ids in order", () => {
    expect(included(ROOT)).toEqual(["prowlarr", "request-gate"]);
  });

  it("refuses a manifest with no include list, or one including nothing", () => {
    expect(() => included('[[service]]\nid = "x"\n')).toThrow(
      "names no include list",
    );
    expect(() => included("include = []\n")).toThrow("includes no service");
  });

  it("names every service one side has and the other does not", () => {
    expect(drift(["a", "b"], ["b", "c"])).toEqual([
      "the stack runs a and the site does not list it",
      "the site lists c and the stack does not run it",
    ]);
    expect(drift(["a"], ["a"])).toEqual([]);
  });

  it("fails a build whose list differs, and passes one that agrees", () => {
    expect(() => {
      holdTo(ROOT, ["prowlarr"]);
    }).toThrow(
      "src/data/site.ts services differ from the stack: the stack runs request-gate",
    );
    expect(() => {
      holdTo(ROOT, ["prowlarr", "request-gate"]);
    }).not.toThrow();
  });

  it("gives every service on the site an id of its own", () => {
    const ids = services.map((service) => service.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
