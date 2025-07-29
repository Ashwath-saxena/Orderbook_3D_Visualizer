export interface OrderBookEntry {
  price: number;
  quantity: number;
  timestamp: number;
  venue: string;
  side: 'bid' | 'ask';
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  cumulativeQuantity: number;
  orders: number;
}

export interface OrderBookSnapshot {
  symbol: string;
  venue: string;
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
}

export interface PressureZone {
  priceLevel: number;
  intensity: number;
  volume: number;
  type: 'support' | 'resistance';
}

export interface Venue {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  websocketUrl: string;
  restUrl: string;
}
