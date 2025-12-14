import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Zap, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-founder',
    bio: 'Former VP of Sales at TechCorp with 15+ years in B2B sales and AI.',
    image: '/api/placeholder/150/150'
  },
  {
    name: 'Michael Chen',
    role: 'CTO & Co-founder',
    bio: 'AI researcher and former Google engineer specializing in conversational AI.',
    image: '/api/placeholder/150/150'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Product',
    bio: 'Product leader with expertise in SaaS and customer experience design.',
    image: '/api/placeholder/150/150'
  }
];

const values = [
  {
    icon: Target,
    title: 'Customer-First',
    description: 'Every feature we build starts with understanding our customers\' real challenges and needs.'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We leverage cutting-edge AI technology to solve traditional sales and marketing problems.'
  },
  {
    icon: Users,
    title: 'Transparency',
    description: 'We believe in honest communication, clear pricing, and building trust with our users.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from product quality to customer support.'
  }
];

export default function AboutPage() {
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
          <Badge className="mb-4 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90">
            About LeadFlow AI
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A4D68] mb-6">
            Revolutionizing Lead Qualification with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to help businesses qualify leads faster, close more deals, 
            and build stronger customer relationships through intelligent automation.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-[#0A4D68] mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              LeadFlow AI was born from a simple observation: sales teams spend too much time 
              on unqualified leads, while qualified prospects slip through the cracks due to 
              slow response times.
            </p>
            <p className="text-gray-600 mb-4">
              Our founders, having experienced these challenges firsthand in their previous roles, 
              decided to build a solution that combines the power of artificial intelligence 
              with proven sales methodologies.
            </p>
            <p className="text-gray-600">
              Today, we help thousands of businesses worldwide qualify leads in real-time, 
              ensuring no opportunity is missed and every prospect receives the attention they deserve.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-[#0A4D68]">10K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0A4D68]">2M+</div>
                <div className="text-gray-600">Leads Qualified</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0A4D68]">95%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0A4D68]">24/7</div>
                <div className="text-gray-600">AI Availability</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[#0A4D68] mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-[#0A4D68] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0A4D68] mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[#0A4D68] mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0A4D68] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#FF6B6B] font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <Card className="bg-[#0A4D68] text-white mb-20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              To empower businesses of all sizes with AI-powered lead qualification 
              that increases conversion rates, reduces response times, and helps 
              sales teams focus on what they do best: building relationships and closing deals.
            </p>
            <Link href="/register">
              <Button className="bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white">
                Join Our Mission
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0A4D68] mb-6">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions about LeadFlow AI? Want to learn more about our technology? 
            We'd love to hear from you.
          </p>
          <div className="space-x-4">
            <Link href="mailto:hello@leadflow.ai">
              <Button variant="outline">
                Contact Sales
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#0A4D68] hover:bg-[#0A4D68]/90">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}