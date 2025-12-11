'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatInterface } from '@/components/chat/chat-interface';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  MessageSquare,
  TrendingUp,
  User,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, getLeadStatusColor, getClassificationColor } from '@/lib/utils';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leadId, setLeadId] = useState<string>('');

  useEffect(() => {
    const initializePage = async () => {
      const { id } = await params;
      setLeadId(id);
      fetchLead(id);
    };
    initializePage();
  }, [params]);

  const fetchLead = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLead(data.data);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };
  const [activeTab, setActiveTab] = useState<'overview' | 'conversation' | 'activity'>('overview');

  const handleScoreUpdate = (newScore: number) => {
    setLead((prev: any) => ({ ...prev, score: newScore }));
  };

  const getInitials = (name?: string) => {
    if (!name) return lead?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h1>
        <p className="text-gray-600 mb-4">The lead you're looking for doesn't exist.</p>
        <Link href="/leads">
          <Button>Back to Leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lead.name || 'Unknown Lead'}
              </h1>
              <p className="text-gray-600">{lead.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Lead Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className={getLeadStatusColor(lead.status)}>
                  {lead.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Classification:</span>
                <Badge variant={lead.classification as any}>
                  {lead.classification}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Score:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        lead.score >= 80 ? 'bg-red-500' : 
                        lead.score >= 60 ? 'bg-yellow-500' : 
                        lead.score >= 40 ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${lead.score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{lead.score}/100</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Created: {formatDate(lead.createdAt)}</span>
              <span>Updated: {formatDate(lead.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: User },
            { id: 'conversation', name: 'Conversation', icon: MessageSquare },
            { id: 'activity', name: 'Activity', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'overview' && (
          <>
            {/* Lead Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{lead.email}</p>
                      </div>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{lead.phone}</p>
                        </div>
                      </div>
                    )}
                    {lead.company && (
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Company</p>
                          <p className="font-medium">{lead.company}</p>
                        </div>
                      </div>
                    )}
                    {lead.industry && (
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Industry</p>
                          <p className="font-medium">{lead.industry}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lead.score && Object.entries(lead.score).map(([key, value]) => {
                      if (key === 'reasoning' || key === 'total' || key === 'leadId' || key === 'updatedAt') return null;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${value}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{String(value)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {lead.score?.reasoning && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{lead.score.reasoning}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assigned User */}
              {lead.assignedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned To</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {lead.assignedUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lead.assignedUser.name}</p>
                        <p className="text-sm text-gray-600">{lead.assignedUser.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Meetings */}
              {lead.meetings && lead.meetings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lead.meetings.map((meeting: any) => (
                        <div key={meeting.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(meeting.scheduledAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lead Source */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Source:</span>
                      <span className="text-sm font-medium">{lead.source}</span>
                    </div>
                    {lead.metadata?.utm_campaign && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Campaign:</span>
                        <span className="text-sm font-medium">{lead.metadata.utm_campaign}</span>
                      </div>
                    )}
                    {lead.metadata?.referrer && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Referrer:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {new URL(lead.metadata.referrer).hostname}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'conversation' && (
          <div className="lg:col-span-3">
            <ChatInterface
              leadId={lead.id}
              conversationId={lead.conversation?.id || ''}
              leadName={lead.name}
              leadScore={lead.score}
              onScoreUpdate={handleScoreUpdate}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Activity timeline coming soon</p>
                  <p className="text-sm">Track all interactions and changes to this lead</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}