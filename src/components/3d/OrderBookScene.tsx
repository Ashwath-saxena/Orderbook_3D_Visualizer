'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, Sparkles } from '@react-three/drei';
import { Suspense } from 'react';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import OrderBookMesh from './OrderBookMesh';
import PressureZoneAnimations from './PressureZoneAnimations';
import OrderFlowVisualization from './OrderFlowVisualization';
import VolumeProfileOverlay from './VolumeProfileOverlay';
import { OrderBookSnapshot } from '@/lib/types/orderbook';
import { useOrderBookStore } from '@/stores/orderbookStore';

interface OrderBookSceneProps {
  data: OrderBookSnapshot[];
  rotating: boolean;
  showPressureZones: boolean;
}

export default function OrderBookScene({ data, rotating, showPressureZones }: OrderBookSceneProps) {
  const { pressureZones } = useOrderBookStore();
  
  return (
    <div className="w-full h-full relative">
      {/* Debug info */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 text-white p-2 rounded">
        <div className="text-xs">
          <div>Snapshots: {data.length}</div>
          <div>Rotating: {rotating ? 'ON' : 'OFF'}</div>
          <div>Pressure Zones: {showPressureZones ? 'ON' : 'OFF'}</div>
          {data.length > 0 && (
            <div>Latest: {new Date(data[data.length - 1].timestamp).toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={60} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={rotating}
          autoRotateSpeed={1.5}
          maxDistance={50}
          minDistance={5}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.1}
        />
        
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[20, 20, 10]} 
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-15, 10, -15]} intensity={1} color="#3b82f6" />
        <pointLight position={[15, 10, 15]} intensity={1} color="#f59e0b" />
        <spotLight 
          position={[0, 25, 0]} 
          intensity={2}
          angle={0.3}
          penumbra={0.5}
          color="#ffffff"
          castShadow
        />

        {/* Environment and Atmosphere */}
        <Environment preset="night" />
        <fog args={['#0a0a0a', 20, 80]} />
        
        {/* Sparkles for magical effect */}
        <Sparkles 
          count={100}
          scale={[30, 20, 30]}
          size={2}
          speed={0.4}
          opacity={0.6}
          color="#64748b"
        />

        {/* Enhanced Grid */}
        <Grid 
          args={[30, 30]} 
          position={[0, -0.1, 0]} 
          cellColor="#334155"
          sectionColor="#475569"
          fadeDistance={40}
          fadeStrength={0.5}
        />

        <Suspense fallback={null}>
          <OrderBookMesh 
            data={data} 
            showPressureZones={showPressureZones}
          />
          
          {/* Enhanced pressure zone animations */}
          {showPressureZones && (
            <PressureZoneAnimations zones={pressureZones} />
          )}
          
          {/* Order flow visualization */}
          <OrderFlowVisualization 
            data={data} 
            showOrderFlow={true}
          />
          
          {/* Volume profile overlay */}
          <VolumeProfileOverlay 
            data={data} 
            showVolumeProfile={true}
          />
        </Suspense>

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom 
            intensity={0.3}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            height={300}
          />
          <ChromaticAberration offset={[0.0002, 0.0005]} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
