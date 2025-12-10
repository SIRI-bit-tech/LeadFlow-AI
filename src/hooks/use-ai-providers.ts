'use client';

import { useState, useEffect } from 'react';

export interface ProviderStatus {
  name: string;
  enabled: boolean;
  current: boolean;
}

export interface AIProviderData {
  availableProviders: string[];
  providerStatus: ProviderStatus[];
  totalProviders: number;
  hasBackup: boolean;
}

export function useAIProviders() {
  const [data, setData] = useState<AIProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const fetchProviderStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/providers');
      if (!response.ok) {
        throw new Error('Failed to fetch AI provider status');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch provider status');
    } finally {
      setLoading(false);
    }
  };

  const switchProvider = async (providerName: string) => {
    try {
      setSwitching(true);
      const response = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerName }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch AI provider');
      }

      const result = await response.json();
      await fetchProviderStatus(); // Refresh status
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch provider');
      throw err;
    } finally {
      setSwitching(false);
    }
  };

  const getCurrentProvider = () => {
    return data?.providerStatus.find(p => p.current);
  };

  const getAvailableProviders = () => {
    return data?.providerStatus.filter(p => p.enabled) || [];
  };

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  return {
    data,
    loading,
    error,
    switching,
    fetchProviderStatus,
    switchProvider,
    getCurrentProvider,
    getAvailableProviders,
  };
}