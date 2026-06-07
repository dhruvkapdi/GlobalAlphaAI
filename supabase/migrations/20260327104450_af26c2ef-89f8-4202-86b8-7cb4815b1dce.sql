-- Add unique constraint on market_snapshots.symbol for upsert support
ALTER TABLE public.market_snapshots ADD CONSTRAINT market_snapshots_symbol_key UNIQUE (symbol);

-- Allow service role to insert/update market_snapshots (edge functions use service role)
-- The service role bypasses RLS, so no additional INSERT policy needed for edge functions.
-- But let's add INSERT policy for news_articles for completeness
CREATE POLICY "Service can insert news articles"
ON public.news_articles
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service can insert market snapshots"
ON public.market_snapshots
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service can update market snapshots"
ON public.market_snapshots
FOR UPDATE
TO service_role
USING (true);

-- Allow authenticated users to insert predictions (via edge function proxy)
CREATE POLICY "Service can insert predictions"
ON public.predictions
FOR INSERT
TO service_role
WITH CHECK (true);