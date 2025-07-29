import { OrderBookSnapshot, OrderBookLevel } from '../types/orderbook';

interface BinanceDepthResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

interface BinanceDepthStreamData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID in event
  u: number; // Final update ID in event
  b: [string, string][]; // Bids to be updated
  a: [string, string][]; // Asks to be updated
}

export class BinanceAPI {
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsUrl = 'wss://stream.binance.com:9443/ws';
  private ws: WebSocket | null = null;
  private lastUpdateId = 0;

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBookSnapshot> {
    try {
      const response = await fetch(`${this.baseUrl}/depth?symbol=${symbol}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BinanceDepthResponse = await response.json();
      this.lastUpdateId = data.lastUpdateId;

      const bids: OrderBookLevel[] = data.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        cumulativeQuantity: 0,
        orders: 1
      }));

      const asks: OrderBookLevel[] = data.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        cumulativeQuantity: 0,
        orders: 1
      }));

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
        symbol,
        venue: 'binance',
        timestamp: Date.now(),
        bids,
        asks,
        spread: asks[0]?.price - bids[0]?.price || 0
      };
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
      throw error;
    }
  }

  createWebSocketConnection(
    symbol: string, 
    onMessage: (data: OrderBookSnapshot) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const stream = `${symbol.toLowerCase()}@depth@100ms`;
    this.ws = new WebSocket(`${this.wsUrl}/${stream}`);
    
    this.ws.onopen = () => {
      console.log('Binance WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data: BinanceDepthStreamData = JSON.parse(event.data);
        const snapshot = this.transformWebSocketData(data);
        onMessage(snapshot);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Binance WebSocket error:', error);
      if (onError) onError(error);
    };

    this.ws.onclose = (event) => {
      console.log('Binance WebSocket closed:', event.code, event.reason);
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.createWebSocketConnection(symbol, onMessage, onError);
      }, 5000);
    };

    return this.ws;
  }

  private transformWebSocketData(data: BinanceDepthStreamData): OrderBookSnapshot {
    const bids: OrderBookLevel[] = data.b.map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      cumulativeQuantity: 0,
      orders: 1
    }));

    const asks: OrderBookLevel[] = data.a.map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      cumulativeQuantity: 0,
      orders: 1
    }));

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
      symbol: data.s,
      venue: 'binance',
      timestamp: data.E,
      bids,
      asks,
      spread: asks[0]?.price - bids[0]?.price || 0
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
