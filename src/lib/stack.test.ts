import { describe, expect, it } from "vitest";
import { services } from "../data/site";
import { drift, holdTo, pinned } from "./stack";

const BUNDLE = `schema = 2

[[profile]]
id = "search"

[[plugin]]
id           = "prowlarr"
profile      = "search"

[[plugin]]
revision = "0"

[[plugin]]
id           = "request-gate"

[[offered]]
id           = "byparr"
`;

describe("the stack's services", () => {
  it("reads the ids the bundle pins in order, and none it only offers", () => {
    expect(pinned(BUNDLE)).toEqual(["prowlarr", "request-gate"]);
  });

  it("refuses a bundle that pins no plugin", () => {
    expect(() => pinned('[[offered]]\nid = "x"\n')).toThrow(
      "the bundle pins no plugin",
    );
    expect(() => pinned("schema = 2\n")).toThrow("the bundle pins no plugin");
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
      holdTo(BUNDLE, ["prowlarr"]);
    }).toThrow(
      "src/data/site.ts services differ from the stack: the stack runs request-gate",
    );
    expect(() => {
      holdTo(BUNDLE, ["prowlarr", "request-gate"]);
    }).not.toThrow();
  });

  it("gives every service on the site an id of its own", () => {
    const ids = services.map((service) => service.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
