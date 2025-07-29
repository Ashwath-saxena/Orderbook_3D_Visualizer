'use client';

import { useState } from 'react';
import { useOrderBookStore } from '@/stores/orderbookStore';
import { 
  Play, 
  Pause, 
  Settings, 
  Zap, 
  ChevronUp, 
  ChevronDown,
  Filter,
  BarChart3 
} from 'lucide-react';

type TabType = 'controls' | 'filters' | 'venues';

export default function MobileControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('controls');
  
  const {
    isRotating,
    showPressureZones,
    selectedVenues,
    venues,
    timeRange,
    toggleRotation,
    togglePressureZones,
    toggleVenue,
    setTimeRange
  } = useOrderBookStore();

  return (
    <>
      {/* Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-700 z-20">
        {/* Quick Actions */}
        <div className="flex items-center justify-around p-3">
          <button
            onClick={toggleRotation}
            className={`flex flex-col items-center p-2 rounded ${
              isRotating ? 'bg-green-600' : 'bg-gray-600'
            } text-white transition-colors`}
          >
            {isRotating ? <Pause size={20} /> : <Play size={20} />}
            <span className="text-xs mt-1">Rotate</span>
          </button>
          
          <button
            onClick={togglePressureZones}
            className={`flex flex-col items-center p-2 rounded ${
              showPressureZones ? 'bg-blue-600' : 'bg-gray-600'
            } text-white transition-colors`}
          >
            <Zap size={20} />
            <span className="text-xs mt-1">Zones</span>
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center p-2 rounded bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          >
            <Settings size={20} />
            <span className="text-xs mt-1">More</span>
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="border-t border-gray-700">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              {[
                { id: 'controls' as TabType, label: 'Controls', icon: BarChart3 },
                { id: 'filters' as TabType, label: 'Filters', icon: Filter },
                { id: 'venues' as TabType, label: 'Venues', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center p-3 ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  } transition-colors`}
                >
                  <Icon size={16} className="mr-1" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {activeTab === 'controls' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Time Range
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1m', '5m', '15m', '1h'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`p-2 rounded text-sm ${
                            timeRange === range
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300'
                          } transition-colors`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'venues' && (
                <div className="space-y-3">
                  {venues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: venue.color }}
                        />
                        <span className="text-white text-sm">{venue.name}</span>
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
              )}
            </div>
          </div>
        )}
      </div>

      {/* Touch gesture hints */}
      {!isExpanded && (
        <div className="fixed top-4 left-4 bg-black/60 backdrop-blur-sm rounded p-2 z-10">
          <p className="text-white text-xs">
            Pinch to zoom • Drag to rotate • Two fingers to pan
          </p>
        </div>
      )}
    </>
  );
}
