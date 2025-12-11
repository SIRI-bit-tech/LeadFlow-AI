'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ProviderStatus {
  name: string;
  enabled: boolean;
  current: boolean;
}

interface AIProviderData {
  availableProviders: string[];
  providerStatus: ProviderStatus[];
  totalProviders: number;
}

export function AIProviderStatus() {
  const [data, setData] = useState<AIProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const fetchProviderStatus = async () => {
    try {
      const response = await fetch('/api/ai/providers');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else if (response.status === 401) {
        // Handle authentication error silently - don't expose to user
        setData(null);
      } else {
        // Handle other errors
        setData(null);
      }
    } catch (error) {
      // Don't log sensitive error details in production
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const switchProvider = async (providerName: string) => {
    setSwitching(true);
    try {
      const response = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerName })
      });

      if (response.ok) {
        await fetchProviderStatus(); // Refresh status
      } else if (response.status === 401) {
        // Handle authentication error silently
        setData(null);
      }
    } catch (error) {
      // Don't expose error details
      setData(null);
    } finally {
      setSwitching(false);
    }
  };

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            AI Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Failed to load AI provider status</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProviderStatus}
            className="mt-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentProvider = data.providerStatus.find(p => p.current);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI Providers
        </CardTitle>
        <CardDescription>
          {data.totalProviders} provider{data.totalProviders !== 1 ? 's' : ''} configured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Provider */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium">Active Provider</span>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800">
            {currentProvider?.name || 'Unknown'}
          </Badge>
        </div>

        {/* All Providers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Available Providers</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProviderStatus}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="space-y-2">
            {data.providerStatus.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    provider.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className={provider.current ? 'font-medium' : ''}>
                    {provider.name}
                  </span>
                  {provider.current && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                {provider.enabled && !provider.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchProvider(provider.name)}
                    disabled={switching}
                  >
                    Switch
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>


      </CardContent>
    </Card>
  );
}