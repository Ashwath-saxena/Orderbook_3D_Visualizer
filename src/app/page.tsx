'use client';

import { useEffect, useState } from 'react';
import { useOrderBookStore } from '@/stores/orderbookStore';
import { RealTimeOrderBookAPI } from '@/lib/api/realTimeAPI';
import { PressureZoneAnalyzer } from '@/lib/utils/pressureZoneAnalysis';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingState from '@/components/ui/LoadingState';

const realTimeAPI = new RealTimeOrderBookAPI();
const pressureAnalyzer = new PressureZoneAnalyzer();

export default function HomePage() {
  const { addSnapshot, snapshots, updatePressureZones, selectedVenues, pressureZones } = useOrderBookStore();
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: 'connecting' | 'connected' | 'error'}>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('Starting real-time data connections for venues:', selectedVenues);
    
    // Update connection status
    selectedVenues.forEach(venue => {
      setConnectionStatus(prev => ({ ...prev, [venue]: 'connecting' }));
    });

    // Start polling for real-time data
    realTimeAPI.startPolling(
      selectedVenues,
      'BTCUSDT',
      (snapshot) => {
        console.log(`Received real ${snapshot.venue} data:`, {
          timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
          bids: snapshot.bids.length,
          asks: snapshot.asks.length,
          spread: snapshot.spread.toFixed(2)
        });
        
        addSnapshot(snapshot);
        setConnectionStatus(prev => ({ ...prev, [snapshot.venue]: 'connected' }));
        
        if (!isInitialized && snapshots.length > 0) {
          setIsInitialized(true);
        }
      },
      3000 // Poll every 3 seconds for real-time updates
    );

    return () => {
      console.log('Cleaning up API connections');
      realTimeAPI.stopPolling();
    };
  }, [selectedVenues, addSnapshot, snapshots.length, isInitialized]);

  // Analyze pressure zones when data changes
  useEffect(() => {
    if (snapshots.length > 3) { // Lowered threshold
      console.log('🔍 Triggering pressure zone analysis with', snapshots.length, 'snapshots');
      const zones = pressureAnalyzer.analyzePressureZones(snapshots.slice(-20));
      console.log('🎯 Pressure zones generated:', zones);
      updatePressureZones(zones);
    }
  }, [snapshots, updatePressureZones]);

  // Log pressure zones whenever they change
  useEffect(() => {
    console.log('📊 Current pressure zones in store:', pressureZones);
  }, [pressureZones]);

  // Show loading until we have sufficient data
  if (snapshots.length < 2) {
    const statusEntries = Object.entries(connectionStatus);
    const statusText = statusEntries.length > 0 ? 
      `Connecting to ${statusEntries.map(([venue, status]) => `${venue} (${status})`).join(', ')}` :
      'Initializing real-time orderbook connections...';
      
    return <LoadingState message={statusText} />;
  }

  console.log('Rendering with', snapshots.length, 'real-time snapshots from venues:', 
    [...new Set(snapshots.map(s => s.venue))]);

  return (
    <ErrorBoundary>
      <ResponsiveLayout />
      
      {/* Real-Time Status Indicator */}
      <div className="fixed top-4 left-4 z-50 bg-green-900/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm max-w-xs">
        <div className="font-semibold mb-1">🔴 Live Data Active</div>
        <div className="text-green-200 text-xs space-y-1">
          {Object.entries(connectionStatus).map(([venue, status]) => (
            <div key={venue} className="flex justify-between">
              <span className="capitalize">{venue}:</span>
              <span className={`${
                status === 'connected' ? 'text-green-300' : 
                status === 'connecting' ? 'text-yellow-300' : 'text-red-300'
              }`}>
                {status}
              </span>
            </div>
          ))}
          <div className="border-t border-green-700 pt-1 mt-2">
            <div className="text-yellow-300">⚡ Zones: {pressureZones.length}</div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
