# AI Finance Analyst

A personal AI-powered finance analyst that helps you find savings opportunities by analyzing your bank transactions.

<div align="center">
  <img src="./docs/dashboard.png" alt="Finance AI Dashboard" width="800"/>
  <p><em>Real-time dashboard with spending analysis</em></p>
</div>

## Screenshots

<div align="center">
  <img src="./docs/chat.png" alt="AI Chat Interface" width="400"/>
  <img src="./docs/alerts.png" alt="Smart Alerts" width="400"/>
</div>

<br/>

## Features

- 🏦 **Bank Connection** - Securely connect bank accounts via Plaid
- 📊 **Spending Analysis** - Visual breakdown of spending by category
- 🤖 **AI Insights** - Claude-powered detection of:
  - Unused subscriptions
  - Wasteful spending patterns
  - Bill negotiation opportunities
- 💬 **AI Chat** - Ask natural language questions about your finances
- 🔔 **Smart Alerts** - Proactive notifications for unusual activity
- 💰 **Savings Dashboard** - Track potential monthly savings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials)
- **Bank Integration**: Plaid API (Sandbox)
- **AI**: Anthropic Claude (Sonnet 4)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- Plaid account (free sandbox)
- Anthropic API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd finance-analyst
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finance_analyst"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Plaid (get from https://dashboard.plaid.com/signup)
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-sandbox-secret"
PLAID_ENV="sandbox"

# Anthropic (get from https://console.anthropic.com/)
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Demo Mode (optional - uses mock data)
DEMO_MODE="false"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Mode

For presentations without real API credentials, enable demo mode:

```env
DEMO_MODE="true"
```

Then seed the database with demo data:

```bash
npm run db:seed
```

**Demo login credentials:**
- Email: `demo@financeai.com`
- Password: `demo123456`

## Plaid Sandbox Testing

When using Plaid in sandbox mode, use these test credentials in the Plaid Link flow:

- **Username**: `user_good`
- **Password**: `pass_good`
- Select any institution

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/Register pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── dashboard/    # Main overview
│   │   ├── chat/         # AI chat interface
│   │   ├── savings/      # Savings opportunities
│   │   └── alerts/       # Financial alerts
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── plaid/        # Plaid integration
│   │   ├── ai/           # Claude AI endpoints
│   │   └── dashboard/    # Dashboard data
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── charts/           # Data visualizations
│   └── plaid/            # Plaid Link integration
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   ├── plaid.ts          # Plaid API client
│   ├── claude.ts         # Claude AI integration
│   └── utils.ts          # Helper functions
└── types/
    └── next-auth.d.ts    # Type declarations
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/plaid/create-link-token` | POST | Initialize Plaid Link |
| `/api/plaid/exchange-token` | POST | Exchange Plaid public token |
| `/api/plaid/transactions` | GET/POST | Fetch/sync transactions |
| `/api/ai/analyze` | GET/POST | Get/generate AI insights |
| `/api/ai/chat` | POST | Send message to AI assistant |
| `/api/dashboard` | GET | Get dashboard overview data |
| `/api/alerts` | GET/PATCH | Manage alerts |

## Demo Flow for Presentations

1. **Landing Page** - Show value proposition
2. **Sign Up** - Quick registration
3. **Connect Bank** - Plaid sandbox flow
4. **Dashboard** - Highlight balance, spending chart, AI insights card
5. **AI Insights** - "Found 3 unused subscriptions - save $55/month!"
6. **AI Chat** - Ask "Why did I spend so much last month?"
7. **Savings Page** - Show all opportunities (~$200+/month total)

## Security Notes

- Access tokens are stored encrypted in production
- Read-only bank access via Plaid
- No storage of banking credentials
- Session-based authentication with JWT
- CSRF protection on all API routes

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Future Implementation

Here is the roadmap for upcoming features:

### 📱 Mobile Application
- **React Native / Flutter App**: Native mobile experience for iOS and Android.
- **Biometric Login**: FaceID/TouchID integration for faster access.
- **Push Notifications**: Real-time alerts for large transactions.

### 📈 Investment & Wealth Tracking
- **Investment Portfolio**: Connect brokerage accounts (Robinhood, E*TRADE).
- **Crypto Integration**: Track Bitcoin/Ethereum holdings alongside fiat currency.
- **Net Worth Calculator**: Unified view of assets vs. liabilities.

### 🤖 Advanced AI Features
- **Bill Negotiation**: AI agent that automatically negotiates lower rates for internet/cable bills.
- **Subscription Cancellation**: One-click cancellation for unwanted services.
- **Tax Preparation**: Tag tax-deductible expenses throughout the year.

### 🌍 Global Support
- **Multi-currency**: Support for EUR, GBP, CAD, and more.
- **Localization**: UI translations for major languages.

### 📊 Data Export
- **CSV/PDF Reports**: Download monthly financial statements for manual analysis or accountants.
- **Budget Goals**: Set custom spending limits per category.

## License

MIT
