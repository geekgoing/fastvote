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
}

export interface VoteResults {
  room_uuid: string;
  results: Record<string, number>;
  total_votes: number;
}

export interface VoteRequest {
  option: string;
  fingerprint: string;
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

  // Submit vote
  vote: (uuid: string, option: string, fingerprint: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/rooms/${uuid}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option, fingerprint }),
    }),

  // Get current results
  getResults: (uuid: string) =>
    fetchAPI<VoteResults>(`/rooms/${uuid}/results`),

  // WebSocket URL for real-time updates
  getWebSocketUrl: (uuid: string) => `${WS_URL}/ws/rooms/${uuid}`,
};
