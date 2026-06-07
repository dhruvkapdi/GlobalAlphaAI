
-- Countries master table
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  iso TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  flag TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng DOUBLE PRECISION NOT NULL DEFAULT 0,
  region TEXT NOT NULL DEFAULT '',
  continent TEXT NOT NULL DEFAULT '',
  capital TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT '',
  currency_symbol TEXT NOT NULL DEFAULT '',
  classification TEXT NOT NULL DEFAULT 'limited' CHECK (classification IN ('developed', 'emerging', 'frontier', 'limited')),
  primary_exchange TEXT NOT NULL DEFAULT '',
  primary_index TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  exchange_rate_usd DOUBLE PRECISION NOT NULL DEFAULT 1,
  gdp_growth DOUBLE PRECISION NOT NULL DEFAULT 0,
  inflation DOUBLE PRECISION NOT NULL DEFAULT 0,
  interest_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  top_sectors TEXT[] NOT NULL DEFAULT '{}',
  top_companies JSONB NOT NULL DEFAULT '[]',
  ai_sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (ai_sentiment IN ('bullish', 'bearish', 'neutral')),
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'extreme')),
  volatility_level INTEGER NOT NULL DEFAULT 50,
  opportunity_score INTEGER NOT NULL DEFAULT 50,
  economic_indicators JSONB NOT NULL DEFAULT '[]',
  ai_summary TEXT NOT NULL DEFAULT '',
  market_status TEXT NOT NULL DEFAULT 'closed' CHECK (market_status IN ('open', 'closed', 'pre-market', 'after-hours')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  default_region TEXT NOT NULL DEFAULT 'Global',
  display_currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Watchlists
CREATE TABLE public.watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  country_iso TEXT,
  alert_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market snapshots (cached market data)
CREATE TABLE public.market_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT '',
  data_type TEXT NOT NULL DEFAULT '' CHECK (data_type IN ('index', 'forex', 'crypto', 'commodity', 'stock')),
  symbol TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  value DOUBLE PRECISION NOT NULL DEFAULT 0,
  change_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  change_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI insights history
CREATE TABLE public.ai_insights_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL DEFAULT '',
  response_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Predictions
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT NOT NULL,
  country_iso TEXT,
  timeframe TEXT NOT NULL DEFAULT '3 months',
  bullish_probability DOUBLE PRECISION NOT NULL DEFAULT 50,
  bearish_probability DOUBLE PRECISION NOT NULL DEFAULT 50,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 50,
  target_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  current_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  ai_summary TEXT NOT NULL DEFAULT '',
  model_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- News articles
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  url TEXT,
  summary TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Markets',
  sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  sentiment_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  price_alerts BOOLEAN NOT NULL DEFAULT true,
  ai_predictions_alerts BOOLEAN NOT NULL DEFAULT true,
  market_news_alerts BOOLEAN NOT NULL DEFAULT true,
  portfolio_update_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Countries: readable by everyone
CREATE POLICY "Countries are publicly readable" ON public.countries FOR SELECT USING (true);

-- Profiles: users can read/update their own
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Watchlists: users manage their own
CREATE POLICY "Users can manage own watchlists" ON public.watchlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Market snapshots: publicly readable
CREATE POLICY "Market snapshots are publicly readable" ON public.market_snapshots FOR SELECT USING (true);

-- AI insights: users manage their own
CREATE POLICY "Users can manage own ai insights" ON public.ai_insights_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Predictions: publicly readable
CREATE POLICY "Predictions are publicly readable" ON public.predictions FOR SELECT USING (true);

-- News: publicly readable
CREATE POLICY "News articles are publicly readable" ON public.news_articles FOR SELECT USING (true);

-- User settings: users manage their own
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
