import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { StockService } from '@/app/lib/services/stock/stock-service';

// Set a longer timeout for the API route
export const maxDuration = 30;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log('Received request with messages:', messages);

  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    tools: {
      getStockInfo: tool({
        description: 'Get comprehensive company overview including stock price, market cap, financial ratios, and key metrics',
        parameters: z.object({
          symbol: z.string().describe('The stock ticker symbol (e.g., AAPL, MSFT)'),
        }),
        execute: async ({ symbol }: { symbol: string }) => {
          console.log('getStockInfo called with symbol:', symbol);
          try {
            const quote = await StockService.getQuote(symbol);
            console.log('Retrieved quote data:', quote);
            return {
              type: 'StockOverview',
              data: {
                // Company Info
                symbol: quote.symbol,
                name: quote.name,
                description: quote.description,
                sector: quote.sector,
                industry: quote.industry,
                
                // Price & Trading Info
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
                volume: quote.volume,
                marketCap: quote.marketCap,
                weekHigh52: quote.weekHigh52,
                weekLow52: quote.weekLow52,
                
                // Financial Metrics
                peRatio: quote.peRatio,
                pegRatio: quote.pegRatio,
                beta: quote.beta,
                ebitda: quote.ebitda,
                profitMargin: quote.profitMargin,
                eps: quote.eps,
                dividendYield: quote.dividendYield,
                
                // Growth & Targets
                revenueGrowthYOY: quote.revenueGrowthYOY,
                analystTargetPrice: quote.analystTargetPrice
              }
            };
          } catch (error) {
            console.error('Error in getStockInfo:', error);
            return {
              type: 'Error',
              error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
          }
        },
      }),
    },
    experimental_toolCallStreaming: true,
    maxSteps: 5,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}

const systemPrompt = `You are a helpful AI assistant focused on providing stock market information and analysis.

Your capabilities include:
1. Retrieving real-time stock information and company overviews
2. Analyzing financial metrics and providing insights
3. Explaining various financial ratios and indicators
4. Identifying company strengths and potential concerns

When users first interact or ask what you can do:
- Introduce yourself and explain your capabilities
- Provide example queries they can try
- Suggest starting with a simple stock query like "Tell me about AAPL"

When users ask about stocks:
1. Use getStockInfo to get comprehensive information about a company
2. After the component is displayed, analyze the data and provide insights about:
   - Key strengths (e.g., strong growth, good margins)
   - Potential concerns (e.g., high P/E ratio, negative earnings)
   - Notable metrics that stand out
   - Explain any technical terms or ratios if they seem complex

For non-stock queries:
- If users ask about functionality, explain what you can do
- If users ask about specific financial terms, provide clear explanations
- For other queries, politely explain that you're focused on stock information and guide them back to your core capabilities

Remember to:
- Be concise but informative
- Use plain language when explaining financial concepts
- Offer to explain any terms that might be unfamiliar
- Guide users toward making the most of your stock analysis capabilities

Example queries you can suggest:
- "What can you tell me about AAPL?"
- "Explain NET's financial metrics"
- "What are the key strengths of MSFT?"
- "Help me understand GOOGL's P/E ratio"
- "What are concerning metrics for AMZN?"`;