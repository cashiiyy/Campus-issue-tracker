import { describe, it, expect } from "vitest";
import { UserRole } from "../types";

describe("Role-Based Authorization & Navigation Logic", () => {
  function canAccessAdminRoute(role: UserRole): boolean {
    return role === "ADMIN";
  }

  function canAccessStudentRoute(role: UserRole): boolean {
    return role === "STUDENT" || role === "ADMIN";
  }

  function canModifyIssue(
    issueCreatedBy: string,
    currentUserId: string,
    role: UserRole,
    status: string
  ): { allowed: boolean; reason?: string } {
    if (status === "RESOLVED" || status === "CLOSED") {
      return { allowed: false, reason: "ISSUE_LOCKED" };
    }
    if (role === "ADMIN") {
      return { allowed: true };
    }
    if (issueCreatedBy === currentUserId) {
      return { allowed: true };
    }
    return { allowed: false, reason: "NOT_ISSUE_OWNER" };
  }

  it("permits only ADMIN role to access admin routes", () => {
    expect(canAccessAdminRoute("ADMIN")).toBe(true);
    expect(canAccessAdminRoute("STUDENT")).toBe(false);
  });

  it("permits students to access student routes", () => {
    expect(canAccessStudentRoute("STUDENT")).toBe(true);
  });

  it("allows student owner to edit open issue", () => {
    const res = canModifyIssue("student-1", "student-1", "STUDENT", "OPEN");
    expect(res.allowed).toBe(true);
  });

  it("prohibits student from editing another student's issue", () => {
    const res = canModifyIssue("student-1", "student-2", "STUDENT", "OPEN");
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("NOT_ISSUE_OWNER");
  });

  it("prohibits student from editing a resolved issue", () => {
    const res = canModifyIssue("student-1", "student-1", "STUDENT", "RESOLVED");
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("ISSUE_LOCKED");
  });

  it("allows admin to edit open issues regardless of ownership", () => {
    const res = canModifyIssue("student-1", "admin-1", "ADMIN", "OPEN");
    expect(res.allowed).toBe(true);
  });
});
