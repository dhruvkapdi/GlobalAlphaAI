const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "100");
    const search = url.searchParams.get("search") || "";

    let apiUrl: string;
    if (search) {
      apiUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(search)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`CoinGecko search failed: ${res.status}`);
      const searchData = await res.json();
      const coins = (searchData.coins || []).slice(0, 20).map((c: any) => ({
        id: c.id,
        symbol: c.symbol?.toUpperCase(),
        name: c.name,
        image: c.large || c.thumb,
        market_cap_rank: c.market_cap_rank,
      }));
      return new Response(JSON.stringify({ coins, source: "search" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`CoinGecko API failed: ${res.status}`);
    const data = await res.json();

    const coins = data.map((c: any) => ({
      id: c.id,
      symbol: c.symbol?.toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      marketCap: c.market_cap,
      volume: c.total_volume,
      rank: c.market_cap_rank,
      high24h: c.high_24h,
      low24h: c.low_24h,
      circulatingSupply: c.circulating_supply,
      ath: c.ath,
      athChangePercent: c.ath_change_percentage,
    }));

    return new Response(JSON.stringify({ coins, page, source: "coingecko" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("fetch-crypto error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
