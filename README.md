# 🌍 Global Alpha AI — AI-Powered Market Intelligence Terminal

> Built by **Dhruv Kapdi**

A professional-grade AI market intelligence platform with real-time signals across global equities, crypto, forex, and commodities — covering 42 countries worldwide.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌍 **Globe Explorer** | Interactive 3D Earth with market sentiment dots for 42 countries. Click to explore, drag to rotate, compare up to 3 countries side-by-side |
| 🤖 **AI Copilot** | Real-time streaming AI chat powered by Claude. Ask anything about stocks, sectors, macro trends, or country markets |
| 📈 **AI Predictions** | Buy/sell signals with confidence scores, bullish/bearish probability, and OHLC candlestick charts for 100+ stocks |
| 📊 **Global Markets** | Live indices, forex pairs, 100+ crypto, commodities with real-time data |
| 📰 **News & Sentiment** | AI-analyzed financial news with bullish/bearish sentiment scoring |
| 👁️ **Watchlist** | Track stocks, crypto, and country markets with real-time price alerts |
| 💼 **Portfolio** | Portfolio tracking with performance charts and AI-powered allocation suggestions |
| 🔁 **Exchange Rates** | Live currency converter and historical forex data |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://anthropic.com) API key (for AI Copilot)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/global-alpha-ai.git
cd global-alpha-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase and API keys (see below)

# 4. Run the dev server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

---

## 🔧 Environment Variables

Create a `.env` file in the root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your `.env` file — it's in `.gitignore`

---

## 🗄️ Supabase Setup

Run the migrations in `/supabase/migrations/` in order to set up the database schema:

```bash
supabase db push
```

Or apply them manually in the Supabase SQL editor.

---

## 🏗️ Tech Stack

- **Frontend** — React 18, TypeScript, Vite
- **Styling** — Tailwind CSS, Framer Motion
- **Database** — Supabase (PostgreSQL)
- **AI** — Anthropic Claude API (streaming)
- **Charts** — Recharts, custom Canvas SVG candlestick chart
- **Globe** — Canvas 2D with NASA earth texture + real market data points
- **Auth** — Supabase Auth

---

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/     # Dashboard widgets (HeroTicker, FearGreedMeter, AISignalCard…)
│   ├── globe/         # Globe Explorer canvas component
│   ├── layout/        # AppLayout, sidebar, mobile nav
│   └── ui/            # Reusable UI components
├── contexts/          # Auth context
├── hooks/             # React Query hooks for market data
├── pages/             # All page components
├── services/          # API services (market data, chat, Supabase)
└── types/             # TypeScript interfaces
```

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to `dist/` — deploy to Vercel, Netlify, or any static host.

---

## 🌐 Globe Explorer Usage

- **Drag** to rotate the globe
- **Click** a country dot to see AI market intelligence
- **Filter** by region, market type, or sentiment
- **Compare** — activate compare mode and select up to 3 countries side-by-side

---

## 🤖 AI Copilot Usage

Ask anything like:
- *"What are the best AI stocks to buy right now?"*
- *"Analyze emerging market opportunities in India and Vietnam"*
- *"What are the biggest macro risks right now?"*
- *"Which sectors will outperform in the next 6 months?"*

---

## 📄 License

MIT © 2026 **Dhruv Kapdi**

---

> ⚠️ **Disclaimer:** AI analysis is for informational purposes only. Not financial advice. Always do your own research before investing.
