'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import { StockOverview } from '@/components/StockOverview';
import { StockData, StockError } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

function ToolError({ error }: { error: unknown }) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-2">
      <div className="flex items-center space-x-2">
        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-red-700 dark:text-red-200">{errorMessage}</p>
      </div>
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-all">
      <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
        Welcome to StockChat AI
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
        Your AI-powered financial insights companion
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              📊
            </span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Real-time Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Live stock information and market insights</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              📈
            </span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Smart Analysis</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Detailed financial metrics and trends</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              💡
            </span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Expert Insights</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clear explanations of complex metrics</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              🎯
            </span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Key Indicators</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Strengths and potential opportunities</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Try asking: <span className="font-medium text-gray-700 dark:text-gray-300">"Tell me about AAPL"</span> or <span className="font-medium text-gray-700 dark:text-gray-300">"What are NET's key metrics?"</span>
        </p>
      </div>
    </div>
  );
}

// Create strict types for tool results
type ToolResult = {
  type: 'StockOverview';
  data: StockData;
} | {
  type: 'Error';
  error: string;
};

export default function Chat() {
  const { toast } = useToast();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialInput: '',
    maxSteps: 5,
    onError: (error: Error) => {
      const stockError = error as unknown as StockError;
      if (stockError.code === 'RATE_LIMIT') {
        toast({
          variant: "destructive",
          title: "Rate Limit Reached",
          description: "Please try again in a minute."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred. Please try again."
        });
      }
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/70 backdrop-blur-md dark:bg-gray-800/70 supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">StockChat AI</h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            Intelligent stock analysis and market insights at your fingertips
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6 mb-24">
          {messages.length === 0 && <WelcomeMessage />}
          {messages.map((m: Message) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
              <div className={`rounded-2xl px-6 py-4 max-w-[85%] shadow-sm transition-all ${
                m.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700'
              }`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                  // Show loading state for pending tool calls
                  if (!('result' in toolInvocation)) {
                    return (
                      <div key={toolInvocation.toolCallId} className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse bg-gray-50 dark:bg-gray-800 rounded-md p-2 my-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Using tool: {toolInvocation.toolName}</span>
                      </div>
                    );
                  }

                  // Show error state if the tool call failed
                  if ('error' in toolInvocation) {
                    return (
                      <ToolError 
                        key={toolInvocation.toolCallId} 
                        error={toolInvocation.error} 
                      />
                    );
                  }

                  // Show tool results
                  if (toolInvocation.toolName === 'getStockInfo' && toolInvocation.result) {
                    const result = toolInvocation.result as ToolResult;

                    if (result.type === 'Error') {
                      return (
                        <div key={toolInvocation.toolCallId} className="flex justify-start w-full">
                          <ToolError error={result.error || 'Unknown error'} />
                        </div>
                      );
                    }

                    if (result.type === 'StockOverview' && result.data) {
                      return (
                        <div key={toolInvocation.toolCallId} className="flex justify-start w-full">
                          <StockOverview data={result.data} />
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4">
              <div className="rounded-2xl px-6 py-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white from-50% to-white/0 dark:from-gray-800 dark:to-gray-800/0 pt-8 pb-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="flex overflow-hidden rounded-2xl shadow-lg transition-all border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about any stock (e.g., 'Tell me about NET')"
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 flex items-center justify-center transition-all ${
                    isLoading 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isLoading ? 'Thinking...' : 'Ask'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}