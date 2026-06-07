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

    const { prompt, user_id } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch context data for the summary
    const { data: countries } = await supabase
      .from("countries")
      .select("name, iso, ai_sentiment, gdp_growth, inflation, risk_level, opportunity_score")
      .limit(50);

    const { data: recentNews } = await supabase
      .from("news_articles")
      .select("title, sentiment, category")
      .order("published_at", { ascending: false })
      .limit(10);

    const { data: marketData } = await supabase
      .from("market_snapshots")
      .select("symbol, name, value, change_percent, data_type")
      .eq("data_type", "index")
      .order("fetched_at", { ascending: false })
      .limit(10);

    // Generate intelligent response based on context + prompt
    const response = generateIntelligentResponse(prompt, countries || [], recentNews || [], marketData || []);

    // Save to history if user_id provided
    if (user_id) {
      await supabase.from("ai_insights_history").insert({
        user_id,
        prompt,
        response: response.text,
        response_metadata: response.metadata,
      });
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateIntelligentResponse(
  prompt: string,
  countries: any[],
  news: any[],
  market: any[]
) {
  const lowerPrompt = prompt.toLowerCase();

  const bullishCountries = countries.filter((c) => c.ai_sentiment === "bullish");
  const bearishCountries = countries.filter((c) => c.ai_sentiment === "bearish");
  const topOpportunities = [...countries].sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0)).slice(0, 5);
  const bullishNews = news.filter((n) => n.sentiment === "bullish").length;

  let text = "";
  const metadata: Record<string, any> = { type: "analysis", generated_at: new Date().toISOString() };

  if (lowerPrompt.includes("compare") || lowerPrompt.includes("vs")) {
    text = `**Comparative Market Analysis**\n\nBased on current data across ${countries.length} markets:\n\n`;
    text += `• **Bullish markets:** ${bullishCountries.map((c) => c.name).slice(0, 5).join(", ")}\n`;
    text += `• **Bearish markets:** ${bearishCountries.map((c) => c.name).slice(0, 5).join(", ")}\n\n`;
    text += `**Key differentiators:** GDP growth spread ranges from ${Math.min(...countries.map((c) => c.gdp_growth || 0)).toFixed(1)}% to ${Math.max(...countries.map((c) => c.gdp_growth || 0)).toFixed(1)}%. `;
    text += `Inflation variance remains significant, suggesting divergent monetary policy paths ahead.\n\n`;
    text += `**Recommendation:** Focus on markets with strong GDP growth and moderate inflation for optimal risk-adjusted returns.`;
    metadata.type = "comparison";
  } else if (lowerPrompt.includes("bullish") || lowerPrompt.includes("opportunity")) {
    text = `**Top Market Opportunities**\n\n`;
    topOpportunities.forEach((c, i) => {
      text += `${i + 1}. **${c.name}** (${c.iso}) — Opportunity: ${c.opportunity_score}/100, GDP: ${c.gdp_growth > 0 ? "+" : ""}${c.gdp_growth}%, Risk: ${c.risk_level}\n`;
    });
    text += `\n**Market Sentiment:** ${bullishNews}/${news.length} recent headlines are bullish.\n`;
    text += `\n**AI Recommendation:** The current environment favors selective exposure to high-opportunity emerging markets with manageable risk profiles.`;
    metadata.type = "opportunities";
  } else if (lowerPrompt.includes("risk") || lowerPrompt.includes("bearish")) {
    text = `**Global Risk Assessment**\n\n`;
    text += `• **High-risk markets:** ${countries.filter((c) => c.risk_level === "high" || c.risk_level === "extreme").map((c) => c.name).slice(0, 5).join(", ")}\n`;
    text += `• **Bearish sentiment:** ${bearishCountries.length} markets showing bearish signals\n`;
    text += `• **Average inflation:** ${(countries.reduce((sum, c) => sum + (c.inflation || 0), 0) / countries.length).toFixed(1)}%\n\n`;
    text += `**Risk Mitigation:** Diversify across developed markets with low volatility. Consider defensive sectors and gold allocation.`;
    metadata.type = "risk_analysis";
  } else if (lowerPrompt.includes("forex") || lowerPrompt.includes("currency")) {
    text = `**Forex Market Intelligence**\n\nCurrent market dynamics show:\n\n`;
    text += `• The USD remains strong against most emerging market currencies\n`;
    text += `• EUR/USD consolidating near key support levels\n`;
    text += `• JPY weakness continues amid BOJ policy divergence\n\n`;
    text += `**Key factors:** Interest rate differentials, trade balances, and central bank policy divergence are the primary drivers.\n\n`;
    text += `**Outlook:** Watch for potential USD correction if Fed signals dovish pivot.`;
    metadata.type = "forex";
  } else {
    text = `**Market Intelligence Summary**\n\nAnalyzing ${countries.length} global markets:\n\n`;
    text += `• **Bullish:** ${bullishCountries.length} markets | **Bearish:** ${bearishCountries.length} markets | **Neutral:** ${countries.length - bullishCountries.length - bearishCountries.length} markets\n`;
    text += `• **News sentiment:** ${bullishNews} positive / ${news.length - bullishNews} negative or neutral headlines\n`;
    if (market.length > 0) {
      const avgChange = market.reduce((s, m) => s + (m.change_percent || 0), 0) / market.length;
      text += `• **Index performance:** Average ${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}% across major indices\n`;
    }
    text += `\n**Top opportunities:** ${topOpportunities.slice(0, 3).map((c) => `${c.name} (${c.opportunity_score}/100)`).join(", ")}\n\n`;
    text += `**AI Insight:** ${bullishCountries.length > bearishCountries.length ? "Global sentiment leans bullish — consider increasing equity exposure in high-opportunity markets." : "Cautious positioning recommended — bearish sentiment dominates, favor defensive allocations."}`;
    metadata.type = "summary";
  }

  return { text, metadata };
}
