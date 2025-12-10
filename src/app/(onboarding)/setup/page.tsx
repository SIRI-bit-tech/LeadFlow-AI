'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building, Users, Target, Zap } from 'lucide-react';

interface OnboardingData {
  companyName: string;
  industry: string;
  teamSize: string;
  goals: string[];
  integrations: string[];
}

export default function OnboardingSetup() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    companyName: '',
    industry: '',
    teamSize: '',
    goals: [],
    integrations: []
  });

  const steps = [
    { id: 'company', title: 'Company Info', icon: Building },
    { id: 'team', title: 'Team Size', icon: Users },
    { id: 'goals', title: 'Goals', icon: Target },
    { id: 'integrations', title: 'Integrations', icon: Zap }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Manufacturing', 'Real Estate', 'Consulting', 'Marketing', 'Other'
  ];

  const teamSizes = [
    '1-5 employees', '6-20 employees', '21-50 employees', 
    '51-200 employees', '200+ employees'
  ];

  const goalOptions = [
    'Increase lead generation',
    'Improve lead qualification',
    'Reduce response time',
    'Automate follow-ups',
    'Better lead scoring',
    'Integrate with CRM'
  ];

  const integrationOptions = [
    'Salesforce', 'HubSpot', 'Pipedrive', 'Slack', 
    'Microsoft Teams', 'Google Calendar', 'Zoom', 'Calendly'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  const toggleSelection = (field: 'goals' | 'integrations', value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return data.companyName && data.industry;
      case 1: return data.teamSize;
      case 2: return data.goals.length > 0;
      case 3: return true; // Integrations are optional
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#0A4D68]">
            Welcome to LeadFlow AI
          </CardTitle>
          <CardDescription>
            Let's set up your account to get the most out of our platform
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      index <= currentStep
                        ? 'bg-[#0A4D68] border-[#0A4D68] text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Company Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div>
                <Label>Industry</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {industries.map(industry => (
                    <Button
                      key={industry}
                      variant={data.industry === industry ? "default" : "outline"}
                      className={`justify-start ${
                        data.industry === industry 
                          ? 'bg-[#0A4D68] hover:bg-[#0A4D68]/90' 
                          : ''
                      }`}
                      onClick={() => setData(prev => ({ ...prev, industry }))}
                    >
                      {industry}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Team Size */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label>Team Size</Label>
              <div className="space-y-2">
                {teamSizes.map(size => (
                  <Button
                    key={size}
                    variant={data.teamSize === size ? "default" : "outline"}
                    className={`w-full justify-start ${
                      data.teamSize === size 
                        ? 'bg-[#0A4D68] hover:bg-[#0A4D68]/90' 
                        : ''
                    }`}
                    onClick={() => setData(prev => ({ ...prev, teamSize: size }))}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Label>What are your main goals? (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2">
                {goalOptions.map(goal => (
                  <Button
                    key={goal}
                    variant={data.goals.includes(goal) ? "default" : "outline"}
                    className={`justify-start ${
                      data.goals.includes(goal) 
                        ? 'bg-[#0A4D68] hover:bg-[#0A4D68]/90' 
                        : ''
                    }`}
                    onClick={() => toggleSelection('goals', goal)}
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Integrations */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Label>Which tools do you currently use? (Optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {integrationOptions.map(integration => (
                  <Button
                    key={integration}
                    variant={data.integrations.includes(integration) ? "default" : "outline"}
                    className={`justify-start ${
                      data.integrations.includes(integration) 
                        ? 'bg-[#0A4D68] hover:bg-[#0A4D68]/90' 
                        : ''
                    }`}
                    onClick={() => toggleSelection('integrations', integration)}
                  >
                    {integration}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-[#0A4D68] hover:bg-[#0A4D68]/90"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}