// Core Types for LeadFlow AI
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'sales_rep' | 'viewer';
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  website?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  phone?: string;
  source: 'widget' | 'form' | 'api' | 'email' | 'manual';
  status: 'new' | 'qualifying' | 'qualified' | 'unqualified' | 'meeting_scheduled' | 'closed';
  score: number;
  classification: 'hot' | 'warm' | 'cold' | 'unqualified';
  assignedTo?: string;
  workspaceId: string;
  conversationId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  leadId: string;
  workspaceId: string;
  status: 'active' | 'completed' | 'abandoned';
  summary?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  leadId: string;
  workspaceId: string;
  title: string;
  scheduledAt: Date;
  duration: number;
  meetingUrl?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  attendees: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadScore {
  leadId: string;
  companyFit: number;
  budgetAlignment: number;
  timeline: number;
  authority: number;
  need: number;
  engagement: number;
  total: number;
  reasoning: string;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DashboardMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageScore: number;
  meetingsScheduled: number;
  recentActivity: Array<{
    id: string;
    type: 'lead_created' | 'lead_qualified' | 'meeting_scheduled';
    description: string;
    timestamp: Date;
  }>;
}