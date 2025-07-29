import { OrderBookSnapshot, OrderBookLevel } from '@/lib/types/orderbook';

export class MockDataProvider {
  private intervalId: number | null = null;

  generateMockSnapshot(): OrderBookSnapshot {
    const basePrice = 45000 + (Math.random() - 0.5) * 1000; // BTC price around $45k
    
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    // Generate bid levels (below market price)
    for (let i = 0; i < 20; i++) {
      const price = basePrice - (i + 1) * (10 + Math.random() * 20);
      const quantity = Math.random() * 5 + 0.1;
      bids.push({
        price,
        quantity,
        cumulativeQuantity: 0, // Will be calculated
        orders: Math.floor(Math.random() * 10) + 1
      });
    }

    // Generate ask levels (above market price)
    for (let i = 0; i < 20; i++) {
      const price = basePrice + (i + 1) * (10 + Math.random() * 20);
      const quantity = Math.random() * 5 + 0.1;
      asks.push({
        price,
        quantity,
        cumulativeQuantity: 0, // Will be calculated
        orders: Math.floor(Math.random() * 10) + 1
      });
    }

    // Calculate cumulative quantities
    let cumBid = 0;
    bids.forEach(level => {
      cumBid += level.quantity;
      level.cumulativeQuantity = cumBid;
    });

    let cumAsk = 0;
    asks.forEach(level => {
      cumAsk += level.quantity;
      level.cumulativeQuantity = cumAsk;
    });

    return {
      symbol: 'BTCUSDT',
      venue: 'mock',
      timestamp: Date.now(),
      bids,
      asks,
      spread: asks[0].price - bids[0].price
    };
  }

  startMockStream(onSnapshot: (snapshot: OrderBookSnapshot) => void): void {
    // Generate initial snapshots
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        onSnapshot(this.generateMockSnapshot());
      }, i * 100);
    }

    // Continue generating data every 2 seconds
    this.intervalId = window.setInterval(() => {
      onSnapshot(this.generateMockSnapshot());
    }, 2000);
  }

  stopMockStream(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
