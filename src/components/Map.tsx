"use client";

import { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

const osmStyle: any = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export default function ScapeMap({ spots, onSpotClick, selectedSpot }: any) {
  const [viewState, setViewState] = useState({
    longitude: 151.2093,
    latitude: -33.8688,
    zoom: 10.5
  });

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={osmStyle}
        mapLib={maplibregl}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        
        {spots.map((spot: any) => (
          <Marker 
            key={spot.id} 
            longitude={spot.longitude} 
            latitude={spot.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              onSpotClick(spot);
            }}
          >
            <MapPin 
              color={selectedSpot?.id === spot.id ? "var(--light-green)" : "var(--primary-dark-green)"} 
              fill={selectedSpot?.id === spot.id ? "white" : "white"} 
              size={selectedSpot?.id === spot.id ? 40 : 32} 
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} 
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
