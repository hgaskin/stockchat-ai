'use server';

import { unstable_cache } from 'next/cache';
import { z } from 'zod';

const StockDataSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number(),
  volume: z.number(),
  marketCap: z.number(),
});

type StockData = z.infer<typeof StockDataSchema>;

// Cache the stock data for 5 minutes
const getCachedStockData = unstable_cache(
  async (symbol: string): Promise<StockData> => {
    const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API key not configured');
    }

    // Fetch quote data
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const quoteRes = await fetch(quoteUrl, { next: { revalidate: 300 } }); // 5 minutes
    
    if (!quoteRes.ok) {
      throw new Error(`HTTP error! status: ${quoteRes.status}`);
    }
    
    const quoteData = await quoteRes.json();
    
    if (quoteData['Error Message']) {
      throw new Error(`Alpha Vantage error: ${quoteData['Error Message']}`);
    }

    if (quoteData['Note']) {
      throw new Error('API rate limit reached. Please try again in a minute.');
    }

    const quote = quoteData['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error('No quote data available');
    }

    // Fetch overview data
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const overviewRes = await fetch(overviewUrl, { next: { revalidate: 300 } });
    const overviewData = await overviewRes.json();

    if (overviewData['Error Message']) {
      throw new Error(`Alpha Vantage error: ${overviewData['Error Message']}`);
    }

    return StockDataSchema.parse({
      symbol,
      price: Number(quote['05. price']),
      change: Number(quote['10. change percent'].replace('%', '')),
      volume: Number(quote['06. volume']),
      marketCap: Number(overviewData.MarketCapitalization) || 0,
    });
  },
  ['stock-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['stock-data'],
  }
);

export async function fetchStockData(symbol: string) {
  try {
    // Validate symbol format
    if (!/^[A-Z]{1,5}$/.test(symbol)) {
      throw new Error('Invalid stock symbol format');
    }

    return await getCachedStockData(symbol);
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    throw error;
  }
} 