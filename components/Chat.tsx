'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import { StockOverview } from '@/components/StockOverview';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error, reload } = useChat({
    maxSteps: 5,
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-col space-y-4">
        {messages.map((m: Message) => (
          <div key={m.id} className="flex flex-col space-y-4">
            <div
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {m.content}
              </div>
            </div>
            {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
              switch (toolInvocation.state) {
                case 'partial-call':
                  return (
                    <div key={toolInvocation.toolCallId} className="flex justify-start">
                      <div className="animate-pulse text-sm text-gray-500">
                        Fetching stock data...
                      </div>
                    </div>
                  );
                case 'call':
                  return (
                    <div key={toolInvocation.toolCallId} className="flex justify-start">
                      <div className="text-sm text-gray-500">
                        Analyzing stock data...
                      </div>
                    </div>
                  );
                case 'result':
                  if (toolInvocation.toolName === 'getStockInfo' && toolInvocation.result) {
                    const result = toolInvocation.result as {
                      type: string;
                      data?: any;
                      error?: string;
                    };

                    if (result.type === 'Error') {
                      return (
                        <div key={toolInvocation.toolCallId} className="flex justify-start w-full">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                              {result.error}
                            </AlertDescription>
                          </Alert>
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
              }
            })}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex justify-start w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center gap-4">
              An error occurred while processing your request.
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => reload()}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex space-x-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about any stock (e.g., 'Tell me about AAPL')"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={error != null}
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={error != null}
        >
          Send
        </button>
      </form>
    </div>
  );
} 