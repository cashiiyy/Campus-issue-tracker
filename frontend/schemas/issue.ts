import { z } from "zod";

export const issueCategories = [
  "Infrastructure",
  "Cleanliness",
  "Electrical",
  "Water",
  "Internet",
  "Security",
  "Transportation",
  "Academic",
  "Other",
] as const;

export const issuePriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const issueStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export const issueCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters long.")
    .max(150, "Title cannot exceed 150 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Please provide a detailed description (at least 10 characters).")
    .max(2000, "Description cannot exceed 2000 characters."),
  category: z.enum(issueCategories, {
    message: "Please select an issue category.",
  }),
  location: z
    .string()
    .trim()
    .min(2, "Please specify the campus building, room, or landmark.")
    .max(200, "Location cannot exceed 200 characters."),
  priority: z.enum(issuePriorities, {
    message: "Please select an urgency level.",
  }),
});

export type IssueCreateFormData = z.infer<typeof issueCreateSchema>;

export const issueEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters long.")
    .max(150, "Title cannot exceed 150 characters.")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Please provide a detailed description (at least 10 characters).")
    .max(2000, "Description cannot exceed 2000 characters.")
    .optional(),
  category: z.enum(issueCategories).optional(),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters long.")
    .max(200, "Location cannot exceed 200 characters.")
    .optional(),
  priority: z.enum(issuePriorities).optional(),
});

export type IssueEditFormData = z.infer<typeof issueEditSchema>;

export const commentCreateSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty.")
    .max(1000, "Comment cannot exceed 1000 characters."),
});

export type CommentCreateFormData = z.infer<typeof commentCreateSchema>;
