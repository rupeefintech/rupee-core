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
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// Retry with exponential backoff for transient failures (cold starts, network hiccups)
// Does NOT retry on 4xx client errors
apiClient.interceptors.response.use(
  res => res,
  async (err: any) => {
    const config = err.config;
    if (!config) return Promise.reject(err);
    const status = err.response?.status;
    // Don't retry client errors or if already retried twice
    if (status && status < 500) return Promise.reject(err);
    config._retryCount = (config._retryCount ?? 0) + 1;
    if (config._retryCount > 2) return Promise.reject(err);
    const delay = config._retryCount * 1500;
    await new Promise(r => setTimeout(r, delay));
    return apiClient(config);
  }
);

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

export interface CommodityPrices {
  gold: {
    spot_usd_per_oz: number;
    price_24k_per_10g: number;
    price_22k_per_10g: number;
    price_18k_per_10g: number;
    price_14k_per_10g: number;
    price_24k_per_gram: number;
    price_22k_per_gram: number;
    price_24k_per_tola: number;
  };
  silver: {
    spot_usd_per_oz: number;
    price_per_kg: number;
    price_per_100g: number;
    price_per_10g: number;
    price_per_gram: number;
  };
  usd_inr: number;
  cities: Record<string, { gold_24k_per_10g: number; gold_22k_per_10g: number }>;
  updated_at: string;
  disclaimer: string;
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

export interface PostOfficeEntry {
  office_name: string;
  office_type: string | null;
  delivery:    boolean;
  division:    string | null;
  district:    string | null;
  state_name:  string;
  latitude:    number | null;
  longitude:   number | null;
}

export interface PinBranch {
  ifsc:        string;
  bank_name:   string;
  bank_logo:   string | null;
  bank_slug:   string | null;
  branch_name: string;
  address:     string | null;
  city:        string | null;
  state_name:  string;
  neft: number; rtgs: number; imps: number; upi: number;
}

export interface PinDetail {
  pin_code:      string;
  state_name:    string | null;
  district:      string | null;
  post_offices:  PostOfficeEntry[];
  bank_branches: PinBranch[];
  stats: {
    post_office_count: number;
    delivery_offices:  number;
    bank_count:        number;
    branch_count:      number;
  };
}

export interface PinSearchResult {
  pin_code:   string;
  state_name: string;
  district:   string | null;
}

export interface OfficeSearchResult {
  office_name: string;
  pin_code:    string;
  office_type: string | null;
  delivery:    boolean;
  district:    string | null;
  state_name:  string;
  division:    string | null;
  region:      string | null;
  circle:      string | null;
  latitude:    number | null;
  longitude:   number | null;
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
    const upperIfsc = ifsc.toUpperCase();
    try {
      const response = await apiClient.get(`/ifsc/${upperIfsc}`);
      const data = unwrapResponse(response);

      if (!data || !(data.ifsc || data.IFSC)) {
        throw new Error(`Invalid response: missing IFSC`);
      }
      data.ifsc = data.ifsc || data.IFSC;

      return data as BranchDetail;
    } catch (error: any) {
      if (error.response?.status === 404) {
        const e = new Error('IFSC code not found') as any;
        e.isNotFound = true;
        throw e;
      }
      throw error;
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

  getCommodityPrices: async (): Promise<CommodityPrices> => {
    const response = await apiClient.get('/commodity-prices');
    return unwrapResponse(response);
  },

  // ── PIN Code Directory ──────────────────────────────────────────────────────
  getPinDetail: async (pincode: string): Promise<PinDetail> => {
    const response = await apiClient.get(`/pin/${pincode}`);
    return unwrapResponse(response);
  },

  searchPin: async (q: string): Promise<PinSearchResult[]> => {
    const response = await apiClient.get(`/pin/search?q=${encodeURIComponent(q)}&mode=pin`);
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data : data || [];
  },

  searchPinOffice: async (q: string): Promise<OfficeSearchResult[]> => {
    const response = await apiClient.get(`/pin/search?q=${encodeURIComponent(q)}&mode=office`);
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data : data || [];
  },

  getPinStates: async (): Promise<string[]> => {
    const response = await apiClient.get('/pin/states');
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data : data || [];
  },

  getPinDistricts: async (state: string): Promise<string[]> => {
    const response = await apiClient.get(`/pin/state/${encodeURIComponent(state)}/districts`);
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data : data || [];
  },

  getDistrictOffices: async (state: string, district: string, exclude?: string): Promise<{ pin_code: string; office_name: string; office_type: string | null }[]> => {
    const params = new URLSearchParams({ state, district, limit: '24' });
    if (exclude) params.set('exclude', exclude);
    const response = await apiClient.get(`/pin/district-offices?${params}`);
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data : data || [];
  },

  getPinsByDistrict: async (state: string, district: string): Promise<string[]> => {
    const response = await apiClient.get(`/pin/state/${encodeURIComponent(state)}/district/${encodeURIComponent(district)}/pins`);
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data : data || [];
  },

  // ── SWIFT Code Lookup ───────────────────────────────────────────────────────
  getSwiftCode: async (code: string): Promise<{
    swift: string; ifsc: string; bank_name: string; bank_short: string | null;
    bank_slug: string | null; bank_logo: string | null; bank_website: string | null;
    bank_headquarters: string | null; branch_name: string; address: string | null;
    city: string | null; pincode: string | null; phone: string | null;
    state_name: string; district_name: string | null;
    neft: number; rtgs: number; imps: number; upi: number;
  }> => {
    const response = await apiClient.get(`/swift/${code.toUpperCase()}`);
    return unwrapResponse(response);
  },

  searchSwift: async (q: string): Promise<{ data: {
    swift: string; ifsc: string; bank_name: string; bank_short: string | null;
    bank_slug: string | null; bank_logo: string | null;
    branch_name: string; city: string | null; state_name: string;
  }[] }> => {
    const response = await apiClient.get(`/swift/search?q=${encodeURIComponent(q)}`);
    return unwrapResponse(response);
  },

  // ── Exchange Rates ──────────────────────────────────────────────────────────
  getExchangeRates: async (): Promise<{
    base: string;
    rates: Record<string, number>;
    updated_at: string;
    data_date?: string;
    disclaimer: string;
  }> => {
    const response = await apiClient.get('/exchange-rates');
    return unwrapResponse(response);
  },
};