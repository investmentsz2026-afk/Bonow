'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, CheckCircle2, Locate } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

interface InteractiveMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function InteractiveMapPicker({
  initialLat = 19.432608,
  initialLng = -99.133209,
  onLocationSelect,
  readOnly = false,
  height = '360px',
}: InteractiveMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [addressResolved, setAddressResolved] = useState<string | null>(null);
  const [isPicked, setIsPicked] = useState(false);

  useEffect(() => {
    setCoords({ lat: initialLat, lng: initialLng });
  }, [initialLat, initialLng]);

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Leaflet on client side
    const initLeaflet = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Import Leaflet CSS dynamically if not present
      if (!document.getElementById('leaflet-css-link')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-link';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Fix Leaflet default marker icons in Next.js
      const customIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView(
        [coords.lat, coords.lng],
        15,
      );

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        },
      ).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        draggable: !readOnly,
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      if (!readOnly) {
        // Handle map click
        map.on('click', (e: any) => {
          const newLat = Number(e.latlng.lat.toFixed(6));
          const newLng = Number(e.latlng.lng.toFixed(6));
          marker.setLatLng([newLat, newLng]);
          setCoords({ lat: newLat, lng: newLng });
          setIsPicked(true);
          onLocationSelect(newLat, newLng);
        });

        // Handle marker drag
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          const newLat = Number(position.lat.toFixed(6));
          const newLng = Number(position.lng.toFixed(6));
          setCoords({ lat: newLat, lng: newLng });
          setIsPicked(true);
          onLocationSelect(newLat, newLng);
        });
      }
    };

    void initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when coords change externally
  const updateMapPosition = (
    newLat: number,
    newLng: number,
    address?: string,
  ) => {
    setCoords({ lat: newLat, lng: newLng });
    setIsPicked(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 16);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
    }
    if (address) {
      setAddressResolved(address);
    }
    onLocationSelect(newLat, newLng, address);
  };

  // Search address geocoding via OpenStreetMap Nominatim
  const handleGeocodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}`,
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const newLat = Number(parseFloat(first.lat).toFixed(6));
        const newLng = Number(parseFloat(first.lon).toFixed(6));
        updateMapPosition(newLat, newLng, first.display_name);
      } else {
        alert('No se encontraron coordenadas para esta dirección.');
      }
    } catch {
      alert('Error de geolocalización al buscar la dirección.');
    } finally {
      setSearching(false);
    }
  };

  // Use browser Current Location
  const handleUseCurrentLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = Number(pos.coords.latitude.toFixed(6));
          const newLng = Number(pos.coords.longitude.toFixed(6));
          updateMapPosition(newLat, newLng, 'Mi Ubicación Actual');
        },
        () => {
          alert('No se pudo obtener la ubicación GPS actual.');
        },
      );
    }
  };

  return (
    <div className="space-y-3 w-full">
      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <form
            onSubmit={handleGeocodeSearch}
            className="flex-1 flex items-center gap-2 w-full"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar dirección en el mapa (ej. Av. Reforma 222, CDMX)..."
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 pl-9 text-xs text-zinc-900 dark:text-white outline-none focus:border-violet-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 text-xs font-bold hover:bg-zinc-800 transition shrink-0 cursor-pointer"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-1.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 px-3.5 py-2 text-xs font-bold hover:bg-violet-100 transition shrink-0 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Locate className="h-3.5 w-3.5" />
            <span>Mi GPS</span>
          </button>
        </div>
      )}

      {/* Map Container */}
      <div
        className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-zinc-100 dark:bg-zinc-950"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Overlay Indicator Badge */}
        <div className="absolute top-3 left-3 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-violet-600 animate-bounce" />
          <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
            <span>Lat: {coords.lat}</span>, <span>Lng: {coords.lng}</span>
          </div>
          {isPicked && (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Fijado
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] bg-zinc-900/90 text-white text-[10px] font-bold px-4 py-1.5 rounded-full backdrop-blur-md shadow-xl border border-white/10 pointer-events-none flex items-center gap-1.5">
            <FontAwesomeIcon icon={faLightbulb} className="text-amber-400" />
            <span>Haz clic en cualquier punto del mapa para mover el marcador</span>
          </div>
        )}
      </div>

      {addressResolved && (
        <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-violet-600 shrink-0" />
          <span>{addressResolved}</span>
        </p>
      )}
    </div>
  );
}
