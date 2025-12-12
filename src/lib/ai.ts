import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';

// AI Provider Configuration
const AI_PROVIDERS = [
  {
    name: 'OpenAI',
    model: openai('gpt-4o-mini'),
    apiKey: process.env.OPENAI_API_KEY,
    enabled: !!process.env.OPENAI_API_KEY,
  },
  {
    name: 'Google Gemini',
    model: google('gemini-1.5-flash'),
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    enabled: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
  {
    name: 'Anthropic Claude',
    model: anthropic('claude-3-5-sonnet-20241022'),
    apiKey: process.env.ANTHROPIC_API_KEY,
    enabled: !!process.env.ANTHROPIC_API_KEY,
  },
];

// Get available providers
export const getAvailableProviders = () => {
  return AI_PROVIDERS.filter(provider => provider.enabled);
};

// Get primary AI model (first available provider)
export const ai = (() => {
  const availableProviders = getAvailableProviders();
  
  if (availableProviders.length === 0) {
    throw new Error('No AI providers configured. Please add at least one API key to your environment variables.');
  }
  
  return availableProviders[0].model;
})();

// AI Provider with automatic fallback
export class AIService {
  private static providers = getAvailableProviders();
  private static currentProviderIndex = 0;

  static async generateText(prompt: string, options: any = {}) {
    let lastError: Error | null = null;
    
    // Try each provider in order
    for (let i = 0; i < this.providers.length; i++) {
      const providerIndex = (this.currentProviderIndex + i) % this.providers.length;
      const provider = this.providers[providerIndex];
      
      try {
        // If we have messages, don't pass prompt
        const generateOptions: any = {
          model: provider.model,
          ...options,
        };
        
        // Only add prompt if it's not empty and we don't have messages
        if (prompt && !options.messages) {
          generateOptions.prompt = prompt;
        }
        
        const result = await generateText(generateOptions);
        
        // Success - update current provider index for next time
        this.currentProviderIndex = providerIndex;
        
        return result;
      } catch (error) {
        console.warn(`❌ AI generation failed with ${provider.name}:`, error);
        lastError = error as Error;
        
        // If this was a rate limit or quota error, try next provider
        if (this.isRetryableError(error)) {
          continue;
        }
        
        // If it's a non-retryable error, still try other providers
        continue;
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  static async streamText(prompt: string, options: any = {}) {
    let lastError: Error | null = null;
    
    // Try each provider in order
    for (let i = 0; i < this.providers.length; i++) {
      const providerIndex = (this.currentProviderIndex + i) % this.providers.length;
      const provider = this.providers[providerIndex];
      
      try {
        // If we have messages, don't pass prompt
        const streamOptions: any = {
          model: provider.model,
          ...options,
        };
        
        // Only add prompt if it's not empty and we don't have messages
        if (prompt && !options.messages) {
          streamOptions.prompt = prompt;
        }
        
        const result = streamText(streamOptions);
        
        // Success - update current provider index for next time
        this.currentProviderIndex = providerIndex;
        
        return result;
      } catch (error) {
        console.warn(`❌ AI streaming failed with ${provider.name}:`, error);
        lastError = error as Error;
        
        // If this was a rate limit or quota error, try next provider
        if (this.isRetryableError(error)) {
          continue;
        }
        
        // If it's a non-retryable error, still try other providers
        continue;
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  private static isRetryableError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code || error?.status;
    
    // Common rate limit and quota error indicators
    return (
      errorCode === 429 || // Rate limit
      errorCode === 402 || // Payment required
      errorCode === 403 || // Forbidden (often quota)
      errorMessage.includes('rate limit') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('billing') ||
      errorMessage.includes('insufficient') ||
      errorMessage.includes('exceeded')
    );
  }

  static getProviderStatus() {
    return this.providers.map((provider, index) => ({
      name: provider.name,
      enabled: provider.enabled,
      current: index === this.currentProviderIndex,
    }));
  }

  static switchProvider(providerName: string) {
    const providerIndex = this.providers.findIndex(p => p.name === providerName);
    if (providerIndex !== -1) {
      this.currentProviderIndex = providerIndex;
      return true;
    }
    return false;
  }
}

export const LEAD_QUALIFICATION_PROMPT = `You are a professional, friendly lead qualification assistant for LeadFlow AI. Your goal is to:

1. Engage leads in natural conversation
2. Gather key qualifying information: company size, industry, budget indication, timeline, decision authority
3. Assess lead quality and score them appropriately
4. Schedule meetings with qualified leads
5. Provide helpful resources to all leads

Guidelines:
- Be warm and professional, not pushy
- Ask one question at a time
- Show genuine interest
- Use their name if provided
- Offer value in every interaction
- Detect buying signals
- Handle objections gracefully
- If unqualified, provide resources politely

When qualified (score > 70), offer to schedule a meeting.`;

export async function generateLeadResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  leadContext?: {
    name?: string;
    company?: string;
    industry?: string;
    source?: string;
  }
) {
  const contextPrompt = leadContext ? `
Lead Context:
- Name: ${leadContext.name || 'Unknown'}
- Company: ${leadContext.company || 'Unknown'}
- Industry: ${leadContext.industry || 'Unknown'}
- Source: ${leadContext.source || 'Unknown'}
` : '';

  // Add system message with the qualification prompt
  const systemMessage = {
    role: 'system' as const,
    content: LEAD_QUALIFICATION_PROMPT + contextPrompt
  };

  const allMessages = [systemMessage, ...messages];

  return AIService.streamText('', {
    messages: allMessages,
    temperature: 0.7,
  });
}

export async function scoreLeadConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  leadData?: {
    company?: string;
    industry?: string;
    companySize?: string;
  }
) {
  const prompt = `Analyze this lead qualification conversation and provide a detailed scoring breakdown.

Lead Data:
${leadData ? JSON.stringify(leadData, null, 2) : 'No additional data'}

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Score each category (0-100):
1. Company Fit (25% weight) - Does company size/industry match target?
2. Budget Alignment (20% weight) - Stated or implied budget availability?
3. Timeline (20% weight) - Urgency and decision timeline?
4. Authority (15% weight) - Decision-making power?
5. Need (10% weight) - Pain point severity and fit?
6. Engagement (10% weight) - Response quality and interest?

Respond with JSON only:
{
  "companyFit": number,
  "budgetAlignment": number,
  "timeline": number,
  "authority": number,
  "need": number,
  "engagement": number,
  "reasoning": "detailed explanation",
  "sentiment": "positive|neutral|negative",
  "buyingSignals": ["signal1", "signal2"],
  "nextSteps": "recommended action"
}`;

  try {
    const result = await AIService.generateText(prompt, {
      temperature: 0.3,
    });

    return JSON.parse(result.text);
  } catch (error) {
    console.error('Failed to parse AI scoring response:', error);
    return {
      companyFit: 50,
      budgetAlignment: 50,
      timeline: 50,
      authority: 50,
      need: 50,
      engagement: 50,
      reasoning: 'Unable to analyze conversation',
      sentiment: 'neutral',
      buyingSignals: [],
      nextSteps: 'Continue qualification'
    };
  }
}

export async function generateConversationSummary(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  const prompt = `Summarize this lead qualification conversation in 2-3 sentences. Focus on:
- Key information gathered about the lead
- Their main pain points or needs
- Their level of interest and qualification status

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  const result = await AIService.generateText(prompt, {
    temperature: 0.5,
  });

  return result.text;
}

export async function generateFollowUpEmail(
  leadData: {
    name?: string;
    company?: string;
    painPoints?: string[];
    score: number;
  },
  conversationSummary: string
) {
  const prompt = `Generate a personalized follow-up email for this lead:

Lead: ${leadData.name || 'there'} from ${leadData.company || 'their company'}
Score: ${leadData.score}/100
Pain Points: ${leadData.painPoints?.join(', ') || 'None identified'}

Conversation Summary: ${conversationSummary}

Write a professional, helpful email that:
- References their specific challenges
- Provides value (insight, resource, or next step)
- Has a clear but non-pushy call-to-action
- Matches their qualification level

Return JSON with subject and body:
{
  "subject": "email subject",
  "body": "email body in HTML format"
}`;

  try {
    const result = await AIService.generateText(prompt, {
      temperature: 0.6,
    });

    return JSON.parse(result.text);
  } catch (error) {
    return {
      subject: `Following up on our conversation`,
      body: `Hi ${leadData.name || 'there'},<br><br>Thanks for taking the time to chat with us. Based on our conversation, I think we could help with your challenges.<br><br>Would you be interested in a quick call to discuss this further?<br><br>Best regards,<br>The Team`
    };
  }
}