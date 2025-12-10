'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LeadCard } from '@/components/leads/lead-card';
import { LeadPipeline } from '@/components/leads/lead-pipeline';
import { 
  Search, 
  Plus, 
  Download,
  Grid,
  List,
  Users,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useLeads, useDebounce } from '@/hooks';

export default function LeadsPage() {
  const { leads, loading, error, updateLead, fetchLeads } = useLeads();
  const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredLeads = leads
    .map(lead => ({
      ...lead,
      createdAt: new Date(lead.createdAt),
    }))
    .filter(lead => {
      const matchesSearch = 
        lead.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesClassification = classificationFilter === 'all' || lead.classification === classificationFilter;
      
      return matchesSearch && matchesStatus && matchesClassification;
    });

  const pipelineStages = [
    {
      id: 'new',
      title: 'New Leads',
      status: 'new',
      color: 'bg-blue-500',
      leads: filteredLeads.filter(lead => lead.status === 'new'),
    },
    {
      id: 'qualifying',
      title: 'Qualifying',
      status: 'qualifying',
      color: 'bg-yellow-500',
      leads: filteredLeads.filter(lead => lead.status === 'qualifying'),
    },
    {
      id: 'qualified',
      title: 'Qualified',
      status: 'qualified',
      color: 'bg-green-500',
      leads: filteredLeads.filter(lead => lead.status === 'qualified'),
    },
    {
      id: 'meeting_scheduled',
      title: 'Meeting Scheduled',
      status: 'meeting_scheduled',
      color: 'bg-purple-500',
      leads: filteredLeads.filter(lead => lead.status === 'meeting_scheduled'),
    },
    {
      id: 'closed',
      title: 'Closed',
      status: 'closed',
      color: 'bg-gray-500',
      leads: filteredLeads.filter(lead => lead.status === 'closed'),
    },
  ];

  const handleLeadMove = async (leadId: string, _fromStage: string, toStage: string) => {
    try {
      await updateLead(leadId, { status: toStage });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleLeadAssign = (leadId: string) => {
    // In real app, open assignment modal
    console.log('Assign lead:', leadId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">
            Manage and qualify your leads with AI-powered conversations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/leads/new">
            <Button variant="coral">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">
                  {leads.filter(l => l.classification === 'hot').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warm Leads</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {leads.filter(l => l.classification === 'warm').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(leads.reduce((acc, lead) => acc + lead.score, 0) / leads.length)}
                </p>
              </div>
              <div className="text-sm text-gray-500">/100</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="qualifying">Qualifying</option>
            <option value="qualified">Qualified</option>
            <option value="meeting_scheduled">Meeting Scheduled</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Classifications</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
            <option value="unqualified">Unqualified</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'pipeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('pipeline')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-500">Loading leads...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading leads: {error}</p>
            <Button onClick={fetchLeads}>Try Again</Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onAssign={handleLeadAssign}
            />
          ))}
          {filteredLeads.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || classificationFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first lead'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && classificationFilter === 'all' && (
                <Link href="/leads/new">
                  <Button variant="coral">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="h-[calc(100vh-300px)]">
          <LeadPipeline
            stages={pipelineStages}
            onLeadMove={handleLeadMove}
            onLeadAssign={handleLeadAssign}
          />
        </div>
      )}
    </div>
  );
}