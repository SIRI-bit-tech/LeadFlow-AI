'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChatInterface } from '@/components/chat/chat-interface';
import type { Conversation, Lead, Message } from '@/types';

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [conversation, setConversation] = useState<(Conversation & { 
    lead?: Lead; 
    messageCount: number; 
    lastMessage?: Message;
  }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversation();
  }, [id]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      } else if (response.status === 404) {
        setError('Conversation not found');
      } else {
        setError('Failed to load conversation');
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/conversations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/conversations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/conversations')}>
              Back to Conversations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/conversations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Conversation with {conversation.lead?.name || 'Anonymous Lead'}
          </h1>
          <p className="text-gray-600">
            {conversation.lead?.email} • {conversation.messageCount} messages
          </p>
        </div>
        {conversation.lead && (
          <Link href={`/leads/${conversation.lead.id}`}>
            <Button variant="outline">
              View Lead Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface conversation={conversation} />
      </div>
    </div>
  );
}