import { db } from '@/lib/db';
import { leads, leadScores, conversations } from '@/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { validateEmail, classifyLead } from '@/lib/utils';
import type { Lead, LeadScore } from '@/types';

export class LeadService {
  static async createLeadFromConversation(data: {
    email: string;
    name?: string;
    company?: string;
    industry?: string;
    companySize?: string;
    phone?: string;
    workspaceId: string;
    conversationId: string;
    metadata?: Record<string, any>;
  }): Promise<Lead | null> {
    try {
      if (!validateEmail(data.email)) {
        throw new Error('Invalid email address');
      }

      // Check if lead already exists
      const existingLead = await db
        .select()
        .from(leads)
        .where(and(
          eq(leads.email, data.email),
          eq(leads.workspaceId, data.workspaceId)
        ))
        .limit(1);

      if (existingLead.length > 0) {
        // Update existing lead with new conversation
        await db
          .update(leads)
          .set({
            conversationId: data.conversationId,
            name: data.name || existingLead[0].name,
            company: data.company || existingLead[0].company,
            industry: data.industry || existingLead[0].industry,
            companySize: data.companySize || existingLead[0].companySize,
            phone: data.phone || existingLead[0].phone,
            metadata: { ...existingLead[0].metadata, ...data.metadata },
            updatedAt: new Date(),
          })
          .where(eq(leads.id, existingLead[0].id));

        return existingLead[0];
      }

      // Create new lead
      const leadId = crypto.randomUUID();
      
      await db.insert(leads).values({
        id: leadId,
        email: data.email,
        name: data.name,
        company: data.company,
        industry: data.industry,
        companySize: data.companySize,
        phone: data.phone,
        source: 'widget',
        status: 'qualifying',
        score: 0,
        classification: 'cold',
        workspaceId: data.workspaceId,
        conversationId: data.conversationId,
        metadata: data.metadata || {},
      });

      const newLead = await db
        .select()
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1);

      return newLead[0] || null;
    } catch (error) {
      console.error('Failed to create lead from conversation:', error);
      return null;
    }
  }

  static async updateLeadFromConversation(leadId: string, data: {
    name?: string;
    company?: string;
    industry?: string;
    companySize?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.name) updateData.name = data.name;
      if (data.company) updateData.company = data.company;
      if (data.industry) updateData.industry = data.industry;
      if (data.companySize) updateData.companySize = data.companySize;
      if (data.phone) updateData.phone = data.phone;
      if (data.metadata) {
        // Merge with existing metadata
        const existingLead = await db
          .select({ metadata: leads.metadata })
          .from(leads)
          .where(eq(leads.id, leadId))
          .limit(1);

        if (existingLead.length > 0) {
          updateData.metadata = { ...existingLead[0].metadata, ...data.metadata };
        } else {
          updateData.metadata = data.metadata;
        }
      }

      await db
        .update(leads)
        .set(updateData)
        .where(eq(leads.id, leadId));

      return true;
    } catch (error) {
      console.error('Failed to update lead from conversation:', error);
      return false;
    }
  }

  static async updateLeadScore(leadId: string, scores: {
    companyFit: number;
    budgetAlignment: number;
    timeline: number;
    authority: number;
    need: number;
    engagement: number;
    reasoning: string;
  }): Promise<boolean> {
    try {
      // Calculate total score with weights
      const weights = {
        companyFit: 0.25,
        budgetAlignment: 0.20,
        timeline: 0.20,
        authority: 0.15,
        need: 0.10,
        engagement: 0.10,
      };

      const totalScore = Math.round(
        scores.companyFit * weights.companyFit +
        scores.budgetAlignment * weights.budgetAlignment +
        scores.timeline * weights.timeline +
        scores.authority * weights.authority +
        scores.need * weights.need +
        scores.engagement * weights.engagement
      );

      // Update or insert lead score
      await db.insert(leadScores).values({
        id: crypto.randomUUID(),
        leadId,
        companyFit: scores.companyFit,
        budgetAlignment: scores.budgetAlignment,
        timeline: scores.timeline,
        authority: scores.authority,
        need: scores.need,
        engagement: scores.engagement,
        total: totalScore,
        reasoning: scores.reasoning,
      }).onConflictDoUpdate({
        target: leadScores.leadId,
        set: {
          companyFit: scores.companyFit,
          budgetAlignment: scores.budgetAlignment,
          timeline: scores.timeline,
          authority: scores.authority,
          need: scores.need,
          engagement: scores.engagement,
          total: totalScore,
          reasoning: scores.reasoning,
          updatedAt: new Date(),
        },
      });

      // Update lead classification and status
      const classification = classifyLead(totalScore);
      const status = totalScore >= 70 ? 'qualified' : 'qualifying';

      await db
        .update(leads)
        .set({
          score: totalScore,
          classification,
          status,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, leadId));

      return true;
    } catch (error) {
      console.error('Failed to update lead score:', error);
      return false;
    }
  }

  static async getLeadWithScore(leadId: string): Promise<(Lead & { score?: LeadScore }) | null> {
    try {
      const result = await db
        .select({
          lead: leads,
          score: leadScores,
        })
        .from(leads)
        .leftJoin(leadScores, eq(leads.id, leadScores.leadId))
        .where(eq(leads.id, leadId))
        .limit(1);

      if (result.length === 0) return null;

      const { lead, score } = result[0];
      return {
        ...lead,
        score: score || undefined,
      };
    } catch (error) {
      console.error('Failed to get lead with score:', error);
      return null;
    }
  }

  static async getLeadsByWorkspace(workspaceId: string): Promise<Array<Lead & { score?: LeadScore }>> {
    try {
      const result = await db
        .select({
          lead: leads,
          score: leadScores,
        })
        .from(leads)
        .leftJoin(leadScores, eq(leads.id, leadScores.leadId))
        .where(eq(leads.workspaceId, workspaceId))
        .orderBy(desc(leads.updatedAt));

      return result.map(({ lead, score }) => ({
        ...lead,
        score: score || undefined,
      }));
    } catch (error) {
      console.error('Failed to get leads by workspace:', error);
      return [];
    }
  }

  static async getLeadAnalytics(workspaceId: string) {
    try {
      // Get total leads
      const totalResult = await db
        .select({ count: count() })
        .from(leads)
        .where(eq(leads.workspaceId, workspaceId));

      const total = totalResult[0]?.count || 0;

      // Get leads by status
      const statusResults = await db
        .select({
          status: leads.status,
          count: count(),
        })
        .from(leads)
        .where(eq(leads.workspaceId, workspaceId))
        .groupBy(leads.status);

      const statusCounts = statusResults.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, {} as Record<string, number>);

      // Get leads by classification
      const classificationResults = await db
        .select({
          classification: leads.classification,
          count: count(),
        })
        .from(leads)
        .where(eq(leads.workspaceId, workspaceId))
        .groupBy(leads.classification);

      const classificationCounts = classificationResults.reduce((acc, { classification, count }) => {
        acc[classification || 'cold'] = count;
        return acc;
      }, {} as Record<string, number>);

      // Get average score
      const avgScoreResult = await db
        .select({
          avgScore: sql<number>`AVG(${leads.score})`,
        })
        .from(leads)
        .where(eq(leads.workspaceId, workspaceId));

      const avgScore = Math.round(avgScoreResult[0]?.avgScore || 0);

      // Get conversion rate (qualified / total)
      const qualified = statusCounts.qualified || 0;
      const conversionRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

      return {
        total,
        new: statusCounts.new || 0,
        qualifying: statusCounts.qualifying || 0,
        qualified: statusCounts.qualified || 0,
        unqualified: statusCounts.unqualified || 0,
        meetingScheduled: statusCounts.meeting_scheduled || 0,
        closed: statusCounts.closed || 0,
        hot: classificationCounts.hot || 0,
        warm: classificationCounts.warm || 0,
        cold: classificationCounts.cold || 0,
        avgScore,
        conversionRate,
      };
    } catch (error) {
      console.error('Failed to get lead analytics:', error);
      return {
        total: 0,
        new: 0,
        qualifying: 0,
        qualified: 0,
        unqualified: 0,
        meetingScheduled: 0,
        closed: 0,
        hot: 0,
        warm: 0,
        cold: 0,
        avgScore: 0,
        conversionRate: 0,
      };
    }
  }
}