import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatRelativeTime,
  getPriorityStyle,
  getStatusStyle,
} from "../lib/utils";

describe("Frontend Utility Functions", () => {
  it("merges CSS class names correctly", () => {
    expect(cn("base-class", false && "ignored", "active-class")).toBe(
      "base-class active-class"
    );
  });

  it("formats dates gracefully", () => {
    const formatted = formatDate("2026-09-05T12:00:00Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Sep");
  });

  it("calculates relative time correctly", () => {
    const nowIso = new Date().toISOString();
    expect(formatRelativeTime(nowIso)).toBe("just now");
  });

  it("returns correct badges and labels for all statuses", () => {
    expect(getStatusStyle("OPEN").label).toBe("Open");
    expect(getStatusStyle("IN_PROGRESS").label).toBe("In Progress");
    expect(getStatusStyle("RESOLVED").label).toBe("Resolved");
    expect(getStatusStyle("CLOSED").label).toBe("Closed");
  });

  it("returns distinct styles for all priority levels", () => {
    expect(getPriorityStyle("LOW").text).toContain("slate");
    expect(getPriorityStyle("HIGH").text).toContain("orange");
    expect(getPriorityStyle("CRITICAL").text).toContain("rose");
  });
});
