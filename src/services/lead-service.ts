import { db } from '@/lib/db';
import { leads, leadScores } from '@/db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
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

      const leadId = crypto.randomUUID();
      const now = new Date();
      
      // Use upsert to avoid race conditions
      const result = await db.insert(leads).values({
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
        createdAt: now,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [leads.email, leads.workspaceId],
        set: {
          conversationId: data.conversationId,
          // Prefer non-empty incoming values, otherwise keep existing
          name: sql`CASE WHEN ${data.name} IS NOT NULL AND ${data.name} != '' THEN ${data.name} ELSE ${leads.name} END`,
          company: sql`CASE WHEN ${data.company} IS NOT NULL AND ${data.company} != '' THEN ${data.company} ELSE ${leads.company} END`,
          industry: sql`CASE WHEN ${data.industry} IS NOT NULL AND ${data.industry} != '' THEN ${data.industry} ELSE ${leads.industry} END`,
          companySize: sql`CASE WHEN ${data.companySize} IS NOT NULL AND ${data.companySize} != '' THEN ${data.companySize} ELSE ${leads.companySize} END`,
          phone: sql`CASE WHEN ${data.phone} IS NOT NULL AND ${data.phone} != '' THEN ${data.phone} ELSE ${leads.phone} END`,
          // Merge metadata with existing metadata
          metadata: sql`${leads.metadata} || ${data.metadata || {}}`,
          updatedAt: now,
        },
      }).returning();

      const lead = result[0];
      if (!lead) return null;
      
      // Convert null values to undefined for TypeScript compatibility
      return {
        ...lead,
        name: lead.name || undefined,
        company: lead.company || undefined,
        industry: lead.industry || undefined,
        companySize: lead.companySize || undefined,
        phone: lead.phone || undefined,
      } as Lead;
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
  }): Promise<Lead | null> {
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
          const existingMetadata = existingLead[0].metadata as Record<string, any> || {};
          updateData.metadata = { ...existingMetadata, ...data.metadata };
        } else {
          updateData.metadata = data.metadata;
        }
      }

      const result = await db
        .update(leads)
        .set(updateData)
        .where(eq(leads.id, leadId))
        .returning();

      const lead = result[0];
      if (!lead) return null;

      // Convert null values to undefined for TypeScript compatibility
      return {
        ...lead,
        name: lead.name || undefined,
        company: lead.company || undefined,
        industry: lead.industry || undefined,
        companySize: lead.companySize || undefined,
        phone: lead.phone || undefined,
      } as Lead;
    } catch (error) {
      console.error('Failed to update lead from conversation:', error);
      return null;
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

  static async getLeadWithScore(leadId: string): Promise<(Lead & { leadScore?: LeadScore }) | null> {
    try {
      const result = await db
        .select({
          lead: leads,
          leadScore: leadScores,
        })
        .from(leads)
        .leftJoin(leadScores, eq(leads.id, leadScores.leadId))
        .where(eq(leads.id, leadId))
        .limit(1);

      if (result.length === 0) return null;

      const { lead, leadScore } = result[0];
      return {
        ...lead,
        name: lead.name || undefined,
        company: lead.company || undefined,
        industry: lead.industry || undefined,
        companySize: lead.companySize || undefined,
        phone: lead.phone || undefined,
        leadScore: leadScore || undefined,
      } as Lead & { leadScore?: LeadScore };
    } catch (error) {
      console.error('Failed to get lead with score:', error);
      return null;
    }
  }

  static async getLeadsByWorkspace(workspaceId: string): Promise<Array<Lead & { leadScore?: LeadScore }>> {
    try {
      const result = await db
        .select({
          lead: leads,
          leadScore: leadScores,
        })
        .from(leads)
        .leftJoin(leadScores, eq(leads.id, leadScores.leadId))
        .where(eq(leads.workspaceId, workspaceId))
        .orderBy(desc(leads.updatedAt));

      return result.map(({ lead, leadScore }) => ({
        ...lead,
        name: lead.name || undefined,
        company: lead.company || undefined,
        industry: lead.industry || undefined,
        companySize: lead.companySize || undefined,
        phone: lead.phone || undefined,
        leadScore: leadScore || undefined,
      })) as Array<Lead & { leadScore?: LeadScore }>;
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