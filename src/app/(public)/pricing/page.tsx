import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 100 leads/month',
      'Basic AI chat bot',
      'Email integration',
      'Standard support',
      'Basic analytics'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'Best for growing businesses',
    features: [
      'Up to 1,000 leads/month',
      'Advanced AI qualification',
      'CRM integrations',
      'Priority support',
      'Advanced analytics',
      'Custom workflows',
      'Meeting scheduling'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Unlimited leads',
      'Custom AI training',
      'All integrations',
      'Dedicated support',
      'Custom reporting',
      'White-label options',
      'API access',
      'SSO integration'
    ],
    popular: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo-icon.svg" alt="LeadFlow AI" className="w-14 h-14" />
            <span className="text-3xl font-bold text-[#0A4D68]">LeadFlow AI</span>
          </Link>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#0A4D68] hover:bg-[#0A4D68]/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A4D68] mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include our core AI-powered lead qualification features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.popular 
                  ? 'border-[#FF6B6B] shadow-lg scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-[#0A4D68]">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#0A4D68]">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/register" className="w-full">
                  <Button 
                    className={`w-full ${
                      plan.popular
                        ? 'bg-[#FF6B6B] hover:bg-[#FF6B6B]/90'
                        : 'bg-[#0A4D68] hover:bg-[#0A4D68]/90'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0A4D68] mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#0A4D68] mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#0A4D68] mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day free trial on all plans. No credit card required to get started.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#0A4D68] mb-2">
                What integrations are available?
              </h3>
              <p className="text-gray-600">
                We integrate with popular CRMs like Salesforce, HubSpot, and Pipedrive, plus email and calendar tools.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#0A4D68] mb-2">
                Do you offer custom solutions?
              </h3>
              <p className="text-gray-600">
                Yes, our Enterprise plan includes custom AI training and white-label options for large organizations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-[#0A4D68] text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Transform Your Lead Generation?
              </h3>
              <p className="text-blue-100 mb-6">
                Join thousands of businesses using LeadFlow AI to qualify leads faster and close more deals.
              </p>
              <Link href="/register">
                <Button className="bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white">
                  Start Your Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}