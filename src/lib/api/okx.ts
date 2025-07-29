import { OrderBookSnapshot, OrderBookLevel } from '../types/orderbook';

interface OKXOrderBookResponse {
  code: string;
  msg: string;
  data: [{
    asks: [string, string, string, string][];
    bids: [string, string, string, string][];
    ts: string;
  }];
}

interface OKXWebSocketData {
  arg: {
    channel: string;
    instId: string;
  };
  data: [{
    asks: [string, string, string, string][];
    bids: [string, string, string, string][];
    ts: string;
  }];
}

export class OKXAPI {
  private baseUrl = 'https://www.okx.com/api/v5';
  private wsUrl = 'wss://ws.okx.com:8443/ws/v5/public';
  private ws: WebSocket | null = null;

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBookSnapshot> {
    try {
      const instId = symbol.replace('USDT', '-USDT'); // Convert BTCUSDT to BTC-USDT
      const response = await fetch(`${this.baseUrl}/market/books?instId=${instId}&sz=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: OKXOrderBookResponse = await response.json();
      
      if (result.code !== '0' || !result.data.length) {
        throw new Error(`OKX API error: ${result.msg}`);
      }

      const data = result.data[0];
      
      const bids: OrderBookLevel[] = data.bids.map(([price, size]) => ({
        price: parseFloat(price),
        quantity: parseFloat(size),
        cumulativeQuantity: 0,
        orders: 1
      }));

      const asks: OrderBookLevel[] = data.asks.map(([price, size]) => ({
        price: parseFloat(price),
        quantity: parseFloat(size),
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
        symbol: symbol,
        venue: 'okx',
        timestamp: parseInt(data.ts),
        bids,
        asks,
        spread: asks[0]?.price - bids[0]?.price || 0
      };
    } catch (error) {
      console.error('Failed to fetch OKX orderbook:', error);
      throw error;
    }
  }

  createWebSocketConnection(
    symbol: string,
    onMessage: (data: OrderBookSnapshot) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const instId = symbol.replace('USDT', '-USDT');
    this.ws = new WebSocket(this.wsUrl);
    
    this.ws.onopen = () => {
      console.log('OKX WebSocket connected');
      // Subscribe to orderbook updates
      const subscribeMsg = {
        op: 'subscribe',
        args: [{
          channel: 'books',
          instId: instId
        }]
      };
      this.ws!.send(JSON.stringify(subscribeMsg));
    };

    this.ws.onmessage = (event) => {
      try {
        const data: OKXWebSocketData = JSON.parse(event.data);
        if (data.data && data.data.length > 0) {
          const snapshot = this.transformWebSocketData(data, symbol);
          onMessage(snapshot);
        }
      } catch (error) {
        console.error('OKX WebSocket message error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('OKX WebSocket error:', error);
      if (onError) onError(error);
    };

    this.ws.onclose = (event) => {
      console.log('OKX WebSocket closed:', event.code, event.reason);
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect to OKX...');
        this.createWebSocketConnection(symbol, onMessage, onError);
      }, 5000);
    };

    return this.ws;
  }

  private transformWebSocketData(data: OKXWebSocketData, symbol: string): OrderBookSnapshot {
    const orderBookData = data.data[0];
    
    const bids: OrderBookLevel[] = orderBookData.bids.map(([price, size]) => ({
      price: parseFloat(price),
      quantity: parseFloat(size),
      cumulativeQuantity: 0,
      orders: 1
    }));

    const asks: OrderBookLevel[] = orderBookData.asks.map(([price, size]) => ({
      price: parseFloat(price),
      quantity: parseFloat(size),
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
      venue: 'okx',
      timestamp: parseInt(orderBookData.ts),
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
