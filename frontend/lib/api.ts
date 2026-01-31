// FastVote API Client
// Centralized API communication with type safety

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');

export interface VoteRoom {
  uuid: string;
  title: string;
  options: string[];
  has_password: boolean;
  created_at: string;
  tags?: string[];
  allow_multiple?: boolean;
  expires_at?: string | null;
}

export interface VoteResults {
  room_uuid: string;
  title: string;
  results: Record<string, number>;
  expires_at: string | null;
}

export interface VoteRequest {
  options: string[];
  fingerprint: string;
}

export interface CreateRoomRequest {
  title: string;
  options: string[];
  password?: string;
  ttl: number;
  tags: string[];
  allow_multiple: boolean;
}

export interface CreateRoomResponse {
  uuid: string;
}

export interface RoomSummary {
  uuid: string;
  title: string;
  tags: string[];
  total_votes: number;
  created_at: string;
  expires_at: string | null;
  has_password: boolean;
  allow_multiple: boolean;
}

export interface RoomListResponse {
  rooms: RoomSummary[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface PasswordVerifyRequest {
  password: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new APIError(
      error.detail || `HTTP ${response.status}`,
      response.status,
      error.code
    );
  }

  return response.json();
}

export const api = {
  // Get room details
  getRoom: (uuid: string) =>
    fetchAPI<VoteRoom>(`/rooms/${uuid}`),

  // Verify room password
  verifyPassword: (uuid: string, password: string) =>
    fetchAPI<{ verified: boolean }>(`/rooms/${uuid}/verify`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // List rooms
  listRooms: (params?: {
    search?: string;
    tags?: string[];
    sort?: 'latest' | 'popular';
    page?: number;
    page_size?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tags && params.tags.length > 0) searchParams.set('tags', params.tags.join(','));
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));

    const queryString = searchParams.toString();
    return fetchAPI<RoomListResponse>(`/rooms${queryString ? `?${queryString}` : ''}`);
  },

  // Create room
  createRoom: (payload: CreateRoomRequest) =>
    fetchAPI<CreateRoomResponse>(`/rooms`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Submit vote
  vote: (uuid: string, options: string[], fingerprint: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/rooms/${uuid}/vote`, {
      method: 'POST',
      body: JSON.stringify({ options, fingerprint }),
    }),

  // Get current results
  getResults: (uuid: string) =>
    fetchAPI<VoteResults>(`/rooms/${uuid}/results`),

  // WebSocket URL for real-time updates
  getWebSocketUrl: (uuid: string) => `${WS_URL}/ws/rooms/${uuid}`,
};
