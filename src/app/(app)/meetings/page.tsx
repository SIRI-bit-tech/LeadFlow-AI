'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Search, 
  Clock,
  User,
  Plus,
  RefreshCw,
  Video,
  Phone,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { useCalendar, useDebounce } from '@/hooks';

export default function MeetingsPage() {
  const { meetings, loading, error, fetchMeetings } = useCalendar();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = 
      meeting.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      meeting.lead?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      meeting.lead?.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      meeting.lead?.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no_show': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'in_person':
        return <MapPin className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">
            Manage meetings with your qualified leads
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => fetchMeetings()} disabled={loading}>
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
                <p className="text-sm text-gray-600">Total Meetings</p>
                <p className="text-2xl font-bold">{meetings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {meetings.filter(m => m.status === 'scheduled').length}
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {meetings.filter(m => m.status === 'completed').length}
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
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">
                  {meetings.filter(m => {
                    const meetingDate = new Date(m.scheduledAt);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return meetingDate >= now && meetingDate <= weekFromNow;
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search meetings..."
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
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Loading meetings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading meetings: {error}</p>
              <Button onClick={() => fetchMeetings()}>Try Again</Button>
            </div>
          </div>
        ) : filteredMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {meeting.lead?.name?.charAt(0) || meeting.lead?.email?.charAt(0) || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {meeting.title}
                      </h3>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                      {meeting.lead?.classification && (
                        <Badge variant="outline" className={`${
                          meeting.lead.classification === 'hot' ? 'border-red-500 text-red-700' :
                          meeting.lead.classification === 'warm' ? 'border-orange-500 text-orange-700' :
                          meeting.lead.classification === 'cold' ? 'border-blue-500 text-blue-700' :
                          'border-gray-500 text-gray-700'
                        }`}>
                          {meeting.lead.classification}
                        </Badge>
                      )}

                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>{meeting.lead?.name || 'Unknown Lead'}</span>
                      <span>•</span>
                      <span>{meeting.lead?.email}</span>
                      {meeting.lead?.company && (
                        <>
                          <span>•</span>
                          <span>{meeting.lead?.company}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(meeting.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(meeting.type || 'meeting')}
                        <span className="capitalize">{meeting.type || 'meeting'}</span>
                      </div>
                    </div>

                    {meeting.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{meeting.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {meeting.meetingUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                        Join
                      </a>
                    </Button>
                  )}
                  <Link href={`/meetings/${meeting.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Link href={`/leads/${meeting.lead?.id}`}>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredMeetings.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Meetings will appear here when scheduled with qualified leads'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
                  <h4 className="font-medium text-blue-900 mb-2">Schedule Meetings</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Meetings can be scheduled directly from qualified leads or through the AI chat widget.
                  </p>
                  <Link href="/leads">
                    <Button className="w-full">
                      View Qualified Leads
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