import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STOCKS = [
  // ═══ US - NASDAQ / NYSE ═══
  { symbol: "AAPL", name: "Apple Inc.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "MSFT", name: "Microsoft Corp.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "GOOGL", name: "Alphabet Inc.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "AMZN", name: "Amazon.com Inc.", country: "US", exchange: "NASDAQ", sector: "Consumer Cyclical", currency: "USD" },
  { symbol: "NVDA", name: "NVIDIA Corp.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "META", name: "Meta Platforms Inc.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "TSLA", name: "Tesla Inc.", country: "US", exchange: "NASDAQ", sector: "Consumer Cyclical", currency: "USD" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", country: "US", exchange: "NYSE", sector: "Financials", currency: "USD" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", country: "US", exchange: "NYSE", sector: "Financials", currency: "USD" },
  { symbol: "V", name: "Visa Inc.", country: "US", exchange: "NYSE", sector: "Financials", currency: "USD" },
  { symbol: "JNJ", name: "Johnson & Johnson", country: "US", exchange: "NYSE", sector: "Healthcare", currency: "USD" },
  { symbol: "WMT", name: "Walmart Inc.", country: "US", exchange: "NYSE", sector: "Consumer Defensive", currency: "USD" },
  { symbol: "PG", name: "Procter & Gamble", country: "US", exchange: "NYSE", sector: "Consumer Defensive", currency: "USD" },
  { symbol: "MA", name: "Mastercard Inc.", country: "US", exchange: "NYSE", sector: "Financials", currency: "USD" },
  { symbol: "HD", name: "Home Depot Inc.", country: "US", exchange: "NYSE", sector: "Consumer Cyclical", currency: "USD" },
  { symbol: "DIS", name: "Walt Disney Co.", country: "US", exchange: "NYSE", sector: "Communication", currency: "USD" },
  { symbol: "NFLX", name: "Netflix Inc.", country: "US", exchange: "NASDAQ", sector: "Communication", currency: "USD" },
  { symbol: "AMD", name: "Advanced Micro Devices", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "CRM", name: "Salesforce Inc.", country: "US", exchange: "NYSE", sector: "Technology", currency: "USD" },
  { symbol: "INTC", name: "Intel Corp.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "CSCO", name: "Cisco Systems", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "ADBE", name: "Adobe Inc.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "PEP", name: "PepsiCo Inc.", country: "US", exchange: "NASDAQ", sector: "Consumer Defensive", currency: "USD" },
  { symbol: "KO", name: "Coca-Cola Co.", country: "US", exchange: "NYSE", sector: "Consumer Defensive", currency: "USD" },
  { symbol: "COST", name: "Costco Wholesale", country: "US", exchange: "NASDAQ", sector: "Consumer Defensive", currency: "USD" },
  { symbol: "AVGO", name: "Broadcom Inc.", country: "US", exchange: "NASDAQ", sector: "Technology", currency: "USD" },
  { symbol: "BA", name: "Boeing Co.", country: "US", exchange: "NYSE", sector: "Industrials", currency: "USD" },
  { symbol: "GS", name: "Goldman Sachs", country: "US", exchange: "NYSE", sector: "Financials", currency: "USD" },
  { symbol: "XOM", name: "Exxon Mobil Corp.", country: "US", exchange: "NYSE", sector: "Energy", currency: "USD" },
  { symbol: "CVX", name: "Chevron Corp.", country: "US", exchange: "NYSE", sector: "Energy", currency: "USD" },
  { symbol: "UNH", name: "UnitedHealth Group", country: "US", exchange: "NYSE", sector: "Healthcare", currency: "USD" },
  { symbol: "LLY", name: "Eli Lilly & Co.", country: "US", exchange: "NYSE", sector: "Healthcare", currency: "USD" },
  { symbol: "ORCL", name: "Oracle Corp.", country: "US", exchange: "NYSE", sector: "Technology", currency: "USD" },
  { symbol: "PYPL", name: "PayPal Holdings", country: "US", exchange: "NASDAQ", sector: "Financials", currency: "USD" },
  { symbol: "UBER", name: "Uber Technologies", country: "US", exchange: "NYSE", sector: "Technology", currency: "USD" },

  // ═══ India - NSE (EXPANDED with full group companies) ═══
  // Adani Group
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd.", country: "IN", exchange: "NSE", sector: "Industrials", currency: "INR" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ Ltd.", country: "IN", exchange: "NSE", sector: "Industrials", currency: "INR" },
  { symbol: "ADANIGREEN", name: "Adani Green Energy Ltd.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },
  { symbol: "ADANIPOWER", name: "Adani Power Ltd.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },
  { symbol: "ATGL", name: "Adani Total Gas Ltd.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },
  { symbol: "AWL", name: "Adani Wilmar Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Defensive", currency: "INR" },
  { symbol: "ADANIENERGY", name: "Adani Energy Solutions Ltd.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },
  { symbol: "AMBUJACEMENT", name: "Ambuja Cements Ltd. (Adani)", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "ACC", name: "ACC Ltd. (Adani)", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "NDTV", name: "NDTV Ltd. (Adani)", country: "IN", exchange: "NSE", sector: "Communication", currency: "INR" },

  // Tata Group
  { symbol: "TCS", name: "Tata Consultancy Services Ltd.", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "TATAPOWER", name: "Tata Power Co. Ltd.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Defensive", currency: "INR" },
  { symbol: "TATACOMM", name: "Tata Communications Ltd.", country: "IN", exchange: "NSE", sector: "Communication", currency: "INR" },
  { symbol: "TATAELXSI", name: "Tata Elxsi Ltd.", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "TATACHEM", name: "Tata Chemicals Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "TITAN", name: "Titan Company Ltd. (Tata)", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "VOLTAS", name: "Voltas Ltd. (Tata)", country: "IN", exchange: "NSE", sector: "Industrials", currency: "INR" },
  { symbol: "TRENT", name: "Trent Ltd. (Tata)", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "INDHOTEL", name: "Indian Hotels Co. Ltd. (Tata)", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },

  // Reliance Group
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },

  // Mahindra Group
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd.", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "MHRIL", name: "Mahindra Holidays & Resorts", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },

  // Bajaj Group
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "BAJFINSV", name: "Bajaj Finserv Ltd.", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },

  // Other major Indian stocks
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "INFY", name: "Infosys Ltd.", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Defensive", currency: "INR" },
  { symbol: "ITC", name: "ITC Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Defensive", currency: "INR" },
  { symbol: "SBIN", name: "State Bank of India", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", country: "IN", exchange: "NSE", sector: "Communication", currency: "INR" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "LT", name: "Larsen & Toubro Ltd.", country: "IN", exchange: "NSE", sector: "Industrials", currency: "INR" },
  { symbol: "WIPRO", name: "Wipro Ltd.", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd.", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "SUNPHARMA", name: "Sun Pharma Industries Ltd.", country: "IN", exchange: "NSE", sector: "Healthcare", currency: "INR" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd.", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "NESTLEIND", name: "Nestle India Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Defensive", currency: "INR" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", country: "IN", exchange: "NSE", sector: "Healthcare", currency: "INR" },
  { symbol: "CIPLA", name: "Cipla Ltd.", country: "IN", exchange: "NSE", sector: "Healthcare", currency: "INR" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd.", country: "IN", exchange: "NSE", sector: "Healthcare", currency: "INR" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "POWERGRID", name: "Power Grid Corp. of India", country: "IN", exchange: "NSE", sector: "Utilities", currency: "INR" },
  { symbol: "NTPC", name: "NTPC Ltd.", country: "IN", exchange: "NSE", sector: "Utilities", currency: "INR" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },
  { symbol: "COALINDIA", name: "Coal India Ltd.", country: "IN", exchange: "NSE", sector: "Energy", currency: "INR" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "SBILIFE", name: "SBI Life Insurance", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd.", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "ZOMATO", name: "Zomato Ltd.", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "PAYTM", name: "One97 Communications (Paytm)", country: "IN", exchange: "NSE", sector: "Technology", currency: "INR" },
  { symbol: "NYKAA", name: "FSN E-Commerce (Nykaa)", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "POLICYBZR", name: "PB Fintech (PolicyBazaar)", country: "IN", exchange: "NSE", sector: "Financials", currency: "INR" },
  { symbol: "DMART", name: "Avenue Supermarts (DMart)", country: "IN", exchange: "NSE", sector: "Consumer Defensive", currency: "INR" },
  { symbol: "PIDILITIND", name: "Pidilite Industries Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "VEDL", name: "Vedanta Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd.", country: "IN", exchange: "NSE", sector: "Materials", currency: "INR" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd.", country: "IN", exchange: "NSE", sector: "Consumer Cyclical", currency: "INR" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise", country: "IN", exchange: "NSE", sector: "Healthcare", currency: "INR" },

  // ═══ UK - LSE ═══
  { symbol: "SHEL", name: "Shell PLC", country: "GB", exchange: "LSE", sector: "Energy", currency: "GBP" },
  { symbol: "AZN", name: "AstraZeneca PLC", country: "GB", exchange: "LSE", sector: "Healthcare", currency: "GBP" },
  { symbol: "HSBA", name: "HSBC Holdings", country: "GB", exchange: "LSE", sector: "Financials", currency: "GBP" },
  { symbol: "ULVR", name: "Unilever PLC", country: "GB", exchange: "LSE", sector: "Consumer Defensive", currency: "GBP" },
  { symbol: "BP", name: "BP PLC", country: "GB", exchange: "LSE", sector: "Energy", currency: "GBP" },
  { symbol: "RIO", name: "Rio Tinto Group", country: "GB", exchange: "LSE", sector: "Materials", currency: "GBP" },
  { symbol: "GSK", name: "GSK PLC", country: "GB", exchange: "LSE", sector: "Healthcare", currency: "GBP" },
  { symbol: "BARC", name: "Barclays PLC", country: "GB", exchange: "LSE", sector: "Financials", currency: "GBP" },

  // ═══ Japan - TSE ═══
  { symbol: "7203", name: "Toyota Motor Corp.", country: "JP", exchange: "TSE", sector: "Consumer Cyclical", currency: "JPY" },
  { symbol: "6758", name: "Sony Group Corp.", country: "JP", exchange: "TSE", sector: "Technology", currency: "JPY" },
  { symbol: "6861", name: "Keyence Corp.", country: "JP", exchange: "TSE", sector: "Technology", currency: "JPY" },
  { symbol: "9984", name: "SoftBank Group", country: "JP", exchange: "TSE", sector: "Communication", currency: "JPY" },
  { symbol: "6902", name: "Denso Corp.", country: "JP", exchange: "TSE", sector: "Consumer Cyclical", currency: "JPY" },
  { symbol: "8306", name: "Mitsubishi UFJ Financial", country: "JP", exchange: "TSE", sector: "Financials", currency: "JPY" },

  // ═══ Germany - XETRA ═══
  { symbol: "SAP", name: "SAP SE", country: "DE", exchange: "XETRA", sector: "Technology", currency: "EUR" },
  { symbol: "SIE", name: "Siemens AG", country: "DE", exchange: "XETRA", sector: "Industrials", currency: "EUR" },
  { symbol: "ALV", name: "Allianz SE", country: "DE", exchange: "XETRA", sector: "Financials", currency: "EUR" },
  { symbol: "BAS", name: "BASF SE", country: "DE", exchange: "XETRA", sector: "Materials", currency: "EUR" },
  { symbol: "VOW3", name: "Volkswagen AG", country: "DE", exchange: "XETRA", sector: "Consumer Cyclical", currency: "EUR" },
  { symbol: "BMW", name: "BMW AG", country: "DE", exchange: "XETRA", sector: "Consumer Cyclical", currency: "EUR" },

  // ═══ China ═══
  { symbol: "600519", name: "Kweichow Moutai", country: "CN", exchange: "SSE", sector: "Consumer Defensive", currency: "CNY" },
  { symbol: "601318", name: "Ping An Insurance", country: "CN", exchange: "SSE", sector: "Financials", currency: "CNY" },
  { symbol: "600036", name: "China Merchants Bank", country: "CN", exchange: "SSE", sector: "Financials", currency: "CNY" },
  { symbol: "000858", name: "Wuliangye Yibin", country: "CN", exchange: "SZSE", sector: "Consumer Defensive", currency: "CNY" },
  { symbol: "300750", name: "CATL", country: "CN", exchange: "SZSE", sector: "Technology", currency: "CNY" },

  // ═══ Hong Kong ═══
  { symbol: "0700", name: "Tencent Holdings", country: "HK", exchange: "HKEX", sector: "Technology", currency: "HKD" },
  { symbol: "9988", name: "Alibaba Group", country: "HK", exchange: "HKEX", sector: "Technology", currency: "HKD" },
  { symbol: "1299", name: "AIA Group Ltd.", country: "HK", exchange: "HKEX", sector: "Financials", currency: "HKD" },
  { symbol: "3690", name: "Meituan", country: "HK", exchange: "HKEX", sector: "Technology", currency: "HKD" },

  // ═══ South Korea ═══
  { symbol: "005930", name: "Samsung Electronics", country: "KR", exchange: "KRX", sector: "Technology", currency: "KRW" },
  { symbol: "000660", name: "SK Hynix", country: "KR", exchange: "KRX", sector: "Technology", currency: "KRW" },
  { symbol: "035420", name: "Naver Corp.", country: "KR", exchange: "KRX", sector: "Technology", currency: "KRW" },

  // ═══ Australia ═══
  { symbol: "BHP", name: "BHP Group Ltd.", country: "AU", exchange: "ASX", sector: "Materials", currency: "AUD" },
  { symbol: "CBA", name: "Commonwealth Bank", country: "AU", exchange: "ASX", sector: "Financials", currency: "AUD" },
  { symbol: "CSL", name: "CSL Ltd.", country: "AU", exchange: "ASX", sector: "Healthcare", currency: "AUD" },

  // ═══ France ═══
  { symbol: "MC", name: "LVMH Moët Hennessy", country: "FR", exchange: "Euronext", sector: "Consumer Cyclical", currency: "EUR" },
  { symbol: "OR", name: "L'Oréal SA", country: "FR", exchange: "Euronext", sector: "Consumer Defensive", currency: "EUR" },
  { symbol: "TTE", name: "TotalEnergies SE", country: "FR", exchange: "Euronext", sector: "Energy", currency: "EUR" },
  { symbol: "SAN_FR", name: "Sanofi SA", country: "FR", exchange: "Euronext", sector: "Healthcare", currency: "EUR" },

  // ═══ Canada ═══
  { symbol: "RY", name: "Royal Bank of Canada", country: "CA", exchange: "TSX", sector: "Financials", currency: "CAD" },
  { symbol: "TD", name: "Toronto-Dominion Bank", country: "CA", exchange: "TSX", sector: "Financials", currency: "CAD" },
  { symbol: "SHOP", name: "Shopify Inc.", country: "CA", exchange: "TSX", sector: "Technology", currency: "CAD" },
  { symbol: "ENB", name: "Enbridge Inc.", country: "CA", exchange: "TSX", sector: "Energy", currency: "CAD" },

  // ═══ Switzerland ═══
  { symbol: "NESN", name: "Nestlé SA", country: "CH", exchange: "SIX", sector: "Consumer Defensive", currency: "CHF" },
  { symbol: "ROG", name: "Roche Holding AG", country: "CH", exchange: "SIX", sector: "Healthcare", currency: "CHF" },
  { symbol: "NOVN", name: "Novartis AG", country: "CH", exchange: "SIX", sector: "Healthcare", currency: "CHF" },

  // ═══ Brazil ═══
  { symbol: "VALE3", name: "Vale S.A.", country: "BR", exchange: "B3", sector: "Materials", currency: "BRL" },
  { symbol: "PETR4", name: "Petrobras", country: "BR", exchange: "B3", sector: "Energy", currency: "BRL" },
  { symbol: "ITUB4", name: "Itaú Unibanco", country: "BR", exchange: "B3", sector: "Financials", currency: "BRL" },

  // ═══ Others ═══
  { symbol: "2222", name: "Saudi Aramco", country: "SA", exchange: "Tadawul", sector: "Energy", currency: "SAR" },
  { symbol: "2330", name: "Taiwan Semiconductor (TSMC)", country: "TW", exchange: "TWSE", sector: "Technology", currency: "TWD" },
  { symbol: "2317", name: "Hon Hai Precision (Foxconn)", country: "TW", exchange: "TWSE", sector: "Technology", currency: "TWD" },
  { symbol: "D05", name: "DBS Group Holdings", country: "SG", exchange: "SGX", sector: "Financials", currency: "SGD" },
  { symbol: "O39", name: "OCBC Bank", country: "SG", exchange: "SGX", sector: "Financials", currency: "SGD" },
  { symbol: "ASML", name: "ASML Holding NV", country: "NL", exchange: "Euronext", sector: "Technology", currency: "EUR" },
  { symbol: "SAN_ES", name: "Banco Santander", country: "ES", exchange: "BME", sector: "Financials", currency: "EUR" },
  { symbol: "IBE", name: "Iberdrola SA", country: "ES", exchange: "BME", sector: "Utilities", currency: "EUR" },
  { symbol: "AMXB", name: "América Móvil", country: "MX", exchange: "BMV", sector: "Communication", currency: "MXN" },
  { symbol: "NPN", name: "Naspers Ltd.", country: "ZA", exchange: "JSE", sector: "Technology", currency: "ZAR" },
  { symbol: "BBCA", name: "Bank Central Asia", country: "ID", exchange: "IDX", sector: "Financials", currency: "IDR" },
  { symbol: "PTT", name: "PTT Public Company", country: "TH", exchange: "SET", sector: "Energy", currency: "THB" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let inserted = 0;
    const batchSize = 25;
    for (let i = 0; i < STOCKS.length; i += batchSize) {
      const batch = STOCKS.slice(i, i + batchSize);
      const { error } = await supabase.from("stocks").upsert(batch, {
        onConflict: "symbol,exchange",
      });
      if (error) {
        console.error(`Batch ${i} error:`, error);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted, total: STOCKS.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
