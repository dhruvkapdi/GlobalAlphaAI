import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache (30 min freshness)
    const { data: cached } = await supabase
      .from("forex_rates")
      .select("*")
      .eq("base_currency", "USD")
      .gte("last_updated", new Date(Date.now() - 30 * 60 * 1000).toISOString());

    if (cached && cached.length > 0) {
      return new Response(JSON.stringify({ data: cached, source: "cache" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch real rates from open.er-api.com (free, no key required)
    const apiRes = await fetch("https://open.er-api.com/v6/latest/USD");

    if (!apiRes.ok) {
      throw new Error(`API returned ${apiRes.status}`);
    }

    const apiData = await apiRes.json();

    if (apiData.result !== "success" || !apiData.rates) {
      throw new Error("Invalid API response");
    }

    const rates = apiData.rates as Record<string, number>;
    const now = new Date().toISOString();

    // Build rows for all currencies
    const rows = Object.entries(rates).map(([currency, rate]) => ({
      base_currency: "USD",
      target_currency: currency,
      rate: rate as number,
      last_updated: now,
    }));

    // Upsert into forex_rates
    const { error: upsertError } = await supabase
      .from("forex_rates")
      .upsert(rows, { onConflict: "base_currency,target_currency" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
    }

    return new Response(
      JSON.stringify({ data: rows, source: "fresh", count: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fetch-forex-rates error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
