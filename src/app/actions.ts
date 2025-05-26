"use server";

import { analyzeStockTrend, type AnalyzeStockTrendOutput } from '@/ai/flows/analyze-stock-trend';
import { z } from 'zod';

const TickerSchema = z.string().min(1, "Ticker symbol must be at least 1 character long.").max(10, "Ticker symbol can be at most 10 characters long.");

// Helper to fetch image and convert to base64 data URI
async function getImageDataUri(imageUrl: string, tickerSymbol: string): Promise<string> {
  try {
    const res = await fetch(`${imageUrl}?text=${encodeURIComponent(tickerSymbol)}+Chart`);
    if (!res.ok) {
      console.error(`Failed to fetch image: ${res.status} ${res.statusText}`);
      // Provide a more descriptive error image if fetching fails
      const errorImageUrl = `https://placehold.co/800x400.png?text=Error+Loading+Chart+For+${encodeURIComponent(tickerSymbol)}`;
      const errorRes = await fetch(errorImageUrl);
      if (!errorRes.ok) throw new Error('Failed to fetch error placeholder image'); // Should not happen with placehold.co
      const errorImageBuffer = await errorRes.arrayBuffer();
      const errorBase64Image = Buffer.from(errorImageBuffer).toString('base64');
      return `data:image/png;base64,${errorBase64Image}`;
    }
    const imageBuffer = await res.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = res.headers.get('content-type') || 'image/png';
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error("Error in getImageDataUri:", error);
    // Fallback to a generic error image if any step fails
    const genericErrorText = "Chart+Unavailable";
    const fallbackUrl = `https://placehold.co/800x400.png?text=${encodeURIComponent(genericErrorText)}`;
     try {
        const fallbackRes = await fetch(fallbackUrl);
        if (!fallbackRes.ok) throw new Error('Failed to fetch generic fallback image');
        const fallbackImageBuffer = await fallbackRes.arrayBuffer();
        const fallbackBase64Image = Buffer.from(fallbackImageBuffer).toString('base64');
        return `data:image/png;base64,${fallbackBase64Image}`;
    } catch (finalError) {
        console.error("Error fetching generic fallback image:", finalError);
        // Ultimate fallback: tiny transparent pixel, though AI might not like this.
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }
  }
}

export async function analyzeStockTrendAction(
  tickerSymbol: string
): Promise<{ success: boolean; data?: AnalyzeStockTrendOutput; error?: string }> {
  try {
    const validatedTicker = TickerSchema.safeParse(tickerSymbol);
    if (!validatedTicker.success) {
      return { success: false, error: validatedTicker.error.errors.map(e => e.message).join(', ') };
    }

    const placeholderChartUrl = `https://placehold.co/800x400.png`;
    // Pass the validated ticker to ensure it's used in the chart text
    const chartDataUri = await getImageDataUri(placeholderChartUrl, validatedTicker.data);

    const analysisOutput = await analyzeStockTrend({
      tickerSymbol: validatedTicker.data,
      chartDataUri: chartDataUri,
    });

    return { success: true, data: analysisOutput };
  } catch (error) {
    console.error("Error in analyzeStockTrendAction:", error);
    let errorMessage = "Failed to analyze stock trend due to an unexpected error.";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
    }
    return { success: false, error: errorMessage };
  }
}
