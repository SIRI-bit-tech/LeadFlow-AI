'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Search, 
  Clock,
  User,
  TrendingUp,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { useConversations, useDebounce } from '@/hooks';

export default function ConversationsPage() {
  const { conversations, loading, error, fetchConversations } = useConversations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.lead?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      conv.lead?.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      conv.lead?.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      conv.summary?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    const matchesSentiment = sentimentFilter === 'all' || conv.sentiment === sentimentFilter;
    
    return matchesSearch && matchesStatus && matchesSentiment;
  });

  const getInitials = (name?: string, email?: string) => {
    if (!name) return email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

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
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage AI-powered lead qualification conversations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchConversations} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">
                  {conversations.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive Sentiment</p>
                <p className="text-2xl font-bold text-green-600">
                  {conversations.filter(c => c.sentiment === 'positive').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Messages</p>
                <p className="text-2xl font-bold">
                  {conversations.length > 0 ? Math.round(conversations.reduce((acc, conv) => acc + conv.messageCount, 0) / conversations.length) : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
        </select>

        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading conversations: {error}</p>
              <Button onClick={fetchConversations}>Try Again</Button>
            </div>
          </div>
        ) : filteredConversations.map((conversation) => (
          <Card key={conversation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(conversation.lead?.name, conversation.lead?.email)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {conversation.lead?.name || 'Unknown Lead'}
                      </h3>
                      <Badge variant={conversation.lead?.classification as any}>
                        {conversation.lead?.classification}
                      </Badge>
                      <Badge variant="outline">
                        Score: {conversation.lead?.score || 0}/100
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>{conversation.lead?.email}</span>
                      {conversation.lead?.company && (
                        <>
                          <span>•</span>
                          <span>{conversation.lead?.company}</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {conversation.summary}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(conversation.status)}
                        <span className="capitalize">{conversation.status}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{conversation.messageCount} messages</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(conversation.sentiment || 'neutral')}`}>
                        {conversation.sentiment || 'neutral'}
                      </div>
                      <span>Updated {formatRelativeTime(conversation.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link href={`/conversations/${conversation.id}`}>
                    <Button variant="outline" size="sm">
                      View Chat
                    </Button>
                  </Link>
                  <Link href={`/leads/${conversation.lead?.id}`}>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Last Message Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    conversation.lastMessage?.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {conversation.lastMessage?.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 line-clamp-1">
                      {conversation.lastMessage?.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {conversation.lastMessage?.timestamp && formatRelativeTime(new Date(conversation.lastMessage.timestamp))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredConversations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || sentimentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Conversations will appear here as leads interact with your AI chat widget'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && sentimentFilter === 'all' && (
                <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
                  <h4 className="font-medium text-blue-900 mb-2">Start Generating Leads</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Install the AI chat widget on your website to automatically qualify visitors as leads.
                  </p>
                  <Link href="/widget-setup">
                    <Button className="w-full">
                      Get Widget Code
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}