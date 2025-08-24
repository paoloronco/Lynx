const API_BASE = '/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('lynx-auth-token');
};

// Set auth token in localStorage
const setAuthToken = (token: string): void => {
  localStorage.setItem('lynx-auth-token', token);
};

// Remove auth token from localStorage
const removeAuthToken = (): void => {
  localStorage.removeItem('lynx-auth-token');
};

// Base response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  token?: string;
}

// Auth specific types
interface AuthSetupResponse extends ApiResponse {
  isFirstTimeSetup?: boolean;
  token: string;
  user?: {
    username: string;
  };
}

interface LoginResponse extends ApiResponse {
  token: string;
  user: {
    username: string;
  };
}

interface VerifyResponse extends ApiResponse {
  valid: boolean;
  user?: {
    username: string;
  };
}

interface SetupResponse extends ApiResponse {
  success: boolean;
  token: string;
  message: string;
}

interface ChangePasswordResponse extends ApiResponse {
  success: boolean;
  message: string;
  token?: string;
}

interface ProfileResponse extends ApiResponse {
  name: string;
  bio: string;
  avatar: string;
  social_links: Record<string, string>;
}

interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  icon?: string;
  iconType?: 'emoji' | 'image' | 'svg';
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  content?: string;
  textItems?: Array<{ text: string; url?: string }>;
}

// API request helper with auth
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw new Error(error.message || 'Failed to connect to the server');
  }
};

// Auth API
export const authApi = {
  checkSetupStatus: async (): Promise<{ isFirstTimeSetup: boolean }> => {
    return apiRequest<{ isFirstTimeSetup: boolean }>('/auth/setup-status');
  },

  setup: async (password: string): Promise<SetupResponse> => {
    return apiRequest<SetupResponse>('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }).then((response) => {
      if (response.token) {
        setAuthToken(response.token);
      }
      return response;
    });
  },

  login: async (password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }).then((response) => {
      if (response.token) {
        setAuthToken(response.token);
      }
      return response;
    });
  },

  verify: async (): Promise<VerifyResponse> => {
    return apiRequest<VerifyResponse>('/auth/verify', { method: 'POST' });
  },

  logout: (): void => {
    removeAuthToken();
  },

  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },

  reset: async (): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>('/auth/reset', { method: 'POST' });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> => {
    return apiRequest<ChangePasswordResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Profile API
export const profileApi = {
  get: async (): Promise<ProfileResponse> => {
    return apiRequest<ProfileResponse>('/profile');
  },

  update: async (profile: Omit<ProfileResponse, 'social_links'> & { socialLinks: Record<string, string> }): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify({
        ...profile,
        social_links: profile.socialLinks
      }),
    });
  },
};

// Links API
export const linksApi = {
  get: async (): Promise<LinkItem[]> => {
    return apiRequest<LinkItem[]>('/links');
  },

  update: async (links: LinkItem[]): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>('/links', {
      method: 'PUT',
      body: JSON.stringify(links),
    });
  },
};

// Theme API
export const themeApi = {
  get: async (): Promise<Record<string, any>> => {
    return apiRequest<Record<string, any>>('/theme');
  },

  update: async (theme: Record<string, any>): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>('/theme', {
      method: 'PUT',
      body: JSON.stringify(theme),
    });
  },
};

// Utility API
export const utilityApi = {
  generatePassword: async (): Promise<{ password: string }> => {
    return apiRequest<{ password: string }>('/generate-password');
  },

  validatePassword: async (password: string): Promise<{ isStrong: boolean }> => {
    return apiRequest<{ isStrong: boolean }>('/validate-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};
