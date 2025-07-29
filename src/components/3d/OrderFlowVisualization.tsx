'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrderBookSnapshot } from '@/lib/types/orderbook';

interface OrderFlowVisualizationProps {
  data: OrderBookSnapshot[];
  showOrderFlow: boolean;
}

export default function OrderFlowVisualization({ data, showOrderFlow }: OrderFlowVisualizationProps) {
  const flowRef = useRef<THREE.Group>(null);

  // Create flowing particles representing order flow
  const particleSystem = useMemo(() => {
    if (!showOrderFlow || !data.length) return { bidParticles: [], askParticles: [] };

    const bidParticles: number[] = [];
    const askParticles: number[] = [];

    // Generate particles based on recent order changes
    const recent = data.slice(-2);
    if (recent.length === 2) {
      const [prev, curr] = recent;

      // Detect new/changed bid orders
      curr.bids.slice(0, 10).forEach((bid, index) => {
        const prevBid = prev.bids[index];
        if (!prevBid || bid.quantity !== prevBid.quantity) {
          const x = -index * 0.4 - 2;
          const y = Math.random() * 5 + 5;
          const z = Math.random() * 2 - 1;
          bidParticles.push(x, y, z);
        }
      });

      // Detect new/changed ask orders
      curr.asks.slice(0, 10).forEach((ask, index) => {
        const prevAsk = prev.asks[index];
        if (!prevAsk || ask.quantity !== prevAsk.quantity) {
          const x = index * 0.4 + 2;
          const y = Math.random() * 5 + 5;
          const z = Math.random() * 2 - 1;
          askParticles.push(x, y, z);
        }
      });
    }

    return { bidParticles, askParticles };
  }, [data, showOrderFlow]);

  useFrame(() => {
    if (!showOrderFlow || !flowRef.current) return;

    // Add rotation animation to the flow
    flowRef.current.rotation.y += 0.01;
  });

  if (!showOrderFlow || (particleSystem.bidParticles.length === 0 && particleSystem.askParticles.length === 0)) {
    return null;
  }

  return (
    <group ref={flowRef}>
      {/* Bid flow streams */}
      {particleSystem.bidParticles.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(particleSystem.bidParticles), 3]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} color="#22c55e" transparent opacity={0.8} />
        </points>
      )}

      {/* Ask flow streams */}
      {particleSystem.askParticles.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(particleSystem.askParticles), 3]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} color="#ef4444" transparent opacity={0.8} />
        </points>
      )}
    </group>
  );
}
