
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.stocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol text NOT NULL,
  name text NOT NULL,
  country text NOT NULL DEFAULT '',
  exchange text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(symbol, exchange)
);

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stocks are publicly readable"
  ON public.stocks FOR SELECT
  USING (true);

CREATE POLICY "Service can insert stocks"
  ON public.stocks FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service can update stocks"
  ON public.stocks FOR UPDATE TO service_role
  USING (true);

CREATE INDEX idx_stocks_symbol ON public.stocks (symbol);
CREATE INDEX idx_stocks_name_trgm ON public.stocks USING gin (name gin_trgm_ops);
CREATE INDEX idx_stocks_country ON public.stocks (country);
