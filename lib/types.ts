export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  description?: string;
  sector?: string;
  industry?: string;
  weekHigh52?: number;
  weekLow52?: number;
  peRatio?: number;
  pegRatio?: number;
  beta?: number;
  ebitda?: number;
  profitMargin?: number;
  eps?: number;
  dividendYield?: number;
  revenueGrowthYOY?: number;
  analystTargetPrice?: number;
}

export type StockError = 
  | { code: 'RATE_LIMIT'; message: string }
  | { code: 'INVALID_SYMBOL'; message: string }
  | { code: 'API_ERROR'; message: string }; 