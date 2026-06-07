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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const country = url.searchParams.get("country") || "";
    const exchange = url.searchParams.get("exchange") || "";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    if (!query && !country && !exchange) {
      // Return trending/popular stocks
      const { data } = await supabase
        .from("stocks")
        .select("*")
        .order("symbol")
        .limit(limit);

      return new Response(JSON.stringify({ stocks: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let dbQuery = supabase.from("stocks").select("*");

    if (query) {
      // Use trigram similarity search
      dbQuery = dbQuery.or(
        `symbol.ilike.%${query}%,name.ilike.%${query}%`
      );
    }

    if (country) {
      dbQuery = dbQuery.eq("country", country);
    }

    if (exchange) {
      dbQuery = dbQuery.eq("exchange", exchange);
    }

    const { data, error } = await dbQuery.order("symbol").limit(limit);

    if (error) {
      console.error("Search error:", error);
      return new Response(JSON.stringify({ stocks: [], error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ stocks: data || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stock search error:", error);
    return new Response(
      JSON.stringify({ stocks: [], error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
