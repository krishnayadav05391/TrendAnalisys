import StockSearch from '@/components/stock-search';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10 md:mb-14">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Welcome to <span className="text-primary">Market</span><span className="text-accent">Sage</span>
        </h1>
        <p className="mt-3 md:mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Enter a stock ticker symbol to analyze its candlestick chart using AI, identify patterns, and receive investment recommendations.
        </p>
      </div>
      <StockSearch />
    </main>
  );
}
