'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import type { FeatureGroup as LeafletFeatureGroup, LatLng } from 'leaflet';
import L from 'leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Denmark bounds
const DENMARK_BOUNDS: [[number, number], [number, number]] = [
  [54.5, 8.0], // SW corner
  [57.8, 15.2], // NE corner
];

const DENMARK_CENTER: [number, number] = [55.7, 10.5];

interface RoofMapContentProps {
  latitude?: number;
  longitude?: number;
  roofAreaM2: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAreaChange: (areaM2: number) => void;
}

// Calculate polygon area in square meters using the Shoelace formula
// with latitude correction for projection
function calculatePolygonAreaM2(latlngs: LatLng[]): number {
  if (latlngs.length < 3) return 0;

  // Close the polygon if not already closed
  const coords = [...latlngs];
  if (
    coords[0].lat !== coords[coords.length - 1].lat ||
    coords[0].lng !== coords[coords.length - 1].lng
  ) {
    coords.push(coords[0]);
  }

  // Convert lat/lng to approximate meters using equirectangular projection
  // This is accurate enough for small areas like roofs
  const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
  const latRad = (avgLat * Math.PI) / 180;
  const metersPerDegreeLat = 111320; // Meters per degree latitude
  const metersPerDegreeLng = 111320 * Math.cos(latRad); // Corrected for latitude

  // Convert to local meter coordinates
  const baseLat = coords[0].lat;
  const baseLng = coords[0].lng;
  const meterCoords = coords.map((c) => ({
    x: (c.lng - baseLng) * metersPerDegreeLng,
    y: (c.lat - baseLat) * metersPerDegreeLat,
  }));

  // Shoelace formula for polygon area
  let area = 0;
  for (let i = 0; i < meterCoords.length - 1; i++) {
    area += meterCoords[i].x * meterCoords[i + 1].y;
    area -= meterCoords[i + 1].x * meterCoords[i].y;
  }
  area = Math.abs(area) / 2;

  return Math.round(area * 10) / 10; // Round to 1 decimal
}

// Component to handle map click events
function LocationMarker({
  position,
  onLocationChange,
}: {
  position: [number, number] | null;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(position);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onLocationChange(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      setMarkerPosition(position);
    }
  }, [position]);

  return markerPosition ? <Marker position={markerPosition} /> : null;
}

export function RoofMapContent({
  latitude,
  longitude,
  onLocationChange,
  onAreaChange,
}: RoofMapContentProps) {
  const featureGroupRef = useRef<LeafletFeatureGroup | null>(null);
  const [hasDrawnPolygon, setHasDrawnPolygon] = useState(false);

  // Initial position - use provided coords or Denmark center
  const initialPosition: [number, number] =
    latitude && longitude ? [latitude, longitude] : DENMARK_CENTER;

  // Memoize the location change handler
  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      onLocationChange(lat, lng);
    },
    [onLocationChange]
  );

  // Handle polygon creation
  const handleCreated = useCallback(
    (e: { layerType: string; layer: L.Layer }) => {
      if (e.layerType === 'polygon') {
        const layer = e.layer as L.Polygon;
        const latlngs = layer.getLatLngs()[0] as LatLng[];
        const area = calculatePolygonAreaM2(latlngs);
        onAreaChange(area);
        setHasDrawnPolygon(true);

        // Also update location to polygon center
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        handleLocationChange(center.lat, center.lng);
      }
    },
    [onAreaChange, handleLocationChange]
  );

  // Handle polygon edit
  const handleEdited = useCallback(
    (e: { layers: L.LayerGroup }) => {
      e.layers.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const latlngs = layer.getLatLngs()[0] as LatLng[];
          const area = calculatePolygonAreaM2(latlngs);
          onAreaChange(area);
        }
      });
    },
    [onAreaChange]
  );

  // Handle polygon delete
  const handleDeleted = useCallback(() => {
    setHasDrawnPolygon(false);
    // Don't reset area - user may want to keep manual input
  }, []);

  return (
    <MapContainer
      center={initialPosition}
      zoom={latitude && longitude ? 18 : 7}
      maxBounds={DENMARK_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={6}
      maxZoom={19}
      className="h-[300px] w-full rounded-lg z-0"
      style={{ background: 'hsl(var(--muted))' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Location marker - only show if no polygon drawn */}
      {!hasDrawnPolygon && (
        <LocationMarker
          position={latitude && longitude ? [latitude, longitude] : null}
          onLocationChange={handleLocationChange}
        />
      )}

      {/* Drawing controls */}
      <FeatureGroup
        ref={(ref) => {
          featureGroupRef.current = ref as LeafletFeatureGroup | null;
        }}
      >
        <EditControl
          position="topright"
          onCreated={handleCreated}
          onEdited={handleEdited}
          onDeleted={handleDeleted}
          draw={{
            polygon: {
              allowIntersection: false,
              showArea: true,
              shapeOptions: {
                color: 'hsl(222, 55%, 35%)',
                fillColor: 'hsl(222, 55%, 35%)',
                fillOpacity: 0.3,
                weight: 2,
              },
            },
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
          }}
          edit={{
            remove: true,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
}
