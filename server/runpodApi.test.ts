/**
 * RunPod API Client Tests
 * 
 * Tests for the RunPod API client functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking fetch
import {
  fetchRunPodHealth,
  fetchRunPodStats,
  fetchRunPodVerifications,
  fetchRunPodVerificationById,
  fetchRunPodUserVerifications,
  fetchRunPodUserStats,
} from './runpodApi';

describe('RunPod API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRunPodHealth', () => {
    it('should return health status when API is healthy', async () => {
      const mockResponse = { status: 'healthy', service: 'detectx-db-api' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchRunPodHealth();
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health')
      );
    });

    it('should throw error when API is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      await expect(fetchRunPodHealth()).rejects.toThrow('RunPod API health check failed: 503');
    });
  });

  describe('fetchRunPodStats', () => {
    it('should return verification statistics', async () => {
      const mockStats = {
        totalVerifications: 100,
        observedCount: 30,
        notObservedCount: 60,
        pendingCount: 10,
        completedCount: 90,
        failedCount: 0,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const result = await fetchRunPodStats();
      
      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/stats')
      );
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchRunPodStats()).rejects.toThrow('Failed to fetch RunPod stats: 500');
    });
  });

  describe('fetchRunPodVerifications', () => {
    it('should return paginated verifications', async () => {
      const mockResponse = {
        verifications: [
          { id: 1, fileName: 'test.mp3', verdict: 'observed' },
          { id: 2, fileName: 'test2.mp3', verdict: 'not_observed' },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchRunPodVerifications({ page: 1, limit: 20 });
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/verifications')
      );
    });

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verifications: [], total: 0, page: 1, limit: 10 }),
      });

      await fetchRunPodVerifications({
        page: 2,
        limit: 10,
        verdict: 'observed',
        status: 'completed',
        search: 'test',
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('verdict=observed');
      expect(calledUrl).toContain('status=completed');
      expect(calledUrl).toContain('search=test');
    });

    it('should handle empty parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verifications: [], total: 0, page: 1, limit: 20 }),
      });

      await fetchRunPodVerifications();

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/api/verifications');
    });
  });

  describe('fetchRunPodVerificationById', () => {
    it('should return single verification by ID', async () => {
      const mockVerification = {
        id: 1,
        fileName: 'test.mp3',
        verdict: 'observed',
        status: 'completed',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerification),
      });

      const result = await fetchRunPodVerificationById(1);
      
      expect(result).toEqual(mockVerification);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/verifications/1')
      );
    });

    it('should throw error when verification not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchRunPodVerificationById(999)).rejects.toThrow('Failed to fetch RunPod verification 999: 404');
    });
  });

  describe('fetchRunPodUserVerifications', () => {
    it('should return user-specific verifications', async () => {
      const mockResponse = {
        verifications: [
          { id: 1, fileName: 'user1-test.mp3', verdict: 'observed' },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchRunPodUserVerifications(123);
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/123/verifications')
      );
    });

    it('should include pagination and filter parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verifications: [], total: 0, page: 1, limit: 10 }),
      });

      await fetchRunPodUserVerifications(123, {
        page: 2,
        limit: 10,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('/api/users/123/verifications');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('startDate=2025-01-01');
      expect(calledUrl).toContain('endDate=2025-01-31');
    });
  });

  describe('fetchRunPodUserStats', () => {
    it('should return user-specific statistics', async () => {
      const mockStats = {
        userId: 123,
        totalVerifications: 50,
        observedCount: 20,
        notObservedCount: 30,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const result = await fetchRunPodUserStats(123);
      
      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/123/stats')
      );
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchRunPodUserStats(999)).rejects.toThrow('Failed to fetch RunPod user stats: 404');
    });
  });
});
