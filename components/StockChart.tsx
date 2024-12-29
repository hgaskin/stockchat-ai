'use client';

import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistoricalData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type TechnicalIndicators = {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma50: number;
  sma200: number;
  adx: number;
};

interface StockChartProps {
  data: {
    historical: HistoricalData[];
    technical: TechnicalIndicators;
  };
  symbol: string;
}

export function StockChart({ data, symbol }: StockChartProps) {
  // Format date to show only past dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date > new Date()) {
      return new Date().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  // Add SMA data to historical data
  const chartData = data.historical.map((d, i, arr) => {
    const sma50 = i >= 49 
      ? arr.slice(i - 49, i + 1).reduce((sum, item) => sum + item.close, 0) / 50 
      : null;
    const sma200 = i >= 199 
      ? arr.slice(i - 199, i + 1).reduce((sum, item) => sum + item.close, 0) / 200 
      : null;
    return {
      ...d,
      date: formatDate(d.date),
      sma50,
      sma200,
    };
  });

  // Check if we're using fallback data
  const isUsingFallbackData = 
    data.technical.macd.macd === 0 && 
    data.technical.macd.signal === 0 && 
    data.technical.macd.histogram === 0;

  return (
    <div className="space-y-8">
      {isUsingFallbackData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              Some technical indicators are showing estimated values due to API rate limits. Try again in a minute for complete data.
            </p>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">{symbol} Price History</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={formatDate}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value: number) => ['$' + value.toFixed(2)]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#2563eb" 
              name="Price"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="sma50" 
              stroke="#16a34a" 
              name="50 SMA"
              dot={false}
              strokeDasharray={isUsingFallbackData ? "5 5" : "0"}
            />
            <Line 
              type="monotone" 
              dataKey="sma200" 
              stroke="#dc2626" 
              name="200 SMA"
              dot={false}
              strokeDasharray={isUsingFallbackData ? "5 5" : "0"}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Volume Chart */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Trading Volume</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [value.toLocaleString(), 'Volume']}
            />
            <Bar dataKey="volume" fill="#3b82f6" name="Volume" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Technical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RSI Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">RSI (14)</h3>
          <div className="text-2xl font-bold mb-4">
            {data.technical.rsi.toFixed(2)}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-2 rounded-full ${
                data.technical.rsi > 70 ? 'bg-red-500' :
                data.technical.rsi < 30 ? 'bg-green-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${data.technical.rsi}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-sm text-gray-500">
            <span>Oversold</span>
            <span>Neutral</span>
            <span>Overbought</span>
          </div>
        </Card>

        {/* MACD Card */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">MACD</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>MACD Line:</span>
              <span className={data.technical.macd.macd > 0 ? 'text-green-500' : 'text-red-500'}>
                {data.technical.macd.macd.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Signal Line:</span>
              <span>{data.technical.macd.signal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Histogram:</span>
              <span className={data.technical.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'}>
                {data.technical.macd.histogram.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* ADX Card */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">ADX (Trend Strength)</h3>
          <div className="text-2xl font-bold mb-4">
            {data.technical.adx.toFixed(2)}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-2 rounded-full ${
                data.technical.adx > 50 ? 'bg-green-500' :
                data.technical.adx > 25 ? 'bg-blue-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${Math.min(data.technical.adx, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-sm text-gray-500">
            <span>Weak</span>
            <span>Strong</span>
            <span>Very Strong</span>
          </div>
        </Card>

        {/* Moving Averages Card */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Moving Averages</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>50-day SMA:</span>
                <span className="font-semibold">${data.technical.sma50.toFixed(2)}</span>
              </div>
              <div className="h-1.5 bg-green-100 rounded-full">
                <div 
                  className="h-1.5 bg-green-500 rounded-full"
                  style={{ width: '50%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>200-day SMA:</span>
                <span className="font-semibold">${data.technical.sma200.toFixed(2)}</span>
              </div>
              <div className="h-1.5 bg-red-100 rounded-full">
                <div 
                  className="h-1.5 bg-red-500 rounded-full"
                  style={{ width: '50%' }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 