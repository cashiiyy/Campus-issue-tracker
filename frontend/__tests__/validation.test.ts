import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "../schemas/auth";
import {
  issueCreateSchema,
  issueEditSchema,
  commentCreateSchema,
} from "../schemas/issue";

describe("Authentication Form Validation", () => {
  it("validates successful login data", () => {
    const valid = loginSchema.safeParse({
      email: "student@campus.edu",
      password: "Password123!",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects malformed login email", () => {
    const invalid = loginSchema.safeParse({
      email: "not-an-email",
      password: "Password123!",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates successful student registration", () => {
    const valid = registerSchema.safeParse({
      name: "Marcus Vance",
      email: "marcus.vance@campus.edu",
      password: "StrongPassword2026!",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects short registration password (< 8 characters)", () => {
    const invalid = registerSchema.safeParse({
      name: "Marcus Vance",
      email: "marcus@campus.edu",
      password: "short",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects short registration name (< 2 characters)", () => {
    const invalid = registerSchema.safeParse({
      name: "A",
      email: "marcus@campus.edu",
      password: "StrongPassword2026!",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("Issue Form Validation", () => {
  it("validates valid issue creation payload", () => {
    const valid = issueCreateSchema.safeParse({
      title: "Broken window lock in Room 204",
      description: "The latch is broken and the window swings open in the wind.",
      category: "Infrastructure",
      location: "Humanities Hall - Room 204",
      priority: "MEDIUM",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects issue title under 5 characters", () => {
    const invalid = issueCreateSchema.safeParse({
      title: "Leak",
      description: "Water dripping from the air vent onto chairs.",
      category: "Water",
      location: "Library 1st floor",
      priority: "HIGH",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects issue description under 10 characters", () => {
    const invalid = issueCreateSchema.safeParse({
      title: "Elevator Door Stuck",
      description: "Too short",
      category: "Infrastructure",
      location: "Science Building",
      priority: "CRITICAL",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects invalid issue category", () => {
    const invalid = issueCreateSchema.safeParse({
      title: "Valid Issue Title Here",
      description: "Valid description of reasonable length.",
      category: "NonExistentCategory",
      location: "Science Building",
      priority: "LOW",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("Comment Validation", () => {
  it("accepts valid comment", () => {
    const valid = commentCreateSchema.safeParse({
      content: "Technicians have arrived on site.",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects empty or whitespace comment", () => {
    const invalid = commentCreateSchema.safeParse({
      content: "   ",
    });
    expect(invalid.success).toBe(false);
  });
});
