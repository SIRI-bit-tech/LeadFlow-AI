import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricsCard({ title, value, change, icon, className }: MetricsCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return 'secondary';
    
    switch (change.type) {
      case 'increase':
        return 'success';
      case 'decrease':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className={`metric-card ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {value}
        </div>
        {change && (
          <div className="flex items-center space-x-2">
            <Badge variant={getTrendColor() as any} className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className="text-xs">
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
            </Badge>
            <span className="text-xs text-gray-500">
              vs {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}