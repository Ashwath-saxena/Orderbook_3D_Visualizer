// 'use client';

// import { useRef, useMemo } from 'react';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
// import { Text } from '@react-three/drei';

// interface PressureZoneAnimationsProps {
//   zones: Array<{
//     price: number;
//     intensity: number;
//     type: 'support' | 'resistance';
//     volume: number;
//   }>;
//   showPressureZones: boolean;
// }

// export default function PressureZoneAnimations({ zones, showPressureZones }: PressureZoneAnimationsProps) {
//   const groupRef = useRef<THREE.Group>(null);
//   const pulseRef = useRef<THREE.Mesh[]>([]);

//   // Animate pressure zones
//   useFrame((state) => {
//     if (!showPressureZones || !groupRef.current) return;

//     const time = state.clock.elapsedTime;
    
//     // Pulse animation for high-intensity zones
//     pulseRef.current.forEach((mesh, index) => {
//       if (mesh) {
//         const zone = zones[index];
//         if (zone && zone.intensity > 0.6) {
//           const pulse = 1 + Math.sin(time * 3 + index) * 0.3 * zone.intensity;
//           mesh.scale.setScalar(pulse);
          
//           // Color cycling for ultra-high intensity zones
//           if (zone.intensity > 0.8) {
//             const hue = (time * 0.5 + index * 0.2) % 1;
//             (mesh.material as THREE.MeshBasicMaterial).color.setHSL(hue, 0.8, 0.6);
//           }
//         }
//       }
//     });

//     // Rotate pressure zone indicators
//     if (groupRef.current) {
//       groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
//     }
//   });

//   const zoneElements = useMemo(() => {
//     return zones.map((zone, index) => {
//       const x = zone.type === 'support' ? -12 : 12;
//       const y = 2 + index * 2;
//       const z = index * 1.5;

//       return (
//         <group key={`zone-${index}`} position={[x, y, z]}>
//           {/* Main pressure indicator */}
//           <mesh
//             ref={(el) => { if (el) pulseRef.current[index] = el; }}
//             position={[0, 0, 0]}
//           >
//             <torusGeometry args={[0.8, 0.2, 8, 16]} />
//             <meshBasicMaterial 
//               color={zone.intensity > 0.7 ? '#fbbf24' : zone.type === 'support' ? '#22c55e' : '#ef4444'}
//               transparent
//               opacity={0.8}
//             />
//           </mesh>

//           {/* Intensity bars */}
//           {Array.from({ length: Math.ceil(zone.intensity * 5) }, (_, i) => (
//             <mesh key={i} position={[0, 0.3 + i * 0.2, 0]}>
//               <boxGeometry args={[0.1, 0.15, 0.1]} />
//               <meshBasicMaterial 
//                 color={zone.intensity > 0.7 ? '#fbbf24' : zone.type === 'support' ? '#22c55e' : '#ef4444'}
//                 transparent
//                 opacity={0.7 - i * 0.1}
//               />
//             </mesh>
//           ))}

//           {/* Zone information */}
//           <Text
//             position={[zone.type === 'support' ? 1.5 : -1.5, 0, 0]}
//             fontSize={0.25}
//             color={zone.intensity > 0.7 ? '#fbbf24' : zone.type === 'support' ? '#22c55e' : '#ef4444'}
//             anchorX={zone.type === 'support' ? 'left' : 'right'}
//             anchorY="middle"
//           >
//             {`${zone.type.toUpperCase()}\n$${zone.price.toFixed(0)}\n${(zone.intensity * 100).toFixed(0)}%\n${zone.volume.toFixed(1)} BTC`}
//           </Text>
//         </group>
//       );
//     });
//   }, [zones]);

//   if (!showPressureZones) return null;

//   return (
//     <group ref={groupRef}>
//       {zoneElements}
      
//       {/* Central pressure analysis display */}
//       <Text
//         position={[0, 10, 0]}
//         fontSize={0.4}
//         color="#fbbf24"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {`⚡ PRESSURE ANALYSIS ACTIVE`}
//       </Text>
      
//       <Text
//         position={[0, 9, 0]}
//         fontSize={0.3}
//         color="#94a3b8"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {`${zones.length} Zones • ${zones.filter(z => z.intensity > 0.7).length} Critical`}
//       </Text>
//     </group>
//   );
// }


'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { PressureZone } from '@/lib/types/orderbook'; // Use the existing type

interface PressureZoneAnimationsProps {
  zones: PressureZone[]; // Use the existing PressureZone type
}

export default function PressureZoneAnimations({ zones }: PressureZoneAnimationsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulsatingRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();

    pulsatingRefs.current.forEach((mesh, idx) => {
      if (mesh && zones[idx]) {
        const scale = 1 + 0.3 * Math.sin(time * 3 + idx);
        mesh.scale.set(scale, scale, scale);
        // Change color based on intensity
        if (zones[idx].intensity > 0.7) {
          const hue = (time * 0.5 + idx * 0.5) % 1;
          const color = new THREE.Color().setHSL(hue, 1, 0.6);
          (mesh.material as THREE.MeshStandardMaterial).emissive = color;
        }
      }
    });

    groupRef.current.rotation.y = time * 0.1;
  });

  return (
    <group ref={groupRef}>
      {zones.map((zone, idx) => (
        <group key={idx} position={[0, zone.intensity * 6, idx * 2]}>
          <mesh 
            ref={(el) => (pulsatingRefs.current[idx] = el)}
            position={[zone.type === 'support' ? -12 : 12, 0, 0]}>
            <torusGeometry args={[0.8, 0.2, 16, 60]} />
            <meshStandardMaterial 
              color={zone.type === 'support' ? '#22c55e' : '#ef4444'}
              emissive={new THREE.Color(zone.type === 'support' ? '#22c55e' : '#ef4444')}
              emissiveIntensity={0.7}
              metalness={0.1}
              roughness={0.5}
            />
          </mesh>
          <Text 
            position={[zone.type === 'support' ? -10 : 10, 1, 0]}
            fontSize={0.3}
            color={zone.type === 'support' ? '#22c55e' : '#ef4444'}
            anchorX={zone.type === 'support' ? 'left' : 'right'}
            anchorY='middle'
          >
            {`${zone.type.toUpperCase()}\n$${zone.priceLevel.toFixed(2)}\nIntensity: ${Math.round(zone.intensity * 100)}%`}
          </Text>
        </group>
      ))}
    </group>
  );
}
