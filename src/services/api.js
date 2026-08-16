import { PROJECTS_DATA } from '../data/projectsData';
import { PROFILE_DATA } from '../data/profileData';

const RAILWAY_BACKEND_URL = 'https://nathanielfaboradagithubio-production.up.railway.app';

/**
 * Resolves and sanitizes API Base URL from environment variables or live host detection
 */
function resolveApiBaseUrl() {
  // 1. If running in browser on GitHub Pages or remote host, point directly to live Railway backend
  if (typeof window !== 'undefined') {
    const hostname = (window.location.hostname || '').toLowerCase();
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '';

    if (hostname.includes('github.io') || hostname.includes('netlify.app') || !isLocalhost) {
      return `${RAILWAY_BACKEND_URL}/api`;
    }
  }

  let envUrl = '';

  // 2. Check Vite / ESM standard import.meta.env
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      envUrl = import.meta.env.VITE_API_URL;
    }
  } catch (e) {}

  // 3. Check Node / Bundler process.env fallback
  if (!envUrl && typeof process !== 'undefined' && process.env) {
    envUrl =
      process.env.VITE_API_URL ||
      process.env.REACT_APP_API_URL ||
      process.env.API_URL ||
      '';
  }

  if (envUrl && typeof envUrl === 'string') {
    let clean = envUrl.trim().replace(/\/+$/, '');
    // Ensure the path ends with /api if not already present
    if (!clean.endsWith('/api')) {
      clean = `${clean}/api`;
    }
    return clean;
  }

  return 'http://localhost:5000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Helper to build auth headers
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Generic API request wrapper
 */
async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API request error [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

export const api = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  auth: {
    login: async (credentials) => {
      try {
        return await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
      } catch (error) {
        console.error('Login Error in api.auth.login:', error);
        throw error;
      }
    },
    logout: async () => {
      return request('/auth/logout', {
        method: 'POST',
      });
    },
    checkAuth: async () => {
      return request('/auth/me', {
        method: 'GET',
      });
    },
    forgotPassword: async (email) => {
      return request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    verifyResetToken: async (token) => {
      return request(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
        method: 'GET',
      });
    },
    resetPassword: async ({ token, newPassword }) => {
      return request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    },
  },

  // ==========================================
  // CREATIONS / PROJECTS
  // ==========================================
  creations: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'all') {
        query.append('category', params.category);
      }
      const qs = query.toString() ? `?${query.toString()}` : '';
      try {
        const res = await request(`/creations${qs}`);
        return res.data || [];
      } catch (err) {
        // Fallback to static data if backend is offline
        console.info('Using static fallback for creations data.');
        if (params.category && params.category !== 'all') {
          return PROJECTS_DATA.filter((p) => p.category === params.category);
        }
        return PROJECTS_DATA;
      }
    },
    getById: async (id) => {
      return request(`/creations/${id}`);
    },
    create: async (data) => {
      return request('/creations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id, data) => {
      return request(`/creations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id) => {
      return request(`/creations/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ==========================================
  // ORGANIZATIONS
  // ==========================================
  organizations: {
    getAll: async () => {
      try {
        const res = await request('/organizations');
        return res.data || [];
      } catch (err) {
        return [];
      }
    },
    create: async (data) => {
      return request('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id, data) => {
      return request(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id) => {
      return request(`/organizations/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ==========================================
  // WORK EXPERIENCES
  // ==========================================
  workExperiences: {
    getAll: async () => {
      try {
        const res = await request('/work-experiences');
        return res.data || [];
      } catch (err) {
        // Transform static structure if offline
        return PROFILE_DATA.workExperience || [];
      }
    },
    create: async (data) => {
      return request('/work-experiences', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id, data) => {
      return request(`/work-experiences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id) => {
      return request(`/work-experiences/${id}`, {
        method: 'DELETE',
      });
    },
  },
  // ==========================================
  // CLOUDINARY UPLOAD
  // ==========================================
  upload: {
    image: async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to upload image to Cloudinary.');
      }
      return data;
    },
  },
};

export default api;
