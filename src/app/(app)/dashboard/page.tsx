'use client';


import { MetricsCard } from '@/components/dashboard/metrics-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { AIProviderStatus } from '@/components/dashboard/ai-provider-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Calendar, 
  TrendingUp,
  MessageSquare,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks';

function DashboardContent() {
  const { data: metrics, loading, error, refreshAnalytics } = useAnalytics('30d');

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
            <Button onClick={refreshAnalytics}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

function DashboardMetrics({ metrics }: { metrics: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricsCard
        title="Total Leads"
        value={(metrics.totalLeads || 0).toLocaleString()}
        change={{
          value: metrics.totalLeadsChange || 0,
          type: (metrics.totalLeadsChange || 0) >= 0 ? 'increase' : 'decrease',
          period: 'last month'
        }}
        icon={<Users className="w-5 h-5 text-primary" />}
      />
      <MetricsCard
        title="Qualified Leads"
        value={metrics.qualifiedLeads || 0}
        change={{
          value: metrics.qualifiedLeadsChange || 0,
          type: (metrics.qualifiedLeadsChange || 0) >= 0 ? 'increase' : 'decrease',
          period: 'last week'
        }}
        icon={<Target className="w-5 h-5 text-green-600" />}
      />
      <MetricsCard
        title="Conversion Rate"
        value={`${metrics.conversionRate || 0}%`}
        change={{
          value: metrics.conversionRateChange || 0,
          type: (metrics.conversionRateChange || 0) >= 0 ? 'increase' : 'decrease',
          period: 'last month'
        }}
        icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
      />
      <MetricsCard
        title="Avg. Lead Score"
        value={metrics.averageScore || 0}
        change={{
          value: metrics.averageScoreChange || 0,
          type: (metrics.averageScoreChange || 0) >= 0 ? 'increase' : 'decrease',
          period: 'last week'
        }}
        icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
      />
    </div>
  );
}

function QuickActions({ metrics }: { metrics: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/leads?status=new">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Review New Leads</p>
                  <p className="text-sm text-gray-500">{metrics.totalLeads || 0} total leads</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>

          <Link href="/conversations?status=active">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Active Chats</p>
                  <p className="text-sm text-gray-500">{metrics.activeConversations || 0} ongoing</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>

          <Link href="/meetings">
            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Today's Meetings</p>
                  <p className="text-sm text-gray-500">{metrics.meetingsScheduled || 0} scheduled</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your leads.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={refreshAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/leads/new">
            <Button variant="coral">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <DashboardMetrics metrics={metrics} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 xl:col-span-2">
          <QuickActions metrics={metrics} />
        </div>

        {/* AI Provider Status */}
        <div className="lg:col-span-1">
          <AIProviderStatus />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 xl:col-span-3">
          <RecentActivity activities={metrics.recentActivity || []} />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.leadsBySource?.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{source.source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{source.percentage}%</span>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No lead source data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.leadsByStatus?.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status.status}</span>
                  <span className="text-sm font-medium">{status.count}</span>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No status data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}