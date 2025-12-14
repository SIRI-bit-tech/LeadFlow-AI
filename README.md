# LeadFlow AI

**Transform Your Lead Generation with Intelligent AI Qualification**

🚀 **[Live Demo](https://leadflows-ai.vercel.app)** | 📚 **[GitHub Repository](https://github.com/SIRI-bit-tech/LeadFlow-AI)**

LeadFlow AI is a comprehensive, production-ready SaaS platform that revolutionizes how businesses qualify and manage leads. Built with cutting-edge AI technology, it automatically engages prospects in natural conversations, scores their potential, and seamlessly schedules meetings with your sales team.

## 🎯 How LeadFlow AI Works

### For Companies Using LeadFlow AI

**The Complete Lead Journey:**

1. **Widget Integration** 
   - Add a simple script tag to your website
   - Customizable chat widget appears for visitors
   - Works on any website: WordPress, Shopify, custom sites, etc.

2. **AI Conversation Engine**
   - Visitors click the chat widget and start conversations
   - AI automatically qualifies leads through natural dialogue
   - Gathers key information: company size, budget, timeline, decision authority
   - Provides helpful information and builds trust

3. **Intelligent Lead Scoring**
   - Real-time scoring based on 6 criteria (0-100 scale):
     - Company Fit (25% weight)
     - Budget Alignment (20% weight) 
     - Timeline (20% weight)
     - Authority (15% weight)
     - Need (10% weight)
     - Engagement (10% weight)

4. **Automatic Meeting Scheduling**
   - Qualified leads (70+ score) get meeting invitations
   - AI checks your calendar availability
   - Sends calendar invites automatically
   - Integrates with Google Calendar, Outlook, etc.

5. **Dashboard & Analytics**
   - View all leads with conversation history
   - Track conversion rates and lead quality
   - Monitor AI performance and team metrics
   - Export data to your CRM

**Business Value:**
- **10x Faster Qualification**: AI handles initial screening 24/7
- **Higher Conversion Rates**: Focus on pre-qualified prospects only  
- **Reduced Response Time**: Instant engagement prevents lead loss
- **Scalable Growth**: Handle unlimited conversations simultaneously
- **Better Lead Quality**: Advanced scoring identifies best prospects

### For Website Visitors

**Seamless Experience:**
- Click chat widget for instant help
- Natural conversation with AI assistant
- Get answers about products/services immediately
- Book meetings directly through chat
- Receive valuable resources and information
- No forms to fill out - just natural conversation

## 🚀 Key Benefits by User Type

### For Sales Teams
- **Pre-Qualified Leads**: Only talk to prospects ready to buy
- **Rich Context**: Full conversation history before calls
- **Automatic Scheduling**: Meetings booked without back-and-forth
- **Performance Insights**: Track what messaging works best

### For Marketing Teams  
- **24/7 Lead Capture**: Never miss prospects outside business hours
- **Conversion Optimization**: See which pages generate best leads
- **Content Insights**: Understand what information prospects need
- **ROI Tracking**: Measure lead quality and conversion rates

### For Business Owners
- **Revenue Growth**: More qualified leads = more sales
- **Cost Efficiency**: Reduce sales team workload on unqualified prospects  
- **Competitive Advantage**: Instant response while competitors are slow
- **Scalability**: Handle growth without proportional staff increases

## 🎯 Complete Feature Set

### Core AI Features
- 🤖 **Multi-AI Provider System**: OpenAI, Google Gemini, Anthropic Claude with automatic fallback
- � **Nattural Conversations**: Human-like dialogue that builds trust and gathers information
- 🎯 **Smart Lead Scoring**: 6-factor scoring algorithm with weighted criteria
- � **CReal-time Analysis**: Sentiment detection and conversation quality assessment
- � ***Continuous Learning**: AI improves responses based on successful conversions

### Business Management
- 📈 **Analytics Dashboard**: Conversion rates, lead quality, team performance metrics
- 📅 **Meeting Scheduling**: Calendar integration with automatic availability checking
- 👥 **Lead Management**: Full CRM with conversation history and scoring details
- 📧 **Email Integration**: Automated follow-ups and meeting confirmations
- 🔗 **CRM Sync**: Export to Salesforce, HubSpot, Pipedrive, and more

### Technical Features
- 💻 **Universal Widget**: Works on any website (HTML, React, Vue, Angular, etc.)
- 📱 **Mobile Responsive**: Optimized for all devices and screen sizes
- 🔐 **Enterprise Security**: JWT authentication, bcrypt hashing, rate limiting
- ⚡ **High Performance**: Built on Next.js 16 with optimized database queries
- 🌐 **Multi-Framework Support**: Easy integration regardless of your tech stack

### Developer Experience
- 🛠️ **Open Source**: MIT license - fork, customize, and deploy freely
- 📚 **Comprehensive API**: RESTful endpoints for all functionality
- 🎨 **Customizable UI**: Tailwind CSS with easy theming and branding
- 🔧 **Built-in Hooks**: React hooks for state management and data fetching
- 📖 **Full Documentation**: Complete setup and customization guides

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL
- **AI**: Anthropic Claude via AI SDK
- **Authentication**: Better Auth
- **Runtime**: Bun
- **Styling**: Tailwind CSS with custom design system

## 🚀 Quick Start Guide

### For Companies: Get Started in 5 Minutes

1. **Sign Up**: Visit [https://leadflows-ai.vercel.app](https://leadflows-ai.vercel.app) and create your account
2. **Complete Onboarding**: Set up your company profile and preferences  
3. **Get Widget Code**: Copy the simple script tag from your dashboard
4. **Add to Website**: Paste the code before `</body>` tag on your site
5. **Start Converting**: AI begins qualifying leads immediately!

**Widget Integration Example:**
```html
<!-- Add this to your website -->
<script src="https://leadflows-ai.vercel.app/widget.js" 
  data-workspace-id="your-workspace-id"
  data-title="Chat with Acme Corp"
  data-primary-color="#0A4D68"></script>
```

**Supported Platforms:**
- ✅ WordPress (any theme)
- ✅ Shopify stores  
- ✅ Squarespace sites
- ✅ Wix websites
- ✅ Custom HTML/CSS sites
- ✅ React/Next.js apps
- ✅ Vue.js applications
- ✅ Angular projects
- ✅ Any website with HTML access

### For Developers: Local Development Setup

#### Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL database
- AI API key (OpenAI recommended - $5 free credits)

#### 1. Clone & Install
```bash
git clone https://github.com/SIRI-bit-tech/LeadFlow-AI.git
cd leadflow-ai
bun install
```

#### 2. Environment Configuration
```bash
cp .env.local.example .env.local
```

**Required Environment Variables:**
```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/leadflow_ai"

# Authentication (Required)
BETTER_AUTH_SECRET="your-secure-random-string"
BETTER_AUTH_URL="http://localhost:3000"

# AI Provider (At least one required)
OPENAI_API_KEY="sk-..." # Recommended: $5 free credits
GOOGLE_GENERATIVE_AI_API_KEY="..." # Alternative: Free tier available
ANTHROPIC_API_KEY="..." # Alternative: Paid only

# Optional Features
SENDGRID_API_KEY="..." # Email notifications
GOOGLE_CLIENT_ID="..." # OAuth login
```

#### 3. Database Setup
```bash
# Create database
createdb leadflow_ai

# Generate schema
bun run db:generate

# Run migrations  
bun run db:migrate

# Verify setup (optional)
bun run db:studio
```

#### 4. Development Server
```bash
bun run dev
```
Visit `http://localhost:3000` - you're ready to develop!

#### 5. Test the Widget
Visit `http://localhost:3000/test-widget` to see the AI chat in action.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run type-check` - Run TypeScript type checking
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected app pages
│   ├── (auth)/            # Authentication pages
│   ├── (onboarding)/      # User onboarding flow
│   ├── (public)/          # Public marketing pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── chat/             # Chat interface components
│   ├── dashboard/        # Dashboard components
│   ├── leads/            # Lead management components
│   └── layout/           # Layout components
├── hooks/                 # Custom React hooks
│   ├── use-leads.ts      # Lead management hooks
│   ├── use-conversations.ts # Chat & conversation hooks
│   ├── use-analytics.ts  # Analytics data hooks
│   ├── use-calendar.ts   # Meeting scheduling hooks
│   ├── use-ai-providers.ts # AI provider management
│   ├── use-local-storage.ts # Local storage utilities
│   └── use-debounce.ts   # Performance optimization hooks
├── db/                   # Database schema & migrations
├── lib/                  # Utility functions
│   ├── ai.ts            # Multi-AI provider integration
│   ├── auth.ts          # Authentication config
│   ├── calendar.ts      # Calendar service
│   ├── db.ts            # Database connection
│   └── utils.ts         # General utilities
├── services/            # Business logic
│   ├── lead-scoring.ts  # Lead qualification algorithms
│   └── conversation.ts  # Chat management
└── types/              # TypeScript type definitions
```

## Key Features Explained

### AI-Powered Lead Qualification
- Uses Claude AI for natural conversations
- Automatic lead scoring based on multiple criteria
- Real-time conversation analysis and sentiment detection

### Calendar Integration
- Smart availability detection
- Automatic meeting scheduling
- Calendar invite generation
- Business hours validation

### Embeddable Chat Widget
- Add to any website with simple script tag
- Customizable styling and positioning
- Real-time AI conversations
- Mobile-responsive design

### Analytics Dashboard
- Lead conversion metrics
- AI conversation performance
- Team productivity tracking
- Revenue attribution

### Multi-AI Provider System
- **Automatic Fallback**: If one AI provider fails or hits rate limits, automatically switches to the next available provider
- **Cost Optimization**: Start with free tiers (OpenAI $5 credits, Google Gemini free) and add paid providers as needed
- **Provider Options**:
  - **OpenAI GPT-4o-mini**: $5 free credits, very reliable, recommended for most users
  - **Google Gemini Flash**: Free tier available, good performance
  - **Anthropic Claude**: Paid only, highest quality responses
- **Smart Switching**: Automatically detects rate limits, quota exceeded, and billing issues
- **Provider Status**: Check which providers are active via `/api/ai/providers`

## Deployment

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secure random string for auth
- `BETTER_AUTH_URL` - Your production domain
- `ANTHROPIC_API_KEY` - Claude AI API key

### Database Migration

Run migrations in production:

```bash
bun run db:migrate
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Lead Management
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/[id]` - Get lead details
- `PATCH /api/leads/[id]` - Update lead

### AI Chat
- `POST /api/ai/chat` - Send message to AI
- `GET /api/conversations` - List conversations
- `GET /api/conversations/[id]` - Get conversation details

### Calendar
- `GET /api/calendar/slots` - Get available time slots
- `POST /api/calendar/schedule` - Schedule meeting
- `GET /api/calendar/meetings` - List meetings

## 👨‍💻 For Developers & Agencies

### 🍴 Fork, Customize & Monetize

LeadFlow AI is **100% open source** with MIT license - fork it, customize it, and build your business around it!

#### **💰 Business Models You Can Build**

1. **SaaS Platform** 
   - Host LeadFlow AI and charge monthly subscriptions
   - Target: Small to medium businesses
   - Revenue: $29-299/month per customer
   - **Note**: Subscription billing system is TODO - you'll need to add Stripe/payment integration

2. **Agency Tool**
   - White-label for marketing agencies
   - Target: Digital marketing agencies  
   - Revenue: $500-5000/month per agency

3. **Enterprise Deployments**
   - Custom installations for large companies
   - Target: Fortune 500, enterprise clients
   - Revenue: $10k-100k+ per deployment

4. **Industry-Specific Versions**
   - Customize for real estate, healthcare, finance, etc.
   - Target: Niche industries with specific needs
   - Revenue: Premium pricing for specialized features

#### **🛠️ Built-in Developer Tools (Already Included)**

**Custom React Hooks:**
- `useLeads` - Complete lead management with CRUD operations
- `useConversations` - Real-time chat with AI streaming
- `useAnalytics` - Dashboard metrics and reporting
- `useCalendar` - Meeting scheduling with availability
- `useAIProviders` - Multi-provider AI management
- `useLocalStorage` - Persistent storage with TypeScript
- `useDebounce` - Performance optimization utilities

**Production-Ready API Endpoints:**
```
Authentication:
POST /api/auth/register    # User registration
POST /api/auth/login       # User login  
POST /api/auth/logout      # User logout

Lead Management:
GET    /api/leads          # List all leads
POST   /api/leads          # Create new lead
GET    /api/leads/[id]     # Get lead details
PATCH  /api/leads/[id]     # Update lead

AI & Conversations:
POST /api/ai/chat          # Send message to AI
GET  /api/conversations    # List conversations
GET  /api/conversations/[id] # Get conversation details

Calendar & Meetings:
GET  /api/calendar/slots   # Available time slots
POST /api/calendar/schedule # Schedule meeting
GET  /api/meetings         # List meetings
```

#### **🎨 Easy Customization**

**Branding & Styling:**
- `tailwind.config.js` - Colors, fonts, themes
- `src/app/globals.css` - Global styles
- `public/` - Logo, favicon, assets

**AI Behavior:**
- `src/lib/ai.ts` - AI prompts and responses
- `src/services/lead-service.ts` - Lead scoring logic
- Multi-AI provider system with automatic fallback

**Business Logic:**
- `src/lib/utils.ts` - Lead qualification rules
- `src/hooks/` - Custom React hooks for data management
- `src/components/` - UI components and layouts
│         PostgreSQL + Drizzle ORM + Migrations          │
│  • Users, workspaces, authentication                   │
│  • Leads, conversations, messages                       │
│  • Meetings, calendar, availability                     │
│  • Analytics, scoring, performance data                 │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                AI Integration Layer                      │
│        Multi-Provider with Automatic Fallback          │
│  • OpenAI GPT-4o-mini (recommended)                    │
│  • Google Gemini Flash (free tier)                     │
│  • Anthropic Claude (premium quality)                  │
└─────────────────────────────────────────────────────────┘
```

#### **Built-in Developer Tools**

**Custom React Hooks for Rapid Development:**
- **`useLeads`**: Complete lead management with CRUD operations
- **`useConversations`**: Real-time chat and AI message streaming  
- **`useAnalytics`**: Dashboard metrics and performance data
- **`useCalendar`**: Meeting scheduling and availability checking
- **`useAIProviders`**: Multi-AI provider management and fallback
- **`useLocalStorage`**: Type-safe persistent storage utilities
- **`useDebounce`**: Performance optimization for search/input

**Production-Ready Features:**
- **Authentication**: JWT tokens, bcrypt hashing, session management
- **Security**: Rate limiting, input validation, XSS protection
- **Performance**: Optimized queries, caching, lazy loading
- **Monitoring**: Error tracking, analytics, performance metrics
- **Scalability**: Serverless-compatible, horizontal scaling ready

#### **Customization Guide**

**1. Branding & UI**
```bash
# Update colors and styling
src/app/globals.css          # Global styles
tailwind.config.js           # Color scheme
public/                      # Logo and assets
```

**2. AI Behavior**  
```bash
# Customize AI responses and scoring
src/lib/ai.ts               # AI prompts and providers
src/services/lead-service.ts # Lead scoring logic
```

**3. Business Logic**
```bash
# Modify core functionality  
src/app/api/                # API endpoints
src/services/               # Business logic
src/hooks/                  # State management
```

**4. Database Schema**
```bash
# Add custom fields and tables
src/db/schema.ts            # Database schema
src/db/migrations/          # Migration files
```

#### **Deployment Options**

**Recommended Platforms:**
- **Vercel**: Zero-config deployment, perfect for Next.js
- **Railway**: Simple PostgreSQL + app hosting
- **Supabase**: Managed PostgreSQL with built-in auth
- **AWS/GCP**: Enterprise-grade with full control

**One-Click Deploy:**
```bash
# Vercel (recommended)
npx create-next-app@latest my-leadflow --example https://github.com/yourusername/leadflow-ai

# Or clone and deploy
git clone https://github.com/yourusername/leadflow-ai.git
cd leadflow-ai
vercel --prod
```

#### **Monetization Strategies**

**Pricing Tiers You Can Offer:**
- **Starter**: $29/month - 1,000 conversations
- **Professional**: $99/month - 10,000 conversations  
- **Enterprise**: $299/month - Unlimited + white-label
- **Custom**: $1000+/month - Custom features + support

**Revenue Streams:**
- Monthly/annual subscriptions
- Setup and implementation fees
- Custom development services
- Training and consulting
- White-label licensing
- API usage fees

### 🤝 Contributing

We welcome contributions from the community!

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run quality checks**:
   ```bash
   bun run lint
   bun run type-check
   bun test
   ```
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

#### **Contribution Guidelines**

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting
- Be respectful and constructive in discussions

### 📄 License

**MIT License** - Feel free to use, modify, and distribute this project for any purpose, including commercial use.

### 🆘 Support & Community

- **Live Demo**: [https://leadflows-ai.vercel.app](https://leadflows-ai.vercel.app)
- **Issues**: [GitHub Issues](https://github.com/SIRI-bit-tech/LeadFlow-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SIRI-bit-tech/LeadFlow-AI/discussions)
- **Repository**: [https://github.com/SIRI-bit-tech/LeadFlow-AI](https://github.com/SIRI-bit-tech/LeadFlow-AI)

### 🌟 Show Your Support

If this project helped you, please consider:
- ⭐ Starring the repository
- 🍴 Forking for your own projects
- 📢 Sharing with other developers
- 💝 Contributing back to the community

---

**Built with ❤️ by developers, for developers. Happy coding! 🚀**

## 🚀 Deployment Guide

### **Production Deployment**

**Recommended: Vercel (One-Click Deploy)**
1. Fork this repository
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

**Alternative Platforms:**
- **Netlify**: JAMstack optimization
- **Railway**: Simple PostgreSQL hosting
- **DigitalOcean**: Cost-effective VPS
- **AWS/Google Cloud**: Enterprise scale

### **Environment Variables for Production**
```env
# Required
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="secure-random-string"
BETTER_AUTH_URL="https://yourdomain.com"
OPENAI_API_KEY="sk-..."

# Optional
SENDGRID_API_KEY="..."
GOOGLE_CLIENT_ID="..."
```

## 📋 Current Status & Roadmap

### ✅ **Completed Features**
- AI-powered lead qualification
- Multi-provider AI system (OpenAI, Google, Anthropic)
- Real-time chat widget
- Lead scoring and analytics
- Meeting scheduling
- Dashboard and reporting
- Authentication and security
- Database optimization
- Mobile-responsive design

### 🚧 **TODO / Coming Soon**
- **Subscription billing system** (Stripe integration needed)
- CRM integrations (Salesforce, HubSpot)
- Email marketing automation
- Advanced analytics and reporting
- Multi-language support
- Team collaboration features
- API rate limiting and quotas
- Advanced security features

## 🤝 Contributing

**We welcome contributions!**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test
4. Submit pull request

**Areas needing help:**
- Subscription billing implementation
- CRM integrations
- Additional AI providers
- UI/UX improvements
- Documentation

## 📄 License & Support

**MIT License** - Use freely for any purpose, including commercial.

**Support:**
- **Live Demo**: [https://leadflows-ai.vercel.app](https://leadflows-ai.vercel.app)
- **GitHub Repository**: [https://github.com/SIRI-bit-tech/LeadFlow-AI](https://github.com/SIRI-bit-tech/LeadFlow-AI)
- GitHub Issues for bugs
- GitHub Discussions for questions

---

**🚀 Ready to transform your lead generation? Fork, customize, and deploy today!**