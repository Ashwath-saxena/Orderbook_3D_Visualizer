'use client';

import { useState } from 'react';
import { useOrderBookStore } from '@/stores/orderbookStore';
import { Play, Pause, Settings, Filter, BarChart3, Zap, Search, Download, Palette } from 'lucide-react';

export default function ControlPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchPrice, setSearchPrice] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const {
    isRotating,
    showPressureZones,
    selectedVenues,
    venues,
    timeRange,
    quantityThreshold,
    toggleRotation,
    togglePressureZones,
    toggleVenue,
    setTimeRange,
    setQuantityThreshold,
    setPriceRange,
    snapshots
  } = useOrderBookStore();

  // Real-time statistics
  const stats = {
    totalVolume: snapshots.reduce((sum, s) => sum + s.bids.reduce((b, bid) => b + bid.quantity, 0), 0),
    avgSpread: snapshots.length > 0 ? snapshots.reduce((sum, s) => sum + s.spread, 0) / snapshots.length : 0,
    priceRange: {
      min: snapshots.length > 0 ? Math.min(...snapshots.flatMap(s => s.bids.map(b => b.price))) : 0,
      max: snapshots.length > 0 ? Math.max(...snapshots.flatMap(s => s.asks.map(a => a.price))) : 0
    }
  };

  const handlePriceSearch = () => {
    const targetPrice = parseFloat(searchPrice);
    if (!isNaN(targetPrice)) {
      const tolerance = targetPrice * 0.01; // 1% tolerance
      setPriceRange([targetPrice - tolerance, targetPrice + tolerance]);
    }
  };

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      snapshots: snapshots.slice(-50),
      settings: { selectedVenues, timeRange, quantityThreshold },
      statistics: stats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orderbook-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed top-4 right-4 z-10">
      {/* Compact Control Bar */}
      <div className={`${theme === 'dark' ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-sm rounded-lg p-3 mb-2 flex items-center gap-2 shadow-lg`}>
        <button
          onClick={toggleRotation}
          className={`p-2 rounded ${isRotating ? 'bg-green-600' : 'bg-gray-600'} text-white transition-colors hover:scale-105`}
          title="Toggle Rotation"
        >
          {isRotating ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <button
          onClick={togglePressureZones}
          className={`p-2 rounded ${showPressureZones ? 'bg-blue-600' : 'bg-gray-600'} text-white transition-colors hover:scale-105`}
          title="Toggle Pressure Zones"
        >
          <Zap size={16} />
        </button>
        
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors hover:scale-105"
          title="Toggle Theme"
        >
          <Palette size={16} />
        </button>
        
        <button
          onClick={exportData}
          className="p-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors hover:scale-105"
          title="Export Data"
        >
          <Download size={16} />
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} text-white transition-colors hover:scale-105`}
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Expanded Control Panel */}
      {isExpanded && (
        <div className={`${theme === 'dark' ? 'bg-black/90 text-white' : 'bg-white/95 text-gray-800'} backdrop-blur-sm rounded-lg p-4 w-80 max-h-96 overflow-y-auto shadow-xl`}>
          
          {/* Real-time Statistics */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">📊 Live Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Total Volume: {stats.totalVolume.toFixed(2)} BTC</div>
              <div>Avg Spread: ${stats.avgSpread.toFixed(2)}</div>
              <div>Price Range: ${stats.priceRange.min.toFixed(0)} - ${stats.priceRange.max.toFixed(0)}</div>
              <div>Active Venues: {selectedVenues.length}</div>
            </div>
          </div>

          {/* Time Range Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <BarChart3 size={16} className="inline mr-1" />
              Time Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['1m', '5m', '15m', '1h', '4h', '1d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded text-sm transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-lg'
                      : theme === 'dark' 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Price Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <Search size={16} className="inline mr-1" />
              Price Level Search
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter price (e.g., 45000)"
                value={searchPrice}
                onChange={(e) => setSearchPrice(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={handlePriceSearch}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Go
              </button>
            </div>
          </div>

          {/* Venue Filters */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <Filter size={16} className="inline mr-1" />
              Trading Venues
            </label>
            <div className="space-y-2">
              {venues.map((venue) => (
                <div key={venue.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-100/10">
                  <div className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2 shadow-sm"
                      style={{ backgroundColor: venue.color }}
                    />
                    <span className="text-sm">{venue.name}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedVenues.includes(venue.id)}
                      onChange={() => toggleVenue(venue.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Threshold */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Quantity Threshold: {quantityThreshold.toFixed(1)} BTC
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={quantityThreshold}
              onChange={(e) => setQuantityThreshold(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setPriceRange(null)}
              className={`w-full p-2 rounded text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reset Price Filter
            </button>
            
            <button
              onClick={togglePressureZones}
              className={`w-full p-2 rounded text-sm transition-colors ${
                showPressureZones
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showPressureZones ? 'Hide' : 'Show'} Pressure Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
