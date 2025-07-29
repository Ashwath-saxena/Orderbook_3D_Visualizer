'use client';

import { useState } from 'react';
import { useOrderBookStore } from '@/stores/orderbookStore';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface OrderBookStatsProps {
  mobile?: boolean;
}

export default function OrderBookStats({ mobile = false }: OrderBookStatsProps) {
  const [isCollapsed, setIsCollapsed] = useState(mobile);
  const { snapshots, pressureZones } = useOrderBookStore();

  const latestSnapshot = snapshots[snapshots.length - 1];
  
  if (!latestSnapshot) return null;

  const stats = {
    spread: latestSnapshot.spread.toFixed(2),
    bestBid: latestSnapshot.bids[0]?.price.toFixed(2) || '0',
    bestAsk: latestSnapshot.asks[0]?.price.toFixed(2) || '0',
    bidVolume: latestSnapshot.bids.slice(0, 10).reduce((sum, level) => sum + level.quantity, 0).toFixed(2),
    askVolume: latestSnapshot.asks.slice(0, 10).reduce((sum, level) => sum + level.quantity, 0).toFixed(2),
    pressureZoneCount: pressureZones.length
  };

  if (mobile && isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="w-full bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white flex items-center justify-between"
      >
        <span className="text-sm">Show Stats</span>
        <ChevronUp size={16} />
      </button>
    );
  }

  return (
    <div className={`bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white ${mobile ? 'w-full' : 'w-64'}`}>
      {mobile && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="w-full flex items-center justify-between mb-3 text-sm"
        >
          <span>Orderbook Stats</span>
          <ChevronDown size={16} />
        </button>
      )}
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Spread</span>
          <span className="font-mono">${stats.spread}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <TrendingUp size={14} className="text-green-500 mr-1" />
            <span className="text-gray-400 text-sm">Best Bid</span>
          </div>
          <span className="font-mono text-green-500">${stats.bestBid}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <TrendingDown size={14} className="text-red-500 mr-1" />
            <span className="text-gray-400 text-sm">Best Ask</span>
          </div>
          <span className="font-mono text-red-500">${stats.bestAsk}</span>
        </div>
        
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Bid Volume</span>
            <span className="font-mono text-green-500">{stats.bidVolume}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Ask Volume</span>
            <span className="font-mono text-red-500">{stats.askVolume}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Activity size={14} className="text-yellow-500 mr-1" />
              <span className="text-gray-400 text-sm">Pressure Zones</span>
            </div>
            <span className="font-mono text-yellow-500">{stats.pressureZoneCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
