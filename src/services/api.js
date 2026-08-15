import { PROJECTS_DATA } from '../data/projectsData';
import { PROFILE_DATA } from '../data/profileData';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  process.env.API_URL ||
  'http://localhost:5000/api';

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
  const url = `${API_BASE_URL}${endpoint}`;
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
    // If backend is unreachable or CORS blocked, log and bubble error
    console.warn(`API request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  auth: {
    login: async (credentials) => {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
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
