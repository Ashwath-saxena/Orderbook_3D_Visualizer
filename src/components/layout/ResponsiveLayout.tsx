'use client';

import { useState, useEffect } from 'react';
import { useOrderBookStore } from '@/stores/orderbookStore';
import OrderBookScene from '@/components/3d/OrderBookScene';
import ControlPanel from '@/components/controls/ControlPanel';
import MobileControls from '@/components/controls/MobileControls';
import OrderBookStats from '@/components/orderbook/OrderBookStats';

export default function ResponsiveLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const { snapshots, isRotating, showPressureZones } = useOrderBookStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Main 3D Visualization */}
      <div className="w-full h-full">
        <OrderBookScene
          data={snapshots}
          rotating={isRotating}
          showPressureZones={showPressureZones}
        />
      </div>

      {/* Controls - Desktop vs Mobile */}
      {isMobile ? (
        <MobileControls />
      ) : (
        <ControlPanel />
      )}

      {/* Stats Panel - Hidden on mobile by default */}
      {!isMobile && (
        <div className="fixed bottom-4 left-4 z-10">
          <OrderBookStats />
        </div>
      )}

      {/* Mobile Stats - Collapsible */}
      {isMobile && (
        <div className="fixed bottom-20 left-4 right-4 z-10">
          <OrderBookStats mobile />
        </div>
      )}
    </div>
  );
}
