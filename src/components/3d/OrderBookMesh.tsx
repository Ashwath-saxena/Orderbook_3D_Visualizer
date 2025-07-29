'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { OrderBookSnapshot } from '@/lib/types/orderbook';
import { useOrderBookStore } from '@/stores/orderbookStore';

interface OrderBookMeshProps {
  data: OrderBookSnapshot[];
  showPressureZones: boolean;
}

export default function OrderBookMesh({ data, showPressureZones }: OrderBookMeshProps) {
  const bidGroupRef = useRef<THREE.Group>(null);
  const askGroupRef = useRef<THREE.Group>(null);
  const { pressureZones } = useOrderBookStore();

  const processedData = useMemo(() => {
    if (!data.length) return { bidBars: [], askBars: [], priceRange: { min: 0, max: 0 }, latestSpread: 0 };

    console.log('🎨 Processing orderbook data:', data.length, 'snapshots');
    console.log('⚡ Available pressure zones:', pressureZones.length);
    
    const bidBars: Array<{
      position: [number, number, number], 
      scale: [number, number, number], 
      price: number, 
      quantity: number,
      venue: string,
      isPressureZone: boolean,
      pressureIntensity: number
    }> = [];
    const askBars: Array<{
      position: [number, number, number], 
      scale: [number, number, number], 
      price: number, 
      quantity: number,
      venue: string,
      isPressureZone: boolean,
      pressureIntensity: number
    }> = [];
    
    // Use recent snapshots with time spacing
    const recentData = data.slice(-8);
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    
    // Create pressure zone lookup with wider tolerance
    const pressureZoneMap = new Map<number, number>();
    pressureZones.forEach(zone => {
      console.log('📍 Mapping pressure zone:', zone);
      const roundedPrice = Math.round(zone.priceLevel / 10) * 10;
      pressureZoneMap.set(roundedPrice, zone.intensity);
    });
    
    console.log('🗺️ Pressure zone map:', Array.from(pressureZoneMap.entries()));
    
    recentData.forEach((snapshot, timeIndex) => {
      const timeOffset = timeIndex * 1.5;

      // Process bid orders (green bars) - left side
      snapshot.bids.slice(0, 20).forEach((bid, index) => {
        const x = -index * 0.4 - 2;
        const baseY = Math.max(bid.quantity * 3, 0.2);
        
        // Check for pressure zone with wider tolerance
        const roundedPrice = Math.round(bid.price / 10) * 10;
        const pressureIntensity = pressureZoneMap.get(roundedPrice) || 0;
        const isPressureZone = pressureIntensity > 0.1;
        
        if (isPressureZone) {
          console.log(`🔥 BID Pressure zone detected: Price ${bid.price} -> Rounded ${roundedPrice}, Intensity: ${pressureIntensity}`);
        }
        
        // Make pressure zones MUCH more visible
        const y = isPressureZone ? baseY * 5 : baseY;
        const z = timeOffset;
        
        bidBars.push({
          position: [x, y / 2, z],
          scale: [isPressureZone ? 0.6 : 0.3, y, isPressureZone ? 0.6 : 0.3],
          price: bid.price,
          quantity: bid.quantity,
          venue: snapshot.venue,
          isPressureZone,
          pressureIntensity
        });
        
        minPrice = Math.min(minPrice, bid.price);
        maxPrice = Math.max(maxPrice, bid.price);
      });

      // Process ask orders (red bars) - right side
      snapshot.asks.slice(0, 20).forEach((ask, index) => {
        const x = index * 0.4 + 2;
        const baseY = Math.max(ask.quantity * 3, 0.2);
        
        // Check for pressure zone with wider tolerance
        const roundedPrice = Math.round(ask.price / 10) * 10;
        const pressureIntensity = pressureZoneMap.get(roundedPrice) || 0;
        const isPressureZone = pressureIntensity > 0.1;
        
        if (isPressureZone) {
          console.log(`🔥 ASK Pressure zone detected: Price ${ask.price} -> Rounded ${roundedPrice}, Intensity: ${pressureIntensity}`);
        }
        
        // Make pressure zones MUCH more visible
        const y = isPressureZone ? baseY * 5 : baseY;
        const z = timeOffset;

        askBars.push({
          position: [x, y / 2, z],
          scale: [isPressureZone ? 0.6 : 0.3, y, isPressureZone ? 0.6 : 0.3],
          price: ask.price,
          quantity: ask.quantity,
          venue: snapshot.venue,
          isPressureZone,
          pressureIntensity
        });
        
        minPrice = Math.min(minPrice, ask.price);
        maxPrice = Math.max(maxPrice, ask.price);
      });
    });

    const latestSpread = data[data.length - 1]?.spread || 0;
    const pressureZoneCount = bidBars.filter(b => b.isPressureZone).length + askBars.filter(a => a.isPressureZone).length;
    
    console.log(`🎯 Generated ${bidBars.length} bid bars and ${askBars.length} ask bars`);
    console.log(`⚡ Pressure zone bars: ${pressureZoneCount}`);

    return { 
      bidBars, 
      askBars, 
      priceRange: { min: minPrice, max: maxPrice },
      latestSpread
    };
  }, [data, pressureZones]);

  // Super obvious colors for pressure zones (FIXED: Only 3 parameters)
  const getVenueColor = (venue: string, side: 'bid' | 'ask', isPressureZone: boolean) => {
    if (!showPressureZones || !isPressureZone) {
      // Normal colors
      const venueColors = {
        binance: { bid: '#22c55e', ask: '#ef4444' },
        okx: { bid: '#16a34a', ask: '#dc2626' },
        bybit: { bid: '#15803d', ask: '#b91c1c' }
      };
      return venueColors[venue as keyof typeof venueColors]?.[side] || 
             (side === 'bid' ? '#22c55e' : '#ef4444');
    }
    
    // BRIGHT colors for pressure zones
    return side === 'bid' ? '#ffff00' : '#ff6600';
  };

  return (
    <group>
      {/* Debug info */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {showPressureZones ? `⚡ PRESSURE ZONES: ${pressureZones.length} zones detected` : 'Pressure zones disabled'}
      </Text>

      {/* Bid orders group (green) */}
      <group ref={bidGroupRef}>
        {processedData.bidBars.map((bar, index) => (
          <group key={`bid-${index}`}>
            <mesh position={bar.position}>
              <boxGeometry args={bar.scale} />
              <meshLambertMaterial 
                color={getVenueColor(bar.venue, 'bid', bar.isPressureZone)}
                transparent 
                opacity={bar.isPressureZone && showPressureZones ? 1.0 : 0.7}
                emissive={bar.isPressureZone && showPressureZones ? new THREE.Color('#ffff00').multiplyScalar(0.3) : undefined}
              />
            </mesh>
            
            {/* Extra bright indicator for pressure zones */}
            {showPressureZones && bar.isPressureZone && (
              <mesh position={[bar.position[0], bar.position[1] + bar.scale[1] / 2 + 0.5, bar.position[2]]}>
                <sphereGeometry args={[0.3]} />
                <meshBasicMaterial color="#ffff00" />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Ask orders group (red) */}
      <group ref={askGroupRef}>
        {processedData.askBars.map((bar, index) => (
          <group key={`ask-${index}`}>
            <mesh position={bar.position}>
              <boxGeometry args={bar.scale} />
              <meshLambertMaterial 
                color={getVenueColor(bar.venue, 'ask', bar.isPressureZone)}
                transparent 
                opacity={bar.isPressureZone && showPressureZones ? 1.0 : 0.7}
                emissive={bar.isPressureZone && showPressureZones ? new THREE.Color('#ff6600').multiplyScalar(0.3) : undefined}
              />
            </mesh>
            
            {/* Extra bright indicator for pressure zones */}
            {showPressureZones && bar.isPressureZone && (
              <mesh position={[bar.position[0], bar.position[1] + bar.scale[1] / 2 + 0.5, bar.position[2]]}>
                <sphereGeometry args={[0.3]} />
                <meshBasicMaterial color="#ff6600" />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Center spread indicator */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
