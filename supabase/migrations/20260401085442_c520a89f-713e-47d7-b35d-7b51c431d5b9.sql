
CREATE TABLE public.forex_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL DEFAULT 'USD',
  target_currency text NOT NULL,
  rate double precision NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (base_currency, target_currency)
);

-- Public read access
CREATE POLICY "Forex rates are publicly readable"
  ON public.forex_rates FOR SELECT TO public USING (true);

-- Service role can insert/update
CREATE POLICY "Service can insert forex rates"
  ON public.forex_rates FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service can update forex rates"
  ON public.forex_rates FOR UPDATE TO service_role USING (true);
