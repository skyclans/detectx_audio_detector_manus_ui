/**
 * RunPod API Client
 * Fetches verification records from RunPod server database
 */

const RUNPOD_API_BASE_URL = process.env.RUNPOD_API_URL || 'https://emjvw2an6oynf9-8000.proxy.runpod.net';

// Types matching RunPod DB schema
export interface RunPodVerification {
  id: number;
  userId: number;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  fileKey: string;
  duration: number | null;
  sampleRate: number | null;
  bitDepth: number | null;
  channels: number | null;
  codec: string | null;
  fileHash: string | null;
  verdict: 'observed' | 'not_observed' | null;
  crgStatus: string | null;
  primaryExceededAxis: string | null;
  timelineMarkers: any | null;
  analysisData: any | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunPodStats {
  totalVerifications: number;
  observedCount: number;
  notObservedCount: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
}

export interface RunPodVerificationsResponse {
  verifications: RunPodVerification[];
  total: number;
  page: number;
  limit: number;
}

export interface RunPodUserStats {
  userId: number;
  totalVerifications: number;
  observedCount: number;
  notObservedCount: number;
}

// API Client Functions
export async function fetchRunPodHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${RUNPOD_API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`RunPod API health check failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchRunPodStats(): Promise<RunPodStats> {
  const response = await fetch(`${RUNPOD_API_BASE_URL}/api/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch RunPod stats: ${response.status}`);
  }
  return response.json();
}

export interface FetchVerificationsParams {
  page?: number;
  limit?: number;
  userId?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  verdict?: 'observed' | 'not_observed';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function fetchRunPodVerifications(
  params: FetchVerificationsParams = {}
): Promise<RunPodVerificationsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.userId) queryParams.set('userId', params.userId.toString());
  if (params.status) queryParams.set('status', params.status);
  if (params.verdict) queryParams.set('verdict', params.verdict);
  if (params.startDate) queryParams.set('startDate', params.startDate);
  if (params.endDate) queryParams.set('endDate', params.endDate);
  if (params.search) queryParams.set('search', params.search);
  
  const url = `${RUNPOD_API_BASE_URL}/api/verifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch RunPod verifications: ${response.status}`);
  }
  return response.json();
}

export async function fetchRunPodVerificationById(id: number): Promise<RunPodVerification> {
  const response = await fetch(`${RUNPOD_API_BASE_URL}/api/verifications/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch RunPod verification ${id}: ${response.status}`);
  }
  return response.json();
}

export async function fetchRunPodUserVerifications(
  userId: number,
  params: Omit<FetchVerificationsParams, 'userId'> = {}
): Promise<RunPodVerificationsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.status) queryParams.set('status', params.status);
  if (params.verdict) queryParams.set('verdict', params.verdict);
  if (params.startDate) queryParams.set('startDate', params.startDate);
  if (params.endDate) queryParams.set('endDate', params.endDate);
  if (params.search) queryParams.set('search', params.search);
  
  const url = `${RUNPOD_API_BASE_URL}/api/users/${userId}/verifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch RunPod user verifications: ${response.status}`);
  }
  return response.json();
}

export async function fetchRunPodUserStats(userId: number): Promise<RunPodUserStats> {
  const response = await fetch(`${RUNPOD_API_BASE_URL}/api/users/${userId}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch RunPod user stats: ${response.status}`);
  }
  return response.json();
}
