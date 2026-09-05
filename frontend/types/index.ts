export type UserRole = "STUDENT" | "ADMIN";

export type IssueCategory =
  | "Infrastructure"
  | "Cleanliness"
  | "Electrical"
  | "Water"
  | "Internet"
  | "Security"
  | "Transportation"
  | "Academic"
  | "Other";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface UserBrief {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: UserBrief;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  priority: IssuePriority;
  status: IssueStatus;
  created_by: string;
  assigned_to?: string | null;
  assigned_team?: string | null;
  created_at: string;
  updated_at: string;
  creator?: UserBrief | null;
  assignee?: UserBrief | null;
  team?: Team | null;
  comment_count?: number;
  comments?: Comment[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface AdminDashboardStats {
  total_issues: number;
  open_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  closed_issues: number;
  critical_issues: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
  recent_issues: Issue[];
}

export interface StudentDashboardStats {
  total_issues: number;
  open_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  closed_issues: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}
