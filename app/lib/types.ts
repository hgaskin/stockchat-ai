export interface StockData {
  // Company Info
  symbol: string;
  name: string;
  description?: string;
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
  eps?: number;
  dividendYield?: number;
  
  // Growth & Targets
  revenueGrowthYOY?: number;
  analystTargetPrice?: number;
}

export interface StockError extends Error {
  code: 'RATE_LIMIT' | 'INVALID_SYMBOL' | 'API_ERROR';
} 