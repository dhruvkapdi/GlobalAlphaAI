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

    // Check cache (15 min)
    const { data: cached } = await supabase
      .from("news_articles")
      .select("*")
      .gte("fetched_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .order("published_at", { ascending: false })
      .limit(50);

    if (cached && cached.length > 0) {
      return new Response(JSON.stringify({ data: cached, source: "cache" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate realistic financial news (replace with real news API)
    const headlines = [
      { title: "Fed signals potential rate cut in September amid cooling inflation", category: "Macro", sentiment: "bullish", score: 0.7, source: "Reuters" },
      { title: "Tech stocks rally as AI chip demand surges globally", category: "Technology", sentiment: "bullish", score: 0.85, source: "Bloomberg" },
      { title: "European markets slip on weak manufacturing data", category: "Markets", sentiment: "bearish", score: -0.4, source: "Financial Times" },
      { title: "Oil prices steady as OPEC+ production cuts hold", category: "Commodities", sentiment: "neutral", score: 0.1, source: "CNBC" },
      { title: "China's economic recovery shows mixed signals in latest PMI", category: "Macro", sentiment: "neutral", score: -0.1, source: "WSJ" },
      { title: "India's Sensex hits record high on strong GDP growth forecast", category: "Markets", sentiment: "bullish", score: 0.9, source: "Economic Times" },
      { title: "Cryptocurrency markets stabilize after regulatory clarity", category: "Crypto", sentiment: "neutral", score: 0.2, source: "CoinDesk" },
      { title: "Japanese yen weakens further against dollar, BOJ under pressure", category: "Forex", sentiment: "bearish", score: -0.5, source: "Nikkei" },
      { title: "Global semiconductor shortage expected to ease by Q3", category: "Technology", sentiment: "bullish", score: 0.6, source: "TechCrunch" },
      { title: "Emerging markets see capital outflows amid strong dollar", category: "Markets", sentiment: "bearish", score: -0.6, source: "Reuters" },
      { title: "Gold prices surge to new highs as geopolitical tensions rise", category: "Commodities", sentiment: "bullish", score: 0.55, source: "Bloomberg" },
      { title: "US jobs report beats expectations, unemployment at 3.7%", category: "Macro", sentiment: "bullish", score: 0.75, source: "CNBC" },
    ];

    const articles = headlines.map((h, i) => {
      const publishedAt = new Date(Date.now() - i * 45 * 60 * 1000).toISOString();
      return {
        title: h.title,
        source: h.source,
        category: h.category,
        sentiment: h.sentiment,
        sentiment_score: h.score,
        summary: `Analysis: ${h.title}. Market watchers note significant implications for global portfolio positioning.`,
        published_at: publishedAt,
        url: null,
      };
    });

    const { error } = await supabase.from("news_articles").insert(articles);
    if (error) console.error("Insert error:", error);

    return new Response(
      JSON.stringify({ data: articles, source: "fresh" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
