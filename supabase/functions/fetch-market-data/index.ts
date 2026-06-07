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

    // Check cache freshness (5 min)
    const { data: cached } = await supabase
      .from("market_snapshots")
      .select("*")
      .eq("data_type", "index")
      .gte("fetched_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order("fetched_at", { ascending: false })
      .limit(50);

    if (cached && cached.length > 0) {
      return new Response(JSON.stringify({ data: cached, source: "cache" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Major global indices with realistic base values
    const indices = [
      { symbol: "^GSPC", name: "S&P 500", base: 5450, country: "US" },
      { symbol: "^DJI", name: "Dow Jones", base: 42800, country: "US" },
      { symbol: "^IXIC", name: "NASDAQ", base: 17200, country: "US" },
      { symbol: "^NSEI", name: "NIFTY 50", base: 22500, country: "IN" },
      { symbol: "^BSESN", name: "BSE Sensex", base: 79500, country: "IN" },
      { symbol: "^FTSE", name: "FTSE 100", base: 8350, country: "GB" },
      { symbol: "^N225", name: "Nikkei 225", base: 38900, country: "JP" },
      { symbol: "^GDAXI", name: "DAX", base: 18600, country: "DE" },
      { symbol: "^HSI", name: "Hang Seng", base: 18200, country: "HK" },
      { symbol: "^AXJO", name: "ASX 200", base: 7800, country: "AU" },
      { symbol: "^STOXX50E", name: "Euro Stoxx 50", base: 4950, country: "EU" },
      { symbol: "^KS11", name: "KOSPI", base: 2700, country: "KR" },
      { symbol: "^BVSP", name: "Bovespa", base: 128500, country: "BR" },
      { symbol: "^FCHI", name: "CAC 40", base: 8050, country: "FR" },
    ];

    const snapshots = indices.map((idx) => {
      const changePct = (Math.random() - 0.45) * 3;
      const changeVal = idx.base * (changePct / 100);
      const value = idx.base + changeVal;
      return {
        symbol: idx.symbol,
        name: idx.name,
        value: Math.round(value * 100) / 100,
        change_value: Math.round(changeVal * 100) / 100,
        change_percent: Math.round(changePct * 100) / 100,
        data_type: "index",
        source: "generated",
        metadata: { country: idx.country },
      };
    });

    // Also generate sector performance data
    const sectors = [
      { name: "Technology", base: 2.1 },
      { name: "Healthcare", base: 0.5 },
      { name: "Financials", base: -0.2 },
      { name: "Energy", base: 1.3 },
      { name: "Consumer Discretionary", base: -0.7 },
      { name: "Industrials", base: 0.4 },
      { name: "Materials", base: 0.8 },
      { name: "Real Estate", base: -0.5 },
      { name: "Utilities", base: 0.2 },
      { name: "Communication", base: 1.6 },
    ];

    const sectorSnapshots = sectors.map((s) => {
      const changePct = s.base + (Math.random() - 0.5) * 1.5;
      return {
        symbol: `SECT_${s.name.toUpperCase().replace(/\s+/g, '_')}`,
        name: s.name,
        value: 0,
        change_value: 0,
        change_percent: Math.round(changePct * 100) / 100,
        data_type: "sector",
        source: "generated",
        metadata: {},
      };
    });

    // Upsert all
    const allSnapshots = [...snapshots, ...sectorSnapshots];
    const { error: upsertError } = await supabase
      .from("market_snapshots")
      .upsert(allSnapshots, { onConflict: "symbol" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
    }

    return new Response(
      JSON.stringify({ data: snapshots, sectors: sectorSnapshots, source: "fresh" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
