import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  User
} from 'lucide-react';
import { formatRelativeTime, getLeadStatusColor, getClassificationColor } from '@/lib/utils';
import Link from 'next/link';

interface LeadCardProps {
  lead: {
    id: string;
    name?: string;
    email: string;
    company?: string;
    industry?: string;
    phone?: string;
    status: string;
    classification: string;
    score: number;
    source: string;
    createdAt: Date;
    assignedUser?: {
      id: string;
      name: string;
      email: string;
    };
    conversation?: {
      id: string;
      status: string;
      summary?: string;
      sentiment?: string;
    };
  };
  onAssign?: (leadId: string) => void;
  onStatusChange?: (leadId: string, status: string) => void;
}

export function LeadCard({ lead, onAssign, onStatusChange }: LeadCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return lead.email.charAt(0).toUpperCase();
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="lead-card group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {lead.name || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {lead.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${getClassificationColor(lead.classification)}`}
              title={`${lead.classification} lead`}
            />
            <Badge variant="outline" className="text-xs">
              {lead.score}/100
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Company Info */}
        {lead.company && (
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-4 h-4 mr-2" />
            <span>{lead.company}</span>
            {lead.industry && (
              <span className="ml-2 text-gray-400">• {lead.industry}</span>
            )}
          </div>
        )}

        {/* Contact Info */}
        {lead.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{lead.phone}</span>
          </div>
        )}

        {/* Status and Classification */}
        <div className="flex items-center justify-between">
          <Badge className={getLeadStatusColor(lead.status)}>
            {lead.status.replace('_', ' ')}
          </Badge>
          <Badge variant={lead.classification as any}>
            {lead.classification}
          </Badge>
        </div>

        {/* Conversation Summary */}
        {lead.conversation?.summary && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Conversation Summary</span>
              {lead.conversation.sentiment && (
                <span className={`text-xs ${getSentimentColor(lead.conversation.sentiment)}`}>
                  {lead.conversation.sentiment}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {lead.conversation.summary}
            </p>
          </div>
        )}

        {/* Assigned User */}
        {lead.assignedUser && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>Assigned to {lead.assignedUser.name}</span>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Source: {lead.source}</span>
          <span>{formatRelativeTime(lead.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t">
          <Link href={`/leads/${lead.id}`}>
            <Button variant="outline" size="sm" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </Link>
          {lead.conversation && (
            <Link href={`/conversations/${lead.conversation.id}`}>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}