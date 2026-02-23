import { Injectable, signal } from '@angular/core';
import { MarketQuote, MarketIndex, Watchlist, OHLCVData } from '../models';
import { MOCK_QUOTES, MOCK_INDICES, MOCK_WATCHLISTS, generateOHLCV } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class MarketService {
  quotes = signal<MarketQuote[]>(MOCK_QUOTES);
  indices = signal<MarketIndex[]>(MOCK_INDICES);
  watchlists = signal<Watchlist[]>(MOCK_WATCHLISTS);
  exchangeFilter = signal<string>('all');
  private wsSimulation: any;

  getQuote(symbol: string): MarketQuote | undefined {
    return this.quotes().find(q => q.symbol === symbol);
  }

  getOHLCV(symbol: string, days: number = 60): OHLCVData[] {
    return generateOHLCV(symbol, days);
  }

  getQuotesByExchange(exchange: string): MarketQuote[] {
    return this.quotes().filter(q => q.exchange === exchange);
  }

  getQuotesBySymbols(symbols: string[]): MarketQuote[] {
    return this.quotes().filter(q => symbols.includes(q.symbol));
  }

  // Simulate WebSocket updates
  startRealtimeSimulation(): void {
    this.wsSimulation = setInterval(() => {
      const updated = this.quotes().map(q => {
        if (Math.random() > 0.6) return q;
        const changeAmt = Math.round((Math.random() - 0.5) * q.refPrice * 0.005);
        const newPrice = Math.min(q.ceilingPrice, Math.max(q.floorPrice, q.currentPrice + changeAmt));
        const change = newPrice - q.refPrice;
        const changePct = (change / q.refPrice) * 100;
        return { ...q, currentPrice: newPrice, change, changePct: Math.round(changePct * 100) / 100, volume: q.volume + Math.floor(Math.random() * 50000) };
      });
      this.quotes.set(updated);

      const updatedIndices = this.indices().map(idx => {
        const ch = Math.round((Math.random() - 0.48) * 2 * 100) / 100;
        return { ...idx, value: Math.round((idx.value + ch) * 10) / 10, change: Math.round((idx.change + ch * 0.1) * 10) / 10, changePct: Math.round(((idx.change + ch * 0.1) / idx.value) * 10000) / 100 };
      });
      this.indices.set(updatedIndices);
    }, 3000);
  }

  stopRealtimeSimulation(): void {
    if (this.wsSimulation) clearInterval(this.wsSimulation);
  }
}
