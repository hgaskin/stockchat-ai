import { createAlphaVantageRequest, GlobalQuoteSchema, TimeSeriesSchema, RSISchema, MACDSchema, ADXSchema, CompanyOverviewSchema } from '../alpha-vantage/client';

export interface StockQuote {
  // Company Info
  symbol: string;
  name: string;
  description: string;
  sector?: string;
  industry?: string;

  // Price & Trading Info
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  weekHigh52?: number;
  weekLow52?: number;

  // Financial Metrics
  peRatio?: number;
  pegRatio?: number;
  beta?: number;
  ebitda?: number;
  profitMargin?: number;
  operatingMargin?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
  eps?: number;
  dividendPerShare?: number;
  dividendYield?: number;

  // Growth & Targets
  revenueGrowthYOY?: number;
  earningsGrowthYOY?: number;
  analystTargetPrice?: number;
}

export interface StockHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalAnalysis {
  symbol: string;
  quote: StockQuote;
  historicalData: StockHistoricalData[];
  indicators: {
    rsi: number;
    macd: {
      macdLine: number;
      signalLine: number;
      histogram: number;
    };
    adx: number;
  };
}

export class StockService {
  static async getQuote(symbol: string) {
    console.log('StockService.getQuote called with symbol:', symbol);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const quote = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
        { signal: controller.signal }
      );
      console.log('Alpha Vantage API response status:', quote.status);
      const quoteData = await quote.json();
      console.log('Alpha Vantage quote data:', quoteData);

      // Check for rate limit message
      if (quoteData.Information?.includes('rate limit')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      if (!quoteData['Global Quote']) {
        throw new Error('INVALID_RESPONSE');
      }

      const overview = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
        { signal: controller.signal }
      );
      console.log('Alpha Vantage API overview response status:', overview.status);
      const overviewData = await overview.json();
      console.log('Alpha Vantage overview data:', overviewData);

      clearTimeout(timeout);

      // Check for rate limit message in overview
      if (overviewData.Information?.includes('rate limit')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // Combine and transform the data
      const result = {
        symbol,
        name: overviewData.Name || symbol,
        description: overviewData.Description,
        sector: overviewData.Sector,
        industry: overviewData.Industry,
        
        // Price & Trading Info
        price: parseFloat(quoteData['Global Quote']['05. price']),
        change: parseFloat(quoteData['Global Quote']['09. change']),
        changePercent: parseFloat(quoteData['Global Quote']['10. change percent'].replace('%', '')),
        volume: parseInt(quoteData['Global Quote']['06. volume']),
        marketCap: parseFloat(overviewData.MarketCapitalization),
        weekHigh52: parseFloat(overviewData['52WeekHigh']),
        weekLow52: parseFloat(overviewData['52WeekLow']),
        
        // Financial Metrics
        peRatio: parseFloat(overviewData.PERatio),
        pegRatio: parseFloat(overviewData.PEGRatio),
        beta: parseFloat(overviewData.Beta),
        ebitda: parseFloat(overviewData.EBITDA),
        profitMargin: parseFloat(overviewData.ProfitMargin),
        eps: parseFloat(overviewData.EPS),
        dividendYield: parseFloat(overviewData.DividendYield),
        
        // Growth & Targets
        revenueGrowthYOY: parseFloat(overviewData.RevenueGrowthYOY),
        analystTargetPrice: parseFloat(overviewData.AnalystTargetPrice)
      };

      console.log('Transformed stock data:', result);
      return result;
    } catch (error: unknown) {
      console.error('Error fetching stock data:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
          throw new Error('API rate limit exceeded. Please try again tomorrow or upgrade to a premium plan.');
        } else if (error.message === 'INVALID_RESPONSE') {
          throw new Error('Unable to fetch stock data. Please verify the stock symbol and try again.');
        }
      }
      throw new Error('An error occurred while fetching stock data. Please try again later.');
    }
  }

  static async getHistoricalData(symbol: string): Promise<StockHistoricalData[]> {
    const data = await createAlphaVantageRequest('daily', { 
      symbol,
      outputsize: 'compact' // Last 100 data points
    });
    
    const parsed = TimeSeriesSchema.parse(data);
    const timeSeries = parsed['Time Series (Daily)'];

    return Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }));
  }

  static async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis> {
    const [quote, historicalData] = await Promise.all([
      this.getQuote(symbol),
      this.getHistoricalData(symbol),
    ]);

    // Calculate technical indicators
    const rsi = await this.getRSI(symbol);
    const macd = await this.getMACD(symbol);
    const adx = await this.getADX(symbol);

    return {
      symbol,
      quote,
      historicalData,
      indicators: {
        rsi,
        macd,
        adx,
      },
    };
  }

  private static async getRSI(symbol: string): Promise<number> {
    const data = await createAlphaVantageRequest('rsi', {
      symbol,
      interval: 'daily',
      time_period: '14',
      series_type: 'close'
    });

    const parsed = RSISchema.parse(data);
    const latestRSI = Object.values(parsed['Technical Analysis: RSI'])[0];
    return parseFloat(latestRSI.RSI);
  }

  private static async getMACD(symbol: string): Promise<{
    macdLine: number;
    signalLine: number;
    histogram: number;
  }> {
    const data = await createAlphaVantageRequest('macd', {
      symbol,
      interval: 'daily',
      series_type: 'close'
    });

    const parsed = MACDSchema.parse(data);
    const latestMACD = Object.values(parsed['Technical Analysis: MACD'])[0];
    return {
      macdLine: parseFloat(latestMACD.MACD),
      signalLine: parseFloat(latestMACD.MACD_Signal),
      histogram: parseFloat(latestMACD.MACD_Hist),
    };
  }

  private static async getADX(symbol: string): Promise<number> {
    const data = await createAlphaVantageRequest('adx', {
      symbol,
      interval: 'daily',
      time_period: '14'
    });

    const parsed = ADXSchema.parse(data);
    const latestADX = Object.values(parsed['Technical Analysis: ADX'])[0];
    return parseFloat(latestADX.ADX);
  }
} 