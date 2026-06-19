import { safeNext } from "./redirects";

describe("safeNext", () => {
  it("accepts a single-slash-rooted relative path", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/")).toBe("/");
  });

  it("rejects protocol-relative open redirects", () => {
    expect(safeNext("//evil.com")).toBe("/explore");
  });

  it("rejects absolute URLs", () => {
    expect(safeNext("https://evil.com")).toBe("/explore");
  });

  it("rejects paths not rooted at a slash", () => {
    expect(safeNext("explore")).toBe("/explore");
  });

  it("falls back for null/undefined/empty", () => {
    expect(safeNext(null)).toBe("/explore");
    expect(safeNext(undefined)).toBe("/explore");
    expect(safeNext("")).toBe("/explore");
  });
});
