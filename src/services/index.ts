// Export all services from a single entry point
export * from './conversation-service';
export * from './lead-service';
export * from './conversation';

// Re-export types for convenience
export type { 
  Conversation, 
  Message, 
  Lead, 
  LeadScore,
  ChatRequest,
  ChatResponse,
  LeadScoreBreakdown 
} from '@/types';