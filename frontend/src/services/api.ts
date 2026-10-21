import type { Destination, DestinationListResponse, DestinationQueryParams } from '../types/destination';

function getInitialBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      // If client is accessing from phone/LAN and env is set to localhost, swap to current LAN host
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        const port = envUrl.match(/:(\d+)$/)?.[1] || '8000';
        return `http://${currentHost}:${port}`;
      }
    }
  }
  return envUrl || 'http://127.0.0.1:8000';
}

let activeBaseUrl = getInitialBaseUrl();

function getCandidateUrls(): string[] {
  const candidates: string[] = [activeBaseUrl];
  
  // Try alternate port (8000 <-> 8001)
  if (activeBaseUrl.includes(':8000')) {
    candidates.push(activeBaseUrl.replace(':8000', ':8001'));
  } else if (activeBaseUrl.includes(':8001')) {
    candidates.push(activeBaseUrl.replace(':8001', ':8000'));
  }

  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      candidates.push(`http://${host}:8000`, `http://${host}:8001`);
    } else {
      candidates.push('http://127.0.0.1:8000', 'http://127.0.0.1:8001', 'http://localhost:8000', 'http://localhost:8001');
    }
  }
  
  return Array.from(new Set(candidates));
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  const candidates = getCandidateUrls();

  for (const base of candidates) {
    try {
      const res = await fetch(`${base}${path}`, options);
      if (res.ok || res.status === 404 || res.status === 400) {
        activeBaseUrl = base; // Lock in working base URL
        return res;
      }
    } catch {
      // Try next candidate base URL
    }
  }

  throw new ApiError(
    `Unable to reach Shanthivana API server at ${activeBaseUrl}. Please ensure FastAPI is running.`,
    0
  );
}

export const api = {
  /**
   * Fetches active destinations with optional search, category filter, and pagination.
   */
  async getDestinations(params?: DestinationQueryParams): Promise<DestinationListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.q?.trim()) {
      searchParams.set('q', params.q.trim());
    }
    if (params?.category && params.category !== 'all') {
      searchParams.set('category', params.category);
    }
    if (params?.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString());
    }

    const qs = searchParams.toString();
    const path = `/api/v1/destinations${qs ? `?${qs}` : ''}`;

    const response = await fetchWithFallback(path, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      let detail = `Error ${response.status}: Failed to load destinations.`;
      try {
        const errData = await response.json();
        if (errData?.detail) detail = errData.detail;
      } catch {}
      throw new ApiError(detail, response.status);
    }

    return await response.json();
  },

  /**
   * Fetches a single destination by its integer ID.
   */
  async getDestinationById(id: number): Promise<Destination> {
    const response = await fetchWithFallback(`/api/v1/destinations/${id}`);
    if (!response.ok) {
      let detail = `Destination with ID ${id} was not found.`;
      try {
        const errData = await response.json();
        if (errData?.detail) detail = errData.detail;
      } catch {}
      throw new ApiError(detail, response.status);
    }
    return await response.json();
  },

  /**
   * Fetches a single destination by slug.
   */
  async getDestinationBySlug(slug: string): Promise<Destination> {
    const response = await fetchWithFallback(`/api/v1/destinations/slug/${encodeURIComponent(slug)}`);
    if (!response.ok) {
      let detail = `Destination '${slug}' was not found.`;
      try {
        const errData = await response.json();
        if (errData?.detail) detail = errData.detail;
      } catch {}
      throw new ApiError(detail, response.status);
    }
    return await response.json();
  },

  /**
   * Fetches route nodes with optional filtering to verified nodes.
   */
  async getRouteNodes(verifiedOnly: boolean = false): Promise<import('../types/route').RouteNodeListResponse> {
    const qs = verifiedOnly ? '?verified_only=true' : '';
    const response = await fetchWithFallback(`/api/v1/routes/nodes${qs}`);
    if (!response.ok) {
      throw new ApiError('Failed to fetch route nodes', response.status);
    }
    return await response.json();
  },

  /**
   * Fetches route edges with optional filtering to verified edges.
   */
  async getRouteEdges(verifiedOnly: boolean = false): Promise<import('../types/route').RouteEdgeListResponse> {
    const qs = verifiedOnly ? '?verified_only=true' : '';
    const response = await fetchWithFallback(`/api/v1/routes/edges${qs}`);
    if (!response.ok) {
      throw new ApiError('Failed to fetch route edges', response.status);
    }
    return await response.json();
  },

  /**
   * Requests shortest path calculation via backend Dijkstra engine.
   */
  async findRoute(
    sourceNodeId: number,
    destNodeId: number,
    travelMode: string = 'walk'
  ): Promise<import('../types/route').RouteFindResponse> {
    const response = await fetchWithFallback('/api/v1/routes/find', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        source_node_id: sourceNodeId,
        destination_node_id: destNodeId,
        travel_mode: travelMode,
      }),
    });

    if (!response.ok) {
      let detail = 'No verified route available between these nodes.';
      try {
        const errData = await response.json();
        if (errData?.detail) detail = errData.detail;
      } catch {}
      throw new ApiError(detail, response.status);
    }

    return await response.json();
  },

  /**
   * Health checks for backend and Supabase DB connection.
   */
  async checkHealth(): Promise<{ serviceStatus: string; dbStatus: string; databaseName: string; activeUrl: string }> {
    try {
      const [healthRes, dbRes] = await Promise.all([
        fetchWithFallback('/health'),
        fetchWithFallback('/health/database'),
      ]);
      const healthData = await healthRes.json();
      const dbData = await dbRes.json();
      return {
        serviceStatus: healthData.status || 'unknown',
        dbStatus: dbData.status || 'unknown',
        databaseName: dbData.database || 'Supabase PostgreSQL',
        activeUrl: activeBaseUrl,
      };
    } catch {
      return {
        serviceStatus: 'disconnected',
        dbStatus: 'disconnected',
        databaseName: 'Supabase PostgreSQL',
        activeUrl: activeBaseUrl,
      };
    }
  },
};

