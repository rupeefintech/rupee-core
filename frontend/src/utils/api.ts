import axios from 'axios';

const PROD_BACKEND = 'https://rupeepedia-backend.onrender.com/api';

function buildApiBase(): string {
  // In production always use the known backend — env var cannot be trusted
  if (import.meta.env.PROD) return PROD_BACKEND;

  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!raw) return '/api';

  // If it's a relative path (e.g. "/api"), use as-is (Vite dev proxy can handle it)
  if (raw.startsWith('/')) return raw.replace(/\/+$/, '') || '/api';

  // If it's an absolute URL, ensure it ends with "/api"
  const base = raw.replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}

const API_BASE = buildApiBase();

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface BlogSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  readTime: string | null;
  isFeatured: boolean;
  publishedAt: string;
}

export interface BlogDetail extends BlogSummary {
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  related: BlogSummary[];
}

export interface State {
  id: number;
  name: string;
  code: string;
  logo_url?: string;
}

export interface Bank {
  id: number;
  name: string;
  slug?: string;
  short_name: string;
  bank_type: string;
  headquarters: string;
  website: string;
  logo_url?: string;
}

export interface District {
  id: number;
  name: string;
  state_name: string;
}

export interface BranchListItem {
  id: number;
  ifsc: string;
  branch_name: string;
  city: string;
  district_name: string;
}

export interface BranchDetail {
  ifsc: string;
  micr: string;
  branch_name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email?: string;
  neft: number;
  rtgs: number;
  imps: number;
  upi: number;
  latitude?: number;
  longitude?: number;
  swift?: string;
  bank_name: string;
  short_name: string;
  bank_type: string;
  bank_website: string;
  state_name: string;
  state_code: string;
  district_name: string;
  google_maps_url: string;
  bank_headquarters?: string;
  bank_logo_url?: string;
}

export interface NearbyBranch {
  ifsc: string;
  branch_name: string;
  address: string;
  city: string;
}

export interface DbStats {
  total_branches: number;
  total_banks: number;
  total_states: number;
  upi_enabled: number;
  last_updated: string;
}

/**
 * Unwrap API response data
 * Handles both wrapped and unwrapped response formats
 * @param response - Raw axios response
 * @returns Unwrapped data object
 */
function unwrapResponse(response: any): any {
  // Some endpoints return { data: { data: {...} } }
  // Others return { data: {...} }
  // This normalizes both formats
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  if (response?.data !== undefined) {
    return response.data;
  }
  return response;
}

export const api = {
  getStates: async (): Promise<State[]> => {
    try {
      const response = await apiClient.get('/states');
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data : data || [];
    } catch (error: any) {
      console.error('Error fetching states:', error);
      throw new Error(`Failed to fetch states: ${error.message}`);
    }
  },

  getBanks: async (): Promise<Bank[]> => {
    try {
      const response = await apiClient.get('/banks');
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data : data || [];
    } catch (error: any) {
      console.error('Error fetching banks:', error);
      throw new Error(`Failed to fetch banks: ${error.message}`);
    }
  },

  getDistricts: async (stateId: number, bankId?: number): Promise<District[]> => {
    try {
      const params = new URLSearchParams({ state_id: String(stateId) });
      if (bankId) params.set('bank_id', String(bankId));
      const response = await apiClient.get(`/districts?${params}`);
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data : data || [];
    } catch (error: any) {
      console.error('Error fetching districts:', error);
      throw new Error(`Failed to fetch districts: ${error.message}`);
    }
  },

  getBranches: async (bankId: number, stateId: number, districtId?: number): Promise<BranchListItem[]> => {
    try {
      const params = new URLSearchParams({
        bank_id: String(bankId),
        state_id: String(stateId),
        ...(districtId ? { district_id: String(districtId) } : {}),
      });
      const response = await apiClient.get(`/branches?${params}`);
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data : data || [];
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }
  },

  /**
   * Get IFSC code details
   * ✅ FIXED: Direct pass-through with unwrap, no transformation
   * This ensures consistency between local and production
   */
  getByIfsc: async (ifsc: string): Promise<BranchDetail> => {
    try {
      const upperIfsc = ifsc.toUpperCase();
      
      // DEBUG: Log the request
      if (import.meta.env.DEV) {
        console.log(`[API] Fetching IFSC: ${upperIfsc} from ${API_BASE}/ifsc/${upperIfsc}`);
      }

      const response = await apiClient.get(`/ifsc/${upperIfsc}`);
      const data = unwrapResponse(response);

      // DEBUG: Log response structure
      if (import.meta.env.DEV) {
        console.log(`[API] Response received:`, { keys: Object.keys(data || {}) });
      }

      if (!data || !(data.ifsc || data.IFSC)) {
        throw new Error(`Invalid response: missing IFSC`);
      }
      // normalize
      data.ifsc = data.ifsc || data.IFSC;

      return data as BranchDetail;
    } catch (error: any) {
      // Better error logging
      if (error.response?.status === 404) {
        console.warn(`[API] IFSC not found: ${ifsc}`);
        throw new Error('IFSC code not found');
      }
      
      console.error(`[API] Error fetching IFSC ${ifsc}:`, error);
      throw new Error(`Failed to fetch IFSC details: ${error.message}`);
    }
  },

  getNearbyBranches: async (ifsc: string): Promise<NearbyBranch[]> => {
    try {
      const response = await apiClient.get(`/ifsc/${ifsc.toUpperCase()}/nearby`);
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data : data ?? [];
    } catch (error) {
      // Silently fail for nearby branches (non-critical feature)
      console.warn(`[API] Failed to fetch nearby branches for ${ifsc}`);
      return [];
    }
  },

  getStats: async (): Promise<DbStats> => {
    try {
      const response = await apiClient.get('/stats');
      const data = unwrapResponse(response);
      return data as DbStats;
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  },

  search: async (q: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/search?q=${encodeURIComponent(q)}`);
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data : data || [];
    } catch (error: any) {
      console.error('Error searching:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },

// ── SEO SCALABLE PAGES ───────────────────────────────────────────────────

// Bank Page (e.g. /bank/hdfc-bank)
getBankPage: async (slug: string): Promise<{
  bank: string;
  total_branches: number;
  branches: {
    ifsc: string;
    branch_name: string;
    city: string;
    state_name: string;
  }[];
}> => {
  try {
    const response = await apiClient.get(`/bank/${slug}`);
    const data = unwrapResponse(response);
    return data;
  } catch (error: any) {
    console.error('Error fetching bank page:', error);
    throw new Error(`Failed to fetch bank page: ${error.message}`);
  }
},

// State Page (e.g. /state/telangana)
getStatePage: async (slug: string): Promise<{
  state: string;
  total_branches: number;
  branches: {
    ifsc: string;
    branch_name: string;
    bank_name: string;
    city: string;
  }[];
}> => {
  try {
    const response = await apiClient.get(`/state/${slug}`);
    const data = unwrapResponse(response);
    return data;
  } catch (error: any) {
    console.error('Error fetching state page:', error);
    throw new Error(`Failed to fetch state page: ${error.message}`);
  }
},

// City Page (e.g. /city/hyderabad)
getCityPage: async (slug: string): Promise<{
  city: string;
  total_branches: number;
  branches: {
    ifsc: string;
    branch_name: string;
    bank_name: string;
    state_name: string;
  }[];
}> => {
  try {
    const response = await apiClient.get(`/city/${slug}`);
    const data = unwrapResponse(response);
    return data;
  } catch (error: any) {
    console.error('Error fetching city page:', error);
    throw new Error(`Failed to fetch city page: ${error.message}`);
  }
},

// ── CASCADE FLOW METHODS ────────────────────────────────────────────────────

  // Bank → States (with logos and branch counts)
  getStatesByBank: async (bankSlug: string): Promise<{
    bank: { id: number; name: string; shortName: string; logo_url?: string };
    states: { id: number; name: string; code: string; logo_url?: string; branchCount: number }[];
    totalStates: number;
  }> => {
    try {
      const response = await apiClient.get(`/banks/${bankSlug}/states`);
      const data = unwrapResponse(response);
      return data;
    } catch (error: any) {
      console.error('Error fetching states for bank:', error);
      throw new Error(`Failed to fetch states: ${error.message}`);
    }
  },

  // Bank + State → Cities
  getCities: async (bankSlug: string, stateSlug: string): Promise<{
    bank: { id: number; name: string; shortName: string; logo_url?: string };
    state: { id: number; name: string; logo_url?: string };
    cities: { city: string }[];
    totalCities: number;
  }> => {
    try {
      const response = await apiClient.get(`/bank/${bankSlug}/cities/${stateSlug}`);
      const data = unwrapResponse(response);
      return data;
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      throw new Error(`Failed to fetch cities: ${error.message}`);
    }
  },

  // Bank + State + City → Branches (paginated)
  getBranchesByCity: async (bankSlug: string, stateSlug: string, citySlug: string, page = 1, limit = 20): Promise<{
    bank: any;
    state: any;
    city: string;
    branches: any[];
    pagination: { page: number; limit: number; totalCount: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }> => {
    try {
      const response = await apiClient.get(`/city/${bankSlug}/${stateSlug}/${citySlug}`, { params: { page, limit } });
      const data = unwrapResponse(response);
      return data;
    } catch (error: any) {
      console.error('Error fetching branches by city:', error);
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }
  },

  // ── Blog API ────────────────────────────────────────────────────────────────
  getBlogs: async (params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<{
    blogs: BlogSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get('/blogs', { params });
    return unwrapResponse(response);
  },

  getBlogBySlug: async (slug: string): Promise<BlogDetail> => {
    const response = await apiClient.get(`/blogs/${slug}`);
    return unwrapResponse(response);
  },

  getBlogCategories: async (): Promise<{ category: string; count: number }[]> => {
    const response = await apiClient.get('/blogs/categories');
    return unwrapResponse(response);
  },

  getFeaturedBlogs: async (): Promise<BlogSummary[]> => {
    const response = await apiClient.get('/blogs/featured');
    return unwrapResponse(response);
  },

};