'use client';

import { useState, useEffect } from 'react';

export interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  phone?: string;
  source: string;
  status: string;
  score: number;
  classification: string;
  assignedTo?: string;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data.leads || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Partial<Lead>) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create lead');
      }
      
      const newLead = await response.json();
      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      throw err;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lead');
      }
      
      const updatedLead = await response.json();
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, ...updatedLead } : lead
      ));
      return updatedLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
      
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
      throw err;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}