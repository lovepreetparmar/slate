import { describe, it, expect } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
  carryOverSchema,
} from "@/lib/validations";

describe("createTaskSchema", () => {
  it("accepts valid input", () => {
    const result = createTaskSchema.safeParse({
      title: "Buy milk",
      taskDate: "2026-06-27",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid taskDate", () => {
    const result = createTaskSchema.safeParse({
      title: "Buy milk",
      taskDate: "06/27/2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("rejects invalid taskDate", () => {
    const result = updateTaskSchema.safeParse({ taskDate: "not-a-date" });
    expect(result.success).toBe(false);
  });
});

describe("carryOverSchema", () => {
  it("accepts keep_all action", () => {
    const result = carryOverSchema.safeParse({ action: "keep_all" });
    expect(result.success).toBe(true);
  });

  it("rejects too many task ids", () => {
    const result = carryOverSchema.safeParse({
      action: "keep",
      taskIds: Array.from({ length: 101 }, (_, i) => `id-${i}`),
    });
    expect(result.success).toBe(false);
  });
});
