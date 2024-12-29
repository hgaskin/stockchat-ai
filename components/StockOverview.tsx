import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StockOverviewProps {
  data: {
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
  };
}

function formatNumber(num: number | undefined | null, type: 'currency' | 'percent' | 'volume' | 'ratio' = 'currency'): string {
  // Early return for invalid values
  if (num === undefined || num === null || !Number.isFinite(num)) {
    return 'N/A';
  }
  
  try {
    // Ensure we're working with a valid number
    const validNum = Number(num);
    if (!Number.isFinite(validNum)) {
      return 'N/A';
    }

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          notation: Math.abs(validNum) >= 1e9 ? 'compact' : 'standard',
          maximumFractionDigits: 2
        }).format(validNum);
      
      case 'percent':
        return new Intl.NumberFormat('en-US', { 
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(validNum / 100);
      
      case 'volume':
        return new Intl.NumberFormat('en-US', { 
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(validNum);
      
      case 'ratio':
        return new Intl.NumberFormat('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(validNum);
      
      default:
        return 'N/A';
    }
  } catch (error) {
    console.error('Error formatting number:', error, { num, type });
    return 'N/A';
  }
}

export function StockOverview({ data }: StockOverviewProps) {
  if (!data || typeof data !== 'object') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Unable to display stock data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Ensure all numeric values are valid numbers or undefined
  const safeData = {
    ...data,
    price: parseFloat(String(data.price)) || undefined,
    change: parseFloat(String(data.change)) || undefined,
    changePercent: parseFloat(String(data.changePercent)) || undefined,
    volume: parseInt(String(data.volume)) || undefined,
    marketCap: parseFloat(String(data.marketCap)) || undefined,
    weekHigh52: parseFloat(String(data.weekHigh52)) || undefined,
    weekLow52: parseFloat(String(data.weekLow52)) || undefined,
    peRatio: parseFloat(String(data.peRatio)) || undefined,
    pegRatio: parseFloat(String(data.pegRatio)) || undefined,
    beta: parseFloat(String(data.beta)) || undefined,
    ebitda: parseFloat(String(data.ebitda)) || undefined,
    profitMargin: parseFloat(String(data.profitMargin)) || undefined,
    eps: parseFloat(String(data.eps)) || undefined,
    dividendYield: parseFloat(String(data.dividendYield)) || undefined,
    revenueGrowthYOY: parseFloat(String(data.revenueGrowthYOY)) || undefined,
    analystTargetPrice: parseFloat(String(data.analystTargetPrice)) || undefined,
  };

  // Use nullish coalescing for the color to handle undefined/null cases
  const priceChangeColor = (safeData.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{safeData.name || 'Unknown'} ({safeData.symbol || 'Unknown'})</CardTitle>
            <CardDescription>{[safeData.sector, safeData.industry].filter(Boolean).join(' • ') || 'Information not available'}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatNumber(safeData.price)}</div>
            <div className={`text-sm font-medium ${priceChangeColor}`}>
              {formatNumber(safeData.change)} ({formatNumber(safeData.changePercent, 'percent')})
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Market Cap</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.marketCap)}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Volume</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.volume, 'volume')}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">52-Week High</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.weekHigh52)}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">52-Week Low</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.weekLow52)}</div>
              </div>
            </div>
            {safeData.description && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">About</h4>
                <p className="text-sm">{safeData.description}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="financials">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">P/E Ratio</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.peRatio, 'ratio')}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">PEG Ratio</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.pegRatio, 'ratio')}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Beta</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.beta, 'ratio')}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">EBITDA</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.ebitda)}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">EPS</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.eps, 'currency')}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Profit Margin</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.profitMargin, 'percent')}</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="growth">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Revenue Growth (YoY)</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.revenueGrowthYOY, 'percent')}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Dividend Yield</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.dividendYield, 'percent')}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Analyst Target</h4>
                <div className="text-lg font-semibold">{formatNumber(safeData.analystTargetPrice)}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 