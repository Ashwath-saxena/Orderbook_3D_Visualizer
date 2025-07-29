'use client';

import { useMemo } from 'react';
import { OrderBookSnapshot } from '@/lib/types/orderbook';

interface VolumeProfileOverlayProps {
  data: OrderBookSnapshot[];
  showVolumeProfile: boolean;
}

export default function VolumeProfileOverlay({ data, showVolumeProfile }: VolumeProfileOverlayProps) {
  const volumeProfile = useMemo(() => {
    if (!showVolumeProfile || !data.length) return null;

    const volumeByPrice = new Map<number, number>();
    
    // Aggregate volume at each price level
    data.forEach(snapshot => {
      [...snapshot.bids, ...snapshot.asks].forEach(level => {
        const roundedPrice = Math.round(level.price / 10) * 10;
        const currentVolume = volumeByPrice.get(roundedPrice) || 0;
        volumeByPrice.set(roundedPrice, currentVolume + level.quantity);
      });
    });

    // Convert to array and sort by price
    const sortedProfile = Array.from(volumeByPrice.entries())
      .sort(([a], [b]) => a - b)
      .slice(0, 30); // Show top 30 price levels

    const maxVolume = Math.max(...sortedProfile.map(([, volume]) => volume));

    return sortedProfile.map(([price, volume], index) => ({
      price,
      volume,
      normalizedVolume: volume / maxVolume,
      position: index - 15 // Center around 0
    }));
  }, [data, showVolumeProfile]);

  if (!showVolumeProfile || !volumeProfile) return null;

  return (
    <group position={[0, 0, -5]}>
      {volumeProfile.map((profile, index) => (
        <mesh key={index} position={[profile.position * 0.5, profile.normalizedVolume * 3, 0]}>
          <boxGeometry args={[0.4, profile.normalizedVolume * 6, 0.2]} />
          <meshLambertMaterial 
            color={`hsl(${240 + profile.normalizedVolume * 120}, 70%, 60%)`}
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Volume profile background plane */}
      <mesh position={[0, 3, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 6]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
