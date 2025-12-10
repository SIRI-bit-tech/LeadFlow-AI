'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatInterface } from '@/components/chat/chat-interface';
import { 
  ArrowLeft, 
  User, 
  Calendar,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function ConversationDetailPage({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversation();
  }, [params.id]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'summary'>('chat');

  const getInitials = (name?: string, email?: string) => {
    if (!name) return email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Conversation Not Found</h1>
        <p className="text-gray-600 mb-4">The conversation you're looking for doesn't exist.</p>
        <Link href="/conversations">
          <Button>Back to Conversations</Button>
        </Link>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/conversations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(conversation.lead.name, conversation.lead.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Conversation with {conversation.lead.name || 'Unknown Lead'}
              </h1>
              <p className="text-gray-600">{conversation.lead.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/leads/${conversation.lead.id}`}>
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              View Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {getStatusIcon(conversation.status)}
                <span className="text-sm font-medium capitalize">{conversation.status}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${getSentimentColor(conversation.sentiment)}`}>
                {conversation.sentiment} sentiment
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{conversation.messageCount} messages</span>
              </div>
              <Badge variant={conversation.lead.classification as any}>
                {conversation.lead.classification} lead
              </Badge>
              <Badge variant="outline">
                Score: {conversation.lead.score}/100
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Started {formatRelativeTime(conversation.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'chat', name: 'Live Chat', icon: MessageSquare },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp },
            { id: 'summary', name: 'Summary', icon: CheckCircle },
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {activeTab === 'chat' && (
          <>
            <div className="lg:col-span-3">
              <ChatInterface
                leadId={conversation.lead.id}
                conversationId={conversation.id}
                leadName={conversation.lead.name}
                leadScore={conversation.lead.score}
              />
            </div>
            <div className="space-y-6">
              {/* Lead Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{conversation.lead.email}</span>
                  </div>
                  {conversation.lead.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{conversation.lead.phone}</span>
                    </div>
                  )}
                  {conversation.lead.company && (
                    <div className="text-sm">
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-2 font-medium">{conversation.lead.company}</span>
                    </div>
                  )}
                  {conversation.lead.industry && (
                    <div className="text-sm">
                      <span className="text-gray-600">Industry:</span>
                      <span className="ml-2 font-medium">{conversation.lead.industry}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Assign to Rep
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {conversation.analytics.averageResponseTime}s
                  </div>
                  <p className="text-sm text-gray-600">Average response time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {conversation.analytics.totalDuration}m
                  </div>
                  <p className="text-sm text-gray-600">Total conversation time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 capitalize">
                    {conversation.analytics.leadEngagement}
                  </div>
                  <p className="text-sm text-gray-600">Lead engagement level</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Topics Discussed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {conversation.analytics.keyTopics.map((topic: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Buying Signals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conversation.analytics.buyingSignals.map((signal: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{signal}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {conversation.summary}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Information Gathered</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Company: {conversation.lead.company}</li>
                        <li>• Industry: {conversation.lead.industry}</li>
                        <li>• Team size: 50+ sales reps</li>
                        <li>• Monthly lead volume: 2,000 leads</li>
                        <li>• Current conversion rate: 3%</li>
                        <li>• Pain point: Manual, inconsistent qualification</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Next Steps</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Schedule product demo</li>
                        <li>• Provide ROI calculator</li>
                        <li>• Share case studies from similar companies</li>
                        <li>• Discuss implementation timeline</li>
                        <li>• Connect with decision makers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}