import {
  AdminDashboardStats,
  Comment,
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  PaginatedResponse,
  StudentDashboardStats,
  Team,
  User,
  UserBrief,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088/api/v1";

class ApiClientError extends Error {
  code: string;
  details?: Array<{ field?: string; message: string }>;
  status: number;

  constructor(
    message: string,
    code: string = "API_ERROR",
    status: number = 500,
    details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    console.error(`[API] Network failure connecting to ${url}:`, err);
    throw new ApiClientError(
      `Network error: Unable to connect to backend server at ${API_BASE_URL}. Please ensure the backend is running.`,
      "NETWORK_ERROR",
      0
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorCode = data?.error?.code || `HTTP_${response.status}`;
    const errorMessage =
      data?.error?.message ||
      response.statusText ||
      "An unexpected error occurred.";
    const details = data?.error?.details;

    // Handle token expiration/invalid token globally
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !endpoint.includes("/auth/login")
    ) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_profile");
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login?session_expired=1";
      }
    }

    throw new ApiClientError(errorMessage, errorCode, response.status, details);
  }

  return data as T;
}

// ----------------- Auth API -----------------
export const authApi = {
  login: async (email: string, password: string) => {
    return request<{ access_token: string; token_type: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  },

  register: async (name: string, email: string, password: string) => {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  getMe: async () => {
    return request<User>("/auth/me");
  },
};

// ----------------- Issues API -----------------
export interface IssueFilterParams {
  search?: string;
  category?: IssueCategory;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigned_team?: string;
  assigned_to?: string;
  page?: number;
  page_size?: number;
}

export const issuesApi = {
  list: async (params: IssueFilterParams = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.category) query.append("category", params.category);
    if (params.status) query.append("status", params.status);
    if (params.priority) query.append("priority", params.priority);
    if (params.assigned_team) query.append("assigned_team", params.assigned_team);
    if (params.assigned_to) query.append("assigned_to", params.assigned_to);
    if (params.page) query.append("page", String(params.page));
    if (params.page_size) query.append("page_size", String(params.page_size));

    const qs = query.toString();
    return request<PaginatedResponse<Issue>>(`/issues${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string) => {
    return request<Issue>(`/issues/${id}`);
  },

  create: async (data: {
    title: string;
    description: string;
    category: IssueCategory;
    location: string;
    priority: IssuePriority;
  }) => {
    return request<Issue>("/issues", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: IssueCategory;
      location?: string;
      priority?: IssuePriority;
    }
  ) => {
    return request<Issue>(`/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getStudentStats: async () => {
    return request<StudentDashboardStats>("/issues/stats/summary");
  },
};

// ----------------- Comments API -----------------
export const commentsApi = {
  list: async (issueId: string) => {
    return request<Comment[]>(`/issues/${issueId}/comments`);
  },

  create: async (issueId: string, content: string) => {
    return request<Comment>(`/issues/${issueId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};

// ----------------- Teams API -----------------
export const teamsApi = {
  list: async () => {
    return request<Team[]>("/teams");
  },
};

// ----------------- Admin API -----------------
export const adminApi = {
  getStats: async () => {
    return request<AdminDashboardStats>("/admin/stats");
  },

  listStaff: async () => {
    return request<UserBrief[]>("/admin/staff");
  },

  updateStatus: async (id: string, status: IssueStatus) => {
    return request<Issue>(`/admin/issues/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  updatePriority: async (id: string, priority: IssuePriority) => {
    return request<Issue>(`/admin/issues/${id}/priority`, {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    });
  },

  updateAssignment: async (
    id: string,
    data: { assigned_to?: string | null; assigned_team?: string | null }
  ) => {
    return request<Issue>(`/admin/issues/${id}/assignment`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

export { ApiClientError };
