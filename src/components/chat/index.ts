// Export all chat components from a single entry point
export { ChatInterface } from './chat-interface';

// Re-export types for convenience
export type { 
  Message, 
  Conversation, 
  Lead,
  ChatRequest,
  ChatResponse 
} from '@/types';