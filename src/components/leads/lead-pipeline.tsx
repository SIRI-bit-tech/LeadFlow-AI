'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCard } from './lead-card';
// Note: Install @hello-pangea/dnd for drag and drop functionality
// For now, we'll create a simplified version without drag and drop
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Lead {
  id: string;
  name?: string;
  email: string;
  company?: string;
  industry?: string;
  phone?: string;
  status: string;
  classification: string;
  score: number;
  source: string;
  createdAt: Date;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  conversation?: {
    id: string;
    status: string;
    summary?: string;
    sentiment?: string;
  };
}

interface PipelineStage {
  id: string;
  title: string;
  status: string;
  color: string;
  leads: Lead[];
}

interface LeadPipelineProps {
  stages: PipelineStage[];
  onLeadMove?: (leadId: string, fromStage: string, toStage: string) => void;
  onLeadAssign?: (leadId: string) => void;
}

export function LeadPipeline({ stages: initialStages, onLeadMove, onLeadAssign }: LeadPipelineProps) {
  const [stages, setStages] = useState(initialStages);

  // Simplified version without drag and drop for now
  const handleLeadMove = (leadId: string, fromStage: string, toStage: string) => {
    if (onLeadMove) {
      onLeadMove(leadId, fromStage, toStage);
    }
  };

  return (
    <div className="h-full">
      <div className="flex space-x-6 h-full overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {stage.title}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${stage.color} text-white`}
                  >
                    {stage.leads.length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-3 min-h-[200px]">
                {stage.leads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-sm">No leads in this stage</p>
                  </div>
                ) : (
                  stage.leads.map((lead) => (
                    <div key={lead.id}>
                      <LeadCard
                        lead={lead}
                        onAssign={onLeadAssign}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}