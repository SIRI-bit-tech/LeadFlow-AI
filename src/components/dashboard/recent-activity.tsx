import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { 
  UserPlus, 
  Target, 
  Calendar, 
  MessageSquare,
  TrendingUp 
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'lead_created' | 'lead_qualified' | 'meeting_scheduled' | 'conversation_started' | 'score_updated';
  description: string;
  timestamp: Date;
  leadName?: string;
  score?: number;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lead_created':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'lead_qualified':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'meeting_scheduled':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'conversation_started':
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      case 'score_updated':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lead_created':
        return <Badge variant="secondary">New Lead</Badge>;
      case 'lead_qualified':
        return <Badge variant="success">Qualified</Badge>;
      case 'meeting_scheduled':
        return <Badge className="bg-purple-100 text-purple-800">Meeting</Badge>;
      case 'conversation_started':
        return <Badge className="bg-orange-100 text-orange-800">Chat</Badge>;
      case 'score_updated':
        return <Badge variant="secondary">Scored</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as leads interact with your system</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.leadName && (
                        <span className="text-primary">{activity.leadName}</span>
                      )}
                      {activity.leadName ? ' - ' : ''}
                      {activity.description}
                    </p>
                    {getActivityBadge(activity.type)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                    {activity.score && (
                      <span className="text-xs font-medium text-gray-600">
                        Score: {activity.score}/100
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}