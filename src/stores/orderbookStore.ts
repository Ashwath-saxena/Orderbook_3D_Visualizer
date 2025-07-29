import { create } from 'zustand';
import { OrderBookSnapshot, Venue, PressureZone } from '@/lib/types/orderbook';

interface OrderBookStore {
  // Data
  snapshots: OrderBookSnapshot[];
  venues: Venue[];
  pressureZones: PressureZone[];
  
  // UI State
  isRotating: boolean;
  showPressureZones: boolean;
  selectedVenues: string[];
  timeRange: string;
  priceRange: [number, number] | null;
  quantityThreshold: number;
  
  // Actions
  addSnapshot: (snapshot: OrderBookSnapshot) => void;
  toggleRotation: () => void;
  togglePressureZones: () => void;
  toggleVenue: (venueId: string) => void;
  setTimeRange: (range: string) => void;
  setPriceRange: (range: [number, number] | null) => void;
  setQuantityThreshold: (threshold: number) => void;
  updatePressureZones: (zones: PressureZone[]) => void;
}

export const useOrderBookStore = create<OrderBookStore>((set) => ({
  // Initial state
  snapshots: [],
  venues: [
    { 
      id: 'binance', 
      name: 'Binance', 
      color: '#f59e0b', 
      enabled: true, 
      websocketUrl: 'wss://stream.binance.com:9443/ws', 
      restUrl: 'https://api.binance.com/api/v3' 
    },
    { 
      id: 'okx', 
      name: 'OKX', 
      color: '#3b82f6', 
      enabled: true, 
      websocketUrl: 'wss://ws.okx.com:8443/ws/v5/public', 
      restUrl: 'https://www.okx.com/api/v5' 
    },
    { 
      id: 'bybit', 
      name: 'Bybit', 
      color: '#8b5cf6', 
      enabled: true, 
      websocketUrl: 'wss://stream.bybit.com/v5/public/spot', 
      restUrl: 'https://api.bybit.com/v5' 
    },
  ],
  pressureZones: [],
  isRotating: true,
  showPressureZones: false,
  selectedVenues: ['binance', 'okx', 'bybit'], // Enable all real venues
  timeRange: '5m',
  priceRange: null,
  quantityThreshold: 0,

  // Actions
  addSnapshot: (snapshot) => set((state) => ({
    snapshots: [...state.snapshots.slice(-150), snapshot] // Keep last 150 snapshots for better analysis
  })),

  toggleRotation: () => set((state) => ({
    isRotating: !state.isRotating
  })),

  togglePressureZones: () => set((state) => ({
    showPressureZones: !state.showPressureZones
  })),

  toggleVenue: (venueId) => set((state) => ({
    selectedVenues: state.selectedVenues.includes(venueId)
      ? state.selectedVenues.filter(id => id !== venueId)
      : [...state.selectedVenues, venueId]
  })),

  setTimeRange: (range) => set({ timeRange: range }),
  
  setPriceRange: (range) => set({ priceRange: range }),
  
  setQuantityThreshold: (threshold) => set({ quantityThreshold: threshold }),
  
  updatePressureZones: (zones) => set({ pressureZones: zones }),
}));
