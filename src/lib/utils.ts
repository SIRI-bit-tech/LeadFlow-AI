import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

export function getLeadStatusColor(status: string): string {
  const colors = {
    new: 'bg-blue-100 text-blue-800',
    qualifying: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    unqualified: 'bg-red-100 text-red-800',
    meeting_scheduled: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return colors[status as keyof typeof colors] || colors.new;
}

export function getClassificationColor(classification: string): string {
  const colors = {
    hot: 'bg-red-500',
    warm: 'bg-yellow-500',
    cold: 'bg-blue-500',
    unqualified: 'bg-gray-500',
  };
  return colors[classification as keyof typeof colors] || colors.cold;
}

export function calculateLeadScore(scores: {
  companyFit: number;
  budgetAlignment: number;
  timeline: number;
  authority: number;
  need: number;
  engagement: number;
}): number {
  const weights = {
    companyFit: 0.25,
    budgetAlignment: 0.20,
    timeline: 0.20,
    authority: 0.15,
    need: 0.10,
    engagement: 0.10,
  };

  return Math.round(
    scores.companyFit * weights.companyFit +
    scores.budgetAlignment * weights.budgetAlignment +
    scores.timeline * weights.timeline +
    scores.authority * weights.authority +
    scores.need * weights.need +
    scores.engagement * weights.engagement
  );
}

export function classifyLead(score: number): 'hot' | 'warm' | 'cold' | 'unqualified' {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'warm';
  if (score >= 40) return 'cold';
  return 'unqualified';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}