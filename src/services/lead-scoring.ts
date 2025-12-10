import { db, leads, leadScores } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { scoreLeadConversation } from '@/lib/ai';
import { calculateLeadScore, classifyLead } from '@/lib/utils';

export interface LeadScoringData {
  companyFit: number;
  budgetAlignment: number;
  timeline: number;
  authority: number;
  need: number;
  engagement: number;
}

export async function updateLeadScore(
  leadId: string,
  scores: LeadScoringData,
  reasoning: string
) {
  const totalScore = calculateLeadScore(scores);
  const classification = classifyLead(totalScore);

  // Update lead score
  await db.insert(leadScores).values({
    leadId,
    ...scores,
    total: totalScore,
    reasoning,
  }).onConflictDoUpdate({
    target: leadScores.leadId,
    set: {
      ...scores,
      total: totalScore,
      reasoning,
      updatedAt: new Date(),
    },
  });

  // Update lead classification and score
  await db.update(leads)
    .set({
      score: totalScore,
      classification,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  return { totalScore, classification };
}

export async function scoreLeadFromConversation(
  leadId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  leadData?: {
    company?: string;
    industry?: string;
    companySize?: string;
  }
) {
  try {
    const aiScoring = await scoreLeadConversation(messages, leadData);
    
    const scores: LeadScoringData = {
      companyFit: aiScoring.companyFit || 50,
      budgetAlignment: aiScoring.budgetAlignment || 50,
      timeline: aiScoring.timeline || 50,
      authority: aiScoring.authority || 50,
      need: aiScoring.need || 50,
      engagement: aiScoring.engagement || 50,
    };

    return await updateLeadScore(leadId, scores, aiScoring.reasoning);
  } catch (error) {
    console.error('Error scoring lead:', error);
    // Fallback scoring
    const defaultScores: LeadScoringData = {
      companyFit: 50,
      budgetAlignment: 50,
      timeline: 50,
      authority: 50,
      need: 50,
      engagement: 50,
    };
    return await updateLeadScore(leadId, defaultScores, 'Auto-scored due to AI error');
  }
}

export async function getLeadScore(leadId: string) {
  const score = await db.query.leadScores.findFirst({
    where: eq(leadScores.leadId, leadId),
  });
  return score;
}

export function calculateQualificationStatus(score: number): {
  status: 'hot' | 'warm' | 'cold' | 'unqualified';
  priority: 'high' | 'medium' | 'low';
  nextAction: string;
} {
  if (score >= 80) {
    return {
      status: 'hot',
      priority: 'high',
      nextAction: 'Schedule meeting immediately'
    };
  } else if (score >= 60) {
    return {
      status: 'warm',
      priority: 'medium',
      nextAction: 'Continue qualification or schedule demo'
    };
  } else if (score >= 40) {
    return {
      status: 'cold',
      priority: 'low',
      nextAction: 'Nurture with content'
    };
  } else {
    return {
      status: 'unqualified',
      priority: 'low',
      nextAction: 'Politely disengage or add to newsletter'
    };
  }
}