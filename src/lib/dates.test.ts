import { describe, it, expect } from "vitest";
import { parseTaskDate, getYesterdayString, toDateString } from "@/lib/dates";

describe("dates", () => {
  it("parses YYYY-MM-DD dates", () => {
    const date = parseTaskDate("2026-06-27");
    expect(toDateString(date)).toBe("2026-06-27");
  });

  it("throws on invalid dates", () => {
    expect(() => parseTaskDate("not-a-date")).toThrow();
  });

  it("returns yesterday as YYYY-MM-DD", () => {
    expect(getYesterdayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
