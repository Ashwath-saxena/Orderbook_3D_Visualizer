import { OrderBookSnapshot } from '../types/orderbook';

export class RealTimeOrderBookAPI {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

  async fetchOrderBook(venue: string, symbol: string = 'BTCUSDT'): Promise<OrderBookSnapshot> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${venue}/orderbook?symbol=${symbol}&limit=100`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: OrderBookSnapshot = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${venue} orderbook:`, error);
      throw error;
    }
  }

  startPolling(
    venues: string[],
    symbol: string,
    onSnapshot: (snapshot: OrderBookSnapshot) => void,
    intervalMs: number = 2000
  ): void {
    venues.forEach(venueId => {  // Fixed: renamed 'venue' to 'venueId' to avoid unused variable warning
      // Clear existing interval if any
      if (this.pollingIntervals.has(venueId)) {
        clearInterval(this.pollingIntervals.get(venueId)!);
      }

      // Fetch initial data immediately
      this.fetchOrderBook(venueId, symbol)
        .then(snapshot => {
          console.log(`Initial ${venueId} data received:`, {
            bids: snapshot.bids.length,
            asks: snapshot.asks.length,
            spread: snapshot.spread.toFixed(2)
          });
          onSnapshot(snapshot);
        })
        .catch(error => {
          console.error(`Failed to fetch initial ${venueId} data:`, error);
        });

      // Set up polling interval
      const intervalId = setInterval(async () => {
        try {
          const snapshot = await this.fetchOrderBook(venueId, symbol);
          onSnapshot(snapshot);
        } catch (error) {
          console.error(`Polling error for ${venueId}:`, error);
        }
      }, intervalMs);

      this.pollingIntervals.set(venueId, intervalId);
    });
  }

  stopPolling(venue?: string): void {
    if (venue) {
      const intervalId = this.pollingIntervals.get(venue);
      if (intervalId) {
        clearInterval(intervalId);
        this.pollingIntervals.delete(venue);
      }
    } else {
      // Stop all polling
      this.pollingIntervals.forEach((intervalId) => {  // Fixed: removed unused venue parameter
        clearInterval(intervalId);
      });
      this.pollingIntervals.clear();
    }
  }

  getActiveConnections(): string[] {
    return Array.from(this.pollingIntervals.keys());
  }
}
