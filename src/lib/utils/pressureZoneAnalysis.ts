import { OrderBookSnapshot, PressureZone } from '@/lib/types/orderbook';

export class PressureZoneAnalyzer {
  private volumeThreshold: number;
  private priceClusterThreshold: number;
  
  constructor(volumeThreshold = 50, priceClusterThreshold = 0.001) { // Lowered threshold for better detection
    this.volumeThreshold = volumeThreshold;
    this.priceClusterThreshold = priceClusterThreshold;
  }

  analyzePressureZones(snapshots: OrderBookSnapshot[]): PressureZone[] {
    if (snapshots.length === 0) return [];

    console.log('🔍 Analyzing pressure zones with', snapshots.length, 'snapshots');
    
    const zones: PressureZone[] = [];
    const priceVolumeMap = new Map<number, number>();

    // Aggregate volume at each price level across time
    snapshots.forEach((snapshot, index) => {
      console.log(`📊 Snapshot ${index}: ${snapshot.venue} - Bids: ${snapshot.bids.length}, Asks: ${snapshot.asks.length}`);
      
      [...snapshot.bids, ...snapshot.asks].forEach(level => {
        const roundedPrice = this.roundPrice(level.price);
        const currentVolume = priceVolumeMap.get(roundedPrice) || 0;
        priceVolumeMap.set(roundedPrice, currentVolume + level.quantity);
      });
    });

    console.log('📈 Total unique price levels:', priceVolumeMap.size);
    console.log('🎯 Volume threshold:', this.volumeThreshold);

    // Identify high-volume price levels
    const allVolumeEntries = Array.from(priceVolumeMap.entries());
    console.log('📊 Sample volumes:', allVolumeEntries.slice(0, 10));
    
    const highVolumeZones = allVolumeEntries
      .filter(([_, volume]) => {
        const isHighVolume = volume > this.volumeThreshold;
        if (isHighVolume) {
          console.log(`✅ High volume zone found: Price $${_}, Volume: ${volume.toFixed(2)}`);
        }
        return isHighVolume;
      })
      .sort(([a], [b]) => b - a) // Sort by volume descending
      .slice(0, 15); // Top 15 zones

    console.log('🔥 High volume zones found:', highVolumeZones.length);

    // Calculate pressure intensity and classify zones
    highVolumeZones.forEach(([price, volume]) => {
      const intensity = this.calculateIntensity(price, volume, snapshots);
      const type = this.classifyZone(price, snapshots);

      const zone = {
        priceLevel: price,
        intensity,
        volume,
        type
      };

      console.log(`⚡ Pressure zone created:`, zone);
      zones.push(zone);
    });

    console.log('🎯 Total pressure zones generated:', zones.length);
    return zones;
  }

  private roundPrice(price: number): number {
    // More aggressive rounding for better clustering
    if (price > 10000) return Math.round(price / 10) * 10; // Round to nearest $10
    if (price > 1000) return Math.round(price); // Round to nearest $1
    if (price > 100) return Math.round(price * 10) / 10;
    if (price > 10) return Math.round(price * 100) / 100;
    return Math.round(price * 1000) / 1000;
  }

  private calculateIntensity(price: number, volume: number, snapshots: OrderBookSnapshot[]): number {
    // Calculate intensity based on volume concentration and persistence
    const allVolumes = Array.from(snapshots.flatMap(s => 
      [...s.bids, ...s.asks].map(l => l.quantity)
    ));
    const maxVolume = Math.max(...allVolumes);
    const avgVolume = allVolumes.reduce((sum, vol) => sum + vol, 0) / allVolumes.length;
    
    const volumeRatio = volume / Math.max(maxVolume, avgVolume * 10); // Use larger denominator
    const persistence = this.calculatePersistence(price, snapshots);
    
    const intensity = Math.min(1, volumeRatio * persistence * 2); // Boost intensity
    console.log(`📊 Intensity calculation: Price $${price}, Volume: ${volume.toFixed(2)}, Ratio: ${volumeRatio.toFixed(3)}, Persistence: ${persistence.toFixed(3)}, Final: ${intensity.toFixed(3)}`);
    
    return intensity;
  }

  private calculatePersistence(price: number, snapshots: OrderBookSnapshot[]): number {
    // Calculate how consistently this price level appears
    let appearances = 0;
    const tolerance = price * this.priceClusterThreshold;

    snapshots.forEach(snapshot => {
      const hasLevel = [...snapshot.bids, ...snapshot.asks].some(level => 
        Math.abs(level.price - price) <= tolerance
      );
      if (hasLevel) appearances++;
    });

    return appearances / snapshots.length;
  }

  private classifyZone(price: number, snapshots: OrderBookSnapshot[]): 'support' | 'resistance' {
    // Simple classification based on current market price
    const latestSnapshot = snapshots[snapshots.length - 1];
    if (!latestSnapshot) return 'support';

    const midPrice = (latestSnapshot.bids[0]?.price + latestSnapshot.asks[0]?.price) / 2;
    return price < midPrice ? 'support' : 'resistance';
  }
}
