const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Store tokens in localStorage
export const storeTokens = (tokens: AuthTokens) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.detail || 'API Error',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    };
  }
}

// Auth APIs
export const auth = {
  register: async (email: string, password: string, fullName: string, organizationName: string) => {
    return apiCall<AuthTokens>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        organization_name: organizationName,
      }),
    });
  },

  login: async (email: string, password: string) => {
    return apiCall<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me: async () => {
    return apiCall('/api/auth/me', {
      method: 'GET',
    });
  },

  refresh: async (refreshToken: string) => {
    return apiCall<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};

// Artifact APIs
export const artifacts = {
  list: async () => {
    return apiCall('/api/artifacts', { method: 'GET' });
  },

  get: async (id: number) => {
    return apiCall(`/api/artifacts/${id}`, { method: 'GET' });
  },

  create: async (title: string, description: string, content: string, projectId?: number) => {
    return apiCall('/api/artifacts', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        content,
        project_id: projectId,
      }),
    });
  },

  update: async (id: number, title?: string, description?: string, content?: string, changeSummary?: string) => {
    return apiCall(`/api/artifacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        description,
        content,
        change_summary: changeSummary,
      }),
    });
  },

  delete: async (id: number) => {
    return apiCall(`/api/artifacts/${id}`, { method: 'DELETE' });
  },
};

// SOP APIs
export const sops = {
  list: async () => {
    return apiCall('/api/sops', { method: 'GET' });
  },

  get: async (id: number) => {
    return apiCall(`/api/sops/${id}`, { method: 'GET' });
  },

  create: async (title: string, description: string, projectId: number | undefined, steps: Array<{title: string; description?: string; source_artifact_id?: number}>) => {
    return apiCall('/api/sops', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        project_id: projectId,
        steps,
      }),
    });
  },

  delete: async (id: number) => {
    return apiCall(`/api/sops/${id}`, { method: 'DELETE' });
  },
};

// Template APIs
export const templates = {
  list: async () => {
    return apiCall('/api/templates', { method: 'GET' });
  },

  gallery: async () => {
    return apiCall('/api/templates/gallery', { method: 'GET' });
  },

  promote: async (artifactId: number, sanitizationChecklist: Record<string, boolean>) => {
    return apiCall('/api/templates/promote', {
      method: 'POST',
      body: JSON.stringify({
        artifact_id: artifactId,
        sanitization_checklist: sanitizationChecklist,
      }),
    });
  },

  import: async (templateId: number, artifactTitle?: string) => {
    return apiCall('/api/templates/import', {
      method: 'POST',
      body: JSON.stringify({
        template_id: templateId,
        artifact_title: artifactTitle,
      }),
    });
  },

  create: async (name: string, description: string, content: string, category?: string) => {
    return apiCall('/api/templates', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        content,
        category,
      }),
    });
  },
};
