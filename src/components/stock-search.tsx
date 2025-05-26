"use client";

import { useState, useTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from 'next/image';
import { Loader2, AlertTriangle, SearchIcon, LineChart } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { analyzeStockTrendAction } from '@/app/actions';
import type { AnalyzeStockTrendOutput } from '@/ai/flows/analyze-stock-trend';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  tickerSymbol: z.string()
    .min(1, "Ticker symbol is required.")
    .max(10, "Ticker symbol must be 10 characters or less.")
    .regex(/^[a-zA-Z0-9.-]+$/, "Ticker symbol contains invalid characters."),
});

type FormValues = z.infer<typeof formSchema>;

interface AnalysisResultState {
  data?: AnalyzeStockTrendOutput;
  error?: string;
  ticker?: string;
  chartImageUrl?: string; // Store the generated chart URL to display
}

export default function StockSearch() {
  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultState | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tickerSymbol: "TSLA",
    },
  });

  async function onSubmit(values: FormValues) {
    setAnalysisResult(null); // Clear previous results
    startTransition(async () => {
      const result = await analyzeStockTrendAction(values.tickerSymbol);
      // The chartDataUri from the action is a base64 string, suitable for direct use if needed
      // For display, we construct a similar URL to what might have been fetched
      const displayChartUrl = `https://placehold.co/800x400.png?text=${encodeURIComponent(values.tickerSymbol)}+Chart`;
      if (result.success && result.data) {
        setAnalysisResult({ data: result.data, ticker: values.tickerSymbol, chartImageUrl: displayChartUrl });
      } else {
        setAnalysisResult({ error: result.error || "An unknown error occurred.", ticker: values.tickerSymbol, chartImageUrl: displayChartUrl });
      }
    });
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-2xl rounded-xl overflow-hidden border-border/50">
        <CardHeader className="bg-card-foreground/5 p-6">
          <div className="flex items-center space-x-3">
            <SearchIcon className="h-7 w-7 text-primary" />
            <div>
              <CardTitle className="text-2xl md:text-3xl text-primary">Analyze Stock Trend</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter a stock ticker to get AI-powered analysis and recommendations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="tickerSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-foreground/90">Ticker Symbol</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., AAPL, MSFT, TSLA" 
                        {...field} 
                        className="text-base p-3 h-12 rounded-md focus:ring-accent focus:border-accent" 
                        aria-label="Stock Ticker Symbol Input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-3 h-12 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <LineChart className="mr-2 h-5 w-5" />
                    Get Analysis
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && !analysisResult && (
        <Card className="shadow-xl rounded-xl animate-pulse border-border/50">
          <CardHeader className="p-6">
            <div className="h-6 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="shadow-2xl rounded-xl animate-fadeIn border-border/50 overflow-hidden">
          <CardHeader className="bg-card-foreground/5 p-6">
            <CardTitle className="text-2xl md:text-3xl text-accent">
              Analysis for {analysisResult.ticker?.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                <LineChart className="h-6 w-6 mr-2" />
                Candlestick Chart
              </h3>
              <div className="bg-muted/50 p-1 rounded-lg overflow-hidden border border-border shadow-inner aspect-video">
                {analysisResult.chartImageUrl && (
                    <Image
                    src={analysisResult.chartImageUrl}
                    alt={`Candlestick chart for ${analysisResult.ticker}`}
                    width={800}
                    height={400}
                    className="rounded-md object-contain w-full h-full"
                    data-ai-hint="stock chart finance"
                    priority={true} 
                  />
                )}
              </div>
               <p className="text-xs text-muted-foreground mt-2 text-center">Illustrative chart placeholder.</p>
            </div>

            <Separator />

            {analysisResult.data && (
              <>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">AI-Generated Analysis</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50 prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{analysisResult.data.analysis}</p>
                  </div>
                </div>
                
                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Investment Recommendation</h3>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50 prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{analysisResult.data.recommendation}</p>
                  </div>
                </div>
              </>
            )}
            
            {analysisResult.error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-start shadow-md">
                <AlertTriangle className="h-6 w-6 mr-3 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Analysis Failed</h3>
                  <p className="mt-1">{analysisResult.error}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-6 bg-card-foreground/5 border-t border-border">
             <p className="text-xs text-muted-foreground">
                MarketSage provides AI-generated analysis for informational purposes only. It is not financial advice. Always conduct your own research before making investment decisions.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
