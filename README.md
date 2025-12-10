# LeadFlow AI

**Transform Your Lead Generation with Intelligent AI Qualification**

LeadFlow AI is a comprehensive, production-ready platform that revolutionizes how businesses qualify and manage leads. Built with cutting-edge AI technology, it automatically engages prospects in natural conversations, scores their potential, and seamlessly schedules meetings with your sales team.

## 🎯 What LeadFlow AI Does

**For Businesses:**
- **Automate Lead Qualification**: AI-powered conversations that feel natural and gather crucial qualifying information
- **Intelligent Lead Scoring**: Advanced algorithms evaluate company fit, budget, timeline, authority, need, and engagement
- **Seamless Meeting Scheduling**: Automatically book meetings with qualified prospects based on real-time availability
- **Comprehensive Analytics**: Track conversion rates, lead quality, team performance, and revenue attribution
- **Multi-Channel Integration**: Works with your existing CRM, email systems, and marketing tools

**For Website Visitors:**
- **Instant Support**: 24/7 AI chat widget that provides immediate assistance
- **Personalized Experience**: Tailored conversations based on company size, industry, and specific needs
- **Effortless Scheduling**: Book meetings directly through the chat interface
- **Valuable Resources**: Get helpful information even if not ready to buy

## 🚀 Key Benefits

- **Increase Conversion Rates**: Qualify leads 10x faster than traditional methods
- **Reduce Response Time**: Instant AI responses ensure no lead goes cold
- **Scale Your Sales Team**: Handle unlimited conversations simultaneously
- **Improve Lead Quality**: Focus sales efforts on pre-qualified, high-intent prospects
- **24/7 Availability**: Never miss a lead, regardless of time zones or business hours

## Features

- 🤖 **AI-Powered Conversations**: Natural lead qualification using Claude AI
- 📊 **Smart Lead Scoring**: Advanced scoring algorithm with multiple criteria
- 📅 **Meeting Scheduling**: Integrated calendar system with availability detection
- 📈 **Analytics Dashboard**: Real-time metrics and performance tracking
- 🔗 **CRM Integration**: Connect with popular CRM platforms
- 💬 **Embeddable Chat Widget**: Add to any website for lead capture
- 🎯 **Onboarding Flow**: Guided setup for new users
- 🔐 **Enterprise Security**: SOC 2 compliant with data encryption

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL
- **AI**: Anthropic Claude via AI SDK
- **Authentication**: Better Auth
- **Runtime**: Bun
- **Styling**: Tailwind CSS with custom design system

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/leadflow_ai"

# Authentication
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# AI Integration (Add at least one - the system will automatically use the first available)
# OpenAI (Recommended - $5 free credits, very reliable)
OPENAI_API_KEY="your-openai-api-key-here"

# Google Gemini (Free tier available)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key-here"

# Anthropic Claude (Paid only)
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# Email (Optional)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
```

### 3. Database Setup

**IMPORTANT: Complete these database steps before running the development server:**

1. **Create PostgreSQL Database**:
   ```bash
   # Using psql
   createdb leadflow_ai
   
   # Or using your preferred PostgreSQL client
   ```

2. **Generate Database Schema**:
   ```bash
   bun run db:generate
   ```

3. **Run Database Migrations**:
   ```bash
   bun run db:migrate
   ```

4. **Verify Database Setup** (Optional):
   ```bash
   bun run db:studio
   ```
   This opens Drizzle Studio at `http://localhost:4983` to view your database.

### 4. Start Development Server

```bash
bun run dev
```

Visit `http://localhost:3000` to see the application.

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

## 👨‍💻 For Developers

### 🍴 Fork & Customize

This is an open-source project that you can fork, customize, and deploy for your own use or clients:

#### **Commercial Use Allowed**
- ✅ Fork and modify for your own business
- ✅ White-label for clients
- ✅ Sell as a service
- ✅ Integrate with your existing products

#### **Getting Started as a Developer**

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/leadflow-ai.git
   cd leadflow-ai
   ```

2. **Customize Branding**
   - Update colors in `tailwind.config.js`
   - Modify company name and branding in components
   - Replace logo and assets in `public/` folder

3. **Configure Your AI Providers**
   - Add your own API keys for OpenAI, Google, or Anthropic
   - Customize AI prompts in `src/lib/ai.ts`
   - Modify lead scoring criteria in `src/services/lead-scoring.ts`

4. **Deploy Anywhere**
   - Vercel (recommended)
   - Netlify
   - AWS
   - Google Cloud
   - Your own servers

#### **Architecture Overview**

```
├── Frontend (Next.js 16 + React)
│   ├── Landing pages & marketing site
│   ├── Dashboard & lead management
│   ├── Real-time chat interface
│   └── Analytics & reporting
│
├── Backend (Next.js API Routes)
│   ├── AI conversation handling
│   ├── Lead scoring & qualification
│   ├── Meeting scheduling
│   └── CRM integrations
│
├── Database (PostgreSQL + Drizzle ORM)
│   ├── Users & workspaces
│   ├── Leads & conversations
│   ├── Meetings & calendar
│   └── Analytics & scoring
│
└── AI Integration (Multi-provider)
    ├── OpenAI GPT-4o-mini
    ├── Google Gemini
    └── Anthropic Claude
```

#### **Built-in React Hooks**

The project includes a comprehensive set of custom React hooks for easy state management:

- **`useLeads`**: Manage lead data, CRUD operations, and real-time updates
- **`useConversations`**: Handle chat conversations and AI message streaming
- **`useAnalytics`**: Fetch and manage dashboard analytics data
- **`useCalendar`**: Meeting scheduling and availability management
- **`useAIProviders`**: Multi-AI provider status and switching
- **`useLocalStorage`**: Persistent local storage with TypeScript support
- **`useDebounce`**: Performance optimization for search and input handling

#### **Customization Ideas**

- **Industry-Specific**: Adapt for real estate, SaaS, e-commerce, etc.
- **Language Support**: Add multi-language AI conversations
- **Custom Integrations**: Connect to industry-specific CRMs
- **Advanced Analytics**: Add custom reporting and dashboards
- **White-Label**: Remove branding and add your own
- **Custom Hooks**: Extend the hook system for your specific needs

#### **Monetization Options**

- **SaaS Platform**: Charge monthly subscriptions
- **Agency Tool**: Sell to marketing agencies
- **Enterprise License**: Custom deployments for large companies
- **API Service**: Offer lead qualification as an API
- **Consulting**: Implementation and customization services

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

- **Documentation**: [docs.leadflow.ai](https://docs.leadflow.ai)
- **Issues**: [GitHub Issues](https://github.com/yourusername/leadflow-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/leadflow-ai/discussions)
- **Email**: hello@leadflow.ai
- **Discord**: [Join our community](https://discord.gg/leadflow-ai)

### 🌟 Show Your Support

If this project helped you, please consider:
- ⭐ Starring the repository
- 🍴 Forking for your own projects
- 📢 Sharing with other developers
- 💝 Contributing back to the community

---

**Built with ❤️ by developers, for developers. Happy coding! 🚀**
