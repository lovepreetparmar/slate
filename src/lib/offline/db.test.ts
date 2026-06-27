import { describe, it, expect } from "vitest";
import { mergeSyncQueue } from "@/lib/offline/db";
import type { SyncAction } from "@/types";

const ts = 1;

describe("mergeSyncQueue", () => {
  it("coalesces create + delete into empty queue", () => {
    const queue = [
      {
        type: "create" as const,
        timestamp: ts,
        payload: {
          id: "a",
          title: "Task",
          taskDate: "2026-06-27",
        },
      },
    ];

    const result = mergeSyncQueue(queue, {
      type: "delete",
      payload: { id: "a" },
    });

    expect(result).toHaveLength(0);
  });

  it("merges update into pending create", () => {
    const queue = [
      {
        type: "create" as const,
        timestamp: ts,
        payload: {
          id: "a",
          title: "Original",
          taskDate: "2026-06-27",
        },
      },
    ];

    const result = mergeSyncQueue(queue, {
      type: "update",
      payload: { id: "a", title: "Updated" },
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("create");
    if (result[0]?.type === "create") {
      expect(result[0].payload.title).toBe("Updated");
    }
  });

  it("merges duplicate updates", () => {
    const queue = [
      {
        type: "update" as const,
        timestamp: ts,
        payload: { id: "a", title: "One" },
      },
    ];

    const result = mergeSyncQueue(queue, {
      type: "update",
      payload: { id: "a", completed: true },
    });

    expect(result).toHaveLength(1);
    if (result[0]?.type === "update") {
      expect(result[0].payload).toMatchObject({
        id: "a",
        title: "One",
        completed: true,
      });
    }
  });

  it("appends carry-over actions", () => {
    const queue: (SyncAction & { timestamp: number })[] = [];
    const result = mergeSyncQueue(queue, {
      type: "carryOver",
      payload: { action: "keep_all" },
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("carryOver");
  });
});
