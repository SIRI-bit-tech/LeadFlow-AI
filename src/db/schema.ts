import { pgTable, text, timestamp, integer, jsonb, boolean, uuid, varchar, decimal, unique, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// Users table (Better Auth compatible)
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  image: text('image'),
  emailVerified: boolean('emailVerified').default(false),
  passwordHash: text('password_hash'),
  role: varchar('role', { length: 50 }).notNull().default('sales_rep'),
  workspaceId: uuid('workspace_id').notNull(),
  // Onboarding fields
  companyName: varchar('company_name', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  teamSize: varchar('team_size', { length: 50 }),
  goals: text('goals'), // JSON string of selected goals
  integrations: text('integrations'), // JSON string of selected integrations
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => ({
  emailLowerUnique: uniqueIndex('user_email_lower_unique').on(sql`lower(${table.email})`),
}));

// Better Auth required tables
export const sessions = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
});

export const accounts = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const verifications = pgTable('verification', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Workspaces table
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  companySize: varchar('company_size', { length: 50 }),
  website: varchar('website', { length: 255 }),
  ownerId: uuid('owner_id').notNull(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Leads table
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  company: varchar('company', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  companySize: varchar('company_size', { length: 50 }),
  phone: varchar('phone', { length: 50 }),
  source: varchar('source', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  score: integer('score').default(0),
  classification: varchar('classification', { length: 50 }).default('cold'),
  assignedTo: uuid('assigned_to'),
  workspaceId: uuid('workspace_id').notNull(),
  conversationId: uuid('conversation_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailWorkspaceUnique: unique('leads_email_workspace_unique').on(table.email, table.workspaceId),
}));

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull(),
  workspaceId: uuid('workspace_id').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  summary: text('summary'),
  sentiment: varchar('sentiment', { length: 50 }).default('neutral'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Meetings table
export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull(),
  workspaceId: uuid('workspace_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('meeting'), // meeting, call, demo
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').notNull().default(30),
  meetingUrl: text('meeting_url'),
  status: varchar('status', { length: 50 }).notNull().default('scheduled'),
  attendees: jsonb('attendees').default([]),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Lead scores table
export const leadScores = pgTable('lead_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().unique(),
  companyFit: integer('company_fit').default(0),
  budgetAlignment: integer('budget_alignment').default(0),
  timeline: integer('timeline').default(0),
  authority: integer('authority').default(0),
  need: integer('need').default(0),
  engagement: integer('engagement').default(0),
  total: integer('total').default(0),
  reasoning: text('reasoning'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [users.workspaceId],
    references: [workspaces.id],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(users),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [leads.workspaceId],
    references: [workspaces.id],
  }),
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [leads.conversationId],
    references: [conversations.id],
  }),
  score: one(leadScores, {
    fields: [leads.id],
    references: [leadScores.leadId],
  }),
  meetings: many(meetings),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  lead: one(leads, {
    fields: [conversations.leadId],
    references: [leads.id],
  }),
  workspace: one(workspaces, {
    fields: [conversations.workspaceId],
    references: [workspaces.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  lead: one(leads, {
    fields: [meetings.leadId],
    references: [leads.id],
  }),
  workspace: one(workspaces, {
    fields: [meetings.workspaceId],
    references: [workspaces.id],
  }),
}));

export const leadScoresRelations = relations(leadScores, ({ one }) => ({
  lead: one(leads, {
    fields: [leadScores.leadId],
    references: [leads.id],
  }),
}));