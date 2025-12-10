'use client';

import { useState, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  status: string;
  summary?: string;
  sentiment?: string;
  messages: Message[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name?: string;
    email: string;
    company?: string;
    classification: string;
    score: number;
  };
  lastMessage?: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data.conversations || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getConversation = async (id: string): Promise<Conversation | null> => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversation');
      return null;
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Return the response stream for real-time updates
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    getConversation,
    sendMessage,
  };
}