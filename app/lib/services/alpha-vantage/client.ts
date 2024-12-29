import { z } from 'zod';

export const AlphaVantageConfig = {
  baseUrl: 'https://www.alphavantage.co/query',
  endpoints: {
    quote: 'GLOBAL_QUOTE',
    overview: 'OVERVIEW',
    daily: 'TIME_SERIES_DAILY',
    rsi: 'RSI',
    macd: 'MACD',
    adx: 'ADX',
  },
  revalidate: 300, // 5 minutes cache
} as const;

export class AlphaVantageError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'AlphaVantageError';
  }
}

export async function createAlphaVantageRequest(
  endpoint: keyof typeof AlphaVantageConfig['endpoints'],
  params: Record<string, string>
) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new AlphaVantageError('Alpha Vantage API key not configured');
  }

  const url = new URL(AlphaVantageConfig.baseUrl);
  url.searchParams.set('function', AlphaVantageConfig.endpoints[endpoint]);
  url.searchParams.set('apikey', apiKey);
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: AlphaVantageConfig.revalidate }
    });

    if (!response.ok) {
      throw new AlphaVantageError(
        `HTTP error! status: ${response.status}`,
        'HTTP_ERROR',
        response.status
      );
    }

    const data = await response.json();

    // Check for API errors
    if (data['Error Message']) {
      throw new AlphaVantageError(
        data['Error Message'],
        'API_ERROR'
      );
    }

    if (data['Note']) {
      throw new AlphaVantageError(
        'API rate limit reached. Please try again in a minute.',
        'RATE_LIMIT'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AlphaVantageError) {
      throw error;
    }
    throw new AlphaVantageError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'UNKNOWN'
    );
  }
}

// Response schemas for type safety
export const GlobalQuoteSchema = z.object({
  'Global Quote': z.object({
    '01. symbol': z.string(),
    '02. open': z.string(),
    '03. high': z.string(),
    '04. low': z.string(),
    '05. price': z.string(),
    '06. volume': z.string(),
    '07. latest trading day': z.string(),
    '08. previous close': z.string(),
    '09. change': z.string(),
    '10. change percent': z.string(),
  }),
});

export const TimeSeriesSchema = z.object({
  'Time Series (Daily)': z.record(z.object({
    '1. open': z.string(),
    '2. high': z.string(),
    '3. low': z.string(),
    '4. close': z.string(),
    '5. volume': z.string(),
  })),
});

export const RSISchema = z.object({
  'Technical Analysis: RSI': z.record(z.object({
    RSI: z.string()
  }))
});

export const MACDSchema = z.object({
  'Technical Analysis: MACD': z.record(z.object({
    MACD: z.string(),
    MACD_Signal: z.string(),
    MACD_Hist: z.string()
  }))
});

export const ADXSchema = z.object({
  'Technical Analysis: ADX': z.record(z.object({
    ADX: z.string()
  }))
});

export const CompanyOverviewSchema = z.object({
  Symbol: z.string(),
  AssetType: z.string(),
  Name: z.string(),
  Description: z.string(),
  MarketCapitalization: z.string(),
  EBITDA: z.string(),
  PERatio: z.string(),
  PEGRatio: z.string(),
  BookValue: z.string(),
  DividendPerShare: z.string(),
  DividendYield: z.string(),
  EPS: z.string(),
  ProfitMargin: z.string(),
  QuarterlyEarningsGrowthYOY: z.string(),
  QuarterlyRevenueGrowthYOY: z.string(),
  AnalystTargetPrice: z.string(),
  Sector: z.string(),
  Industry: z.string(),
  Beta: z.string(),
  '52WeekHigh': z.string(),
  '52WeekLow': z.string(),
  '50DayMovingAverage': z.string(),
  '200DayMovingAverage': z.string(),
});

export type GlobalQuoteResponse = z.infer<typeof GlobalQuoteSchema>;
export type TimeSeriesResponse = z.infer<typeof TimeSeriesSchema>;
export type RSIResponse = z.infer<typeof RSISchema>;
export type MACDResponse = z.infer<typeof MACDSchema>;
export type ADXResponse = z.infer<typeof ADXSchema>;
export type CompanyOverviewResponse = z.infer<typeof CompanyOverviewSchema>; 