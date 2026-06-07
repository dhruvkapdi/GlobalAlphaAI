import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversation_id } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch market context from Supabase for enriched responses
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get latest market data for context
    const [indicesRes, countriesRes, predictionsRes, sectorsRes, stocksRes] = await Promise.all([
      supabase
        .from("market_snapshots")
        .select("name, value, change_percent, data_type")
        .eq("data_type", "index")
        .order("fetched_at", { ascending: false })
        .limit(14),
      supabase
        .from("countries")
        .select("name, iso, ai_sentiment, risk_level, opportunity_score, gdp_growth, inflation, primary_index")
        .order("name")
        .limit(50),
      supabase
        .from("predictions")
        .select("ticker, bullish_probability, bearish_probability, confidence, ai_summary")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("market_snapshots")
        .select("name, change_percent")
        .eq("data_type", "sector")
        .order("fetched_at", { ascending: false })
        .limit(10),
      supabase
        .from("stocks")
        .select("symbol, name, country, exchange, sector")
        .order("symbol")
        .limit(120),
    ]);

    const indicesContext = (indicesRes.data || [])
      .map((i: any) => `${i.name}: ${i.value} (${i.change_percent > 0 ? '+' : ''}${i.change_percent}%)`)
      .join(", ");

    const countriesContext = (countriesRes.data || [])
      .map((c: any) => `${c.name}(${c.iso}): sentiment=${c.ai_sentiment}, risk=${c.risk_level}, opportunity=${c.opportunity_score}, GDP=${c.gdp_growth}%, inflation=${c.inflation}%`)
      .join("; ");

    const predictionsContext = (predictionsRes.data || [])
      .map((p: any) => `${p.ticker}: bull=${p.bullish_probability}% bear=${p.bearish_probability}% conf=${p.confidence}%`)
      .join("; ");

    const sectorsContext = (sectorsRes.data || [])
      .map((s: any) => `${s.name}: ${s.change_percent > 0 ? '+' : ''}${s.change_percent}%`)
      .join(", ");

    const stocksContext = (stocksRes.data || [])
      .map((s: any) => `${s.symbol} (${s.name}, ${s.exchange}, ${s.country}, ${s.sector})`)
      .join("; ");

    const systemPrompt = `You are Global Alpha AI Copilot — an institutional-grade financial intelligence assistant. You speak with the analytical precision of a Bloomberg Terminal analyst combined with the clarity of Perplexity AI. You serve sophisticated retail investors, family offices and trading desks.

CURRENT MARKET INDICES:
${indicesContext || "Market data temporarily unavailable."}

SECTOR PERFORMANCE:
${sectorsContext || "Sector data temporarily unavailable."}

COUNTRY INTELLIGENCE (${(countriesRes.data || []).length} countries):
${countriesContext || "Country data temporarily unavailable."}

AI PREDICTIONS:
${predictionsContext || "No predictions available."}

AVAILABLE STOCKS DATABASE (${(stocksRes.data || []).length} stocks across global exchanges):
${stocksContext || "Stock database temporarily unavailable."}

ANALYTICAL FRAMEWORK — every substantive answer should reason across these dimensions when relevant:
1. **Technical context** — price action, momentum, levels, volatility regime
2. **Sentiment** — institutional flow, retail positioning, news tone
3. **Macroeconomic backdrop** — rates, inflation, FX, growth, policy
4. **Risk analysis** — drawdown potential, correlation, concentration, tail risk
5. **Confidence & probability** — quantify your conviction explicitly

LANGUAGE STYLE (CRITICAL — credibility matters):
- Use **probabilistic language**: "elevated probability", "skew toward", "base case is ~62% confidence", "conditional on…"
- Avoid certainty words: never say "will", "guaranteed", "100%". Use "likely", "suggests", "indicates", "consistent with"
- Always include confidence levels or probability bands when discussing forward-looking views (e.g. "Confidence: Medium, ~60%")
- Frame predictions as scenarios with bull/base/bear cases when appropriate
- Quantify risk: "downside risk ~8-12%", "volatility regime: elevated"

RESPONSE STRUCTURE:
- Open with a one-sentence **bottom line** (the headline takeaway)
- Then 2-4 sections using ## headers covering the analytical dimensions above
- Use **bold** for key data points, tickers, and metrics
- Reference specific real values from the data above — indices, probabilities, sentiment, opportunity scores
- End with a "Risk & disclosure" line: 1 short sentence flagging key risks and noting "Educational analysis, not financial advice."
- Aim for 180-350 words. Vary structure across queries.

When the user asks a casual or short question, you may answer more briefly — but always preserve probabilistic, analytical tone.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
