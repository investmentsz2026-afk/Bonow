'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  Ticket,
  Loader2,
  AlertCircle,
  Filter,
  Locate,
  Building,
} from 'lucide-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faTicketAlt } from '@fortawesome/free-solid-svg-icons';

interface BranchCoupon {
  id: string;
  title: string;
  discount: string;
}

interface Branch {
  id: string;
  name: string;
  companyName: string;
  companyLogo?: string;
  companyPhone?: string;
  address: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  schedules?: string;
  categoryName?: string;
  categoryNames?: string[];
  distance: number;
  couponsCount?: number;
  coupons?: BranchCoupon[];
}

interface Category {
  id: string;
  name: string;
}

export default function MapPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [radius, setRadius] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [hasLocation, setHasLocation] = useState(false);

  // Obtener geolocalización
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setHasLocation(true);
        },
        () => {
          // Si falla, usar fallback CDMX
          setUserLocation({ lat: 19.432608, lng: -99.133209 });
        },
        { timeout: 10000 },
      );
    } else {
      setUserLocation({ lat: 19.432608, lng: -99.133209 });
    }
  }, []);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/coupons/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // Silencioso
      }
    };
    void fetchCategories();
  }, []);

  // Cargar sucursales según filtros
  const fetchMapBranches = async (
    search?: string,
    catId?: string,
    rad?: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (catId) queryParams.append('categoryId', catId);
      if (rad) queryParams.append('radius', rad.toString());
      if (userLocation) {
        queryParams.append('lat', userLocation.lat.toString());
        queryParams.append('lng', userLocation.lng.toString());
      }

      const res = await fetch(
        `${API_URL}/coupons/branches/map?${queryParams.toString()}`,
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al cargar mapa');

      setBranches(data);
      if (data.length > 0) {
        setSelectedBranch(data[0]);
      } else {
        setSelectedBranch(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al conectar con servidor',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      void fetchMapBranches(searchQuery, selectedCategoryId, radius);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, radius]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchMapBranches(searchQuery, selectedCategoryId, radius);
  };

  const handleCategoryFilterChange = (catId: string) => {
    setSelectedCategoryId(catId);
    void fetchMapBranches(searchQuery, catId, radius);
  };

  const handleRadiusChange = (newRad: number) => {
    setRadius(newRad);
  };

  const getGoogleMapsRouteUrl = (b: Branch) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`;
  };

  const getGoogleMapsViewUrl = (b: Branch) => {
    return `https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 text-left">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#0F1E36] via-slate-900 to-[#0F1E36] p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-red-500/20 blur-2xl" />

        <div className="space-y-1 relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-400 shadow-sm">
            <Compass className="h-3.5 w-3.5 animate-spin text-red-400" />
            Explorador GPS en Tiempo Real
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase mt-1">
            Mapa Interactivo de Descuentos & Sucursales
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
            Localiza los comercios asociados más cercanos a tu ubicación y consulta cómo llegar directamente con Google Maps.
          </p>
        </div>

        {/* Selector de Rango */}
        <div className="relative z-10 flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shrink-0 self-start md:self-center backdrop-blur-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block w-full sm:w-auto">
            Distancia:
          </span>
          {[
            { label: '1 km', value: 1 },
            { label: '5 km', value: 5 },
            { label: '10 km', value: 10 },
            { label: '25 km', value: 25 },
            { label: '50 km', value: 50 },
            { label: 'Todo México', value: 5000 },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => handleRadiusChange(r.value)}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition cursor-pointer ${
                radius === r.value
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Filtros: Buscador + Categoría */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white dark:bg-zinc-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por sucursal, comercio o calle..."
            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-zinc-950 px-4 py-3 pl-11 pr-24 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-red-500 transition shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <button
            type="submit"
            className="absolute right-2 top-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-1.5 text-xs font-black uppercase hover:from-red-600 hover:to-rose-700 transition shadow-md shadow-red-500/20 cursor-pointer"
          >
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            className="w-full md:w-64 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-zinc-950 px-4 py-3 text-xs font-black text-slate-800 dark:text-white outline-none cursor-pointer focus:border-teal-500 transition"
          >
            <option value="">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Escaneando sucursales y cargando mapa interactivo...
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Columna Izquierda: Listado de sucursales */}
          <div className="lg:col-span-1 space-y-4 max-h-[620px] overflow-y-auto pr-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sucursales Encontradas ({branches.length})
              </span>
              {hasLocation && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300 font-black shadow-xs">
                  <Locate className="h-3.5 w-3.5 text-emerald-600" />
                  GPS Activo
                </span>
              )}
            </div>

            {branches.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-8 text-center text-slate-500 shadow-sm">
                <MapPin className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold">
                  No se encontraron sucursales para esta categoría o búsqueda.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {branches.map((b) => {
                  const isSelected = selectedBranch?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBranch(b)}
                      className={`rounded-2xl p-4 cursor-pointer transition text-left relative overflow-hidden ${
                        isSelected
                          ? 'border-2 border-red-500 bg-gradient-to-r from-red-50/80 via-white to-orange-50/50 dark:from-red-950/40 dark:to-zinc-900 shadow-lg shadow-red-500/10 ring-2 ring-red-500/20'
                          : 'border-2 border-slate-200/90 bg-white hover:border-red-400/60 dark:border-zinc-800 dark:bg-zinc-900 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {b.companyLogo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={b.companyLogo}
                            alt={b.companyName}
                            className="h-11 w-11 rounded-xl object-cover shrink-0 border-2 border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 dark:bg-red-950/40 border border-red-200">
                            <Building className="h-5 w-5" />
                          </div>
                        )}

                        <div className="space-y-1 text-left flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-black text-xs text-slate-900 dark:text-white leading-tight truncate">
                              {b.name}
                            </h4>
                          </div>
                          <p className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-wider truncate">
                            {b.companyName}
                          </p>

                          <div className="flex flex-wrap gap-1 py-0.5">
                            {(
                              b.categoryNames || [b.categoryName || 'General']
                            ).map((catName, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 px-2 py-0.5 text-[8px] font-black uppercase"
                              >
                                {catName}
                              </span>
                            ))}
                          </div>

                          <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 font-medium flex items-center gap-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> {b.address}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            {b.distance > 0 && (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-black shadow-xs">
                                {b.distance} km de ti
                              </span>
                            )}
                            {b.couponsCount ? (
                              <span className="text-[9px] text-red-600 font-black flex items-center gap-1">
                                <Ticket className="h-3 w-3" />
                                {b.couponsCount} cupones
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Mapa Interactivo Google Maps Embed & Ficha de Sucursal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contenedor del Mapa Interactivo Google Maps */}
            <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-2.5 shadow-2xl overflow-hidden h-[400px] relative">
              {selectedBranch ? (
                <iframe
                  title="Google Maps Interactivo"
                  src={`https://maps.google.com/maps?q=${selectedBranch.latitude},${selectedBranch.longitude}&z=16&output=embed`}
                  className="w-full h-full rounded-2xl border-0"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-xs font-black uppercase tracking-wider">
                  Selecciona una sucursal para ver su ubicación interactiva en Google Maps
                </div>
              )}
            </div>

            {/* Ficha Detallada de la Sucursal Seleccionada */}
            {selectedBranch && (
              <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">
                        {selectedBranch.companyName}
                      </span>
                      {(
                        selectedBranch.categoryNames || [
                          selectedBranch.categoryName || 'General',
                        ]
                      ).map((catName, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 text-[9px] font-black uppercase"
                        >
                          {catName}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {selectedBranch.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> {selectedBranch.address},{' '}
                      {selectedBranch.city || 'CDMX'},{' '}
                      {selectedBranch.state || 'CDMX'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={getGoogleMapsRouteUrl(selectedBranch)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-5 py-2.5 text-xs font-black uppercase text-white hover:from-red-600 hover:to-rose-700 transition shadow-lg shadow-red-500/25"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Cómo Llegar</span>
                    </a>
                    <a
                      href={getGoogleMapsViewUrl(selectedBranch)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Abrir Google Maps</span>
                    </a>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
                  {selectedBranch.schedules && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>Horario: {selectedBranch.schedules}</span>
                    </div>
                  )}

                  {selectedBranch.companyPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Teléfono: {selectedBranch.companyPhone}</span>
                    </div>
                  )}
                </div>

                {selectedBranch.coupons &&
                  selectedBranch.coupons.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-red-500" /> Cupones Activos en esta Sucursal (
                        {selectedBranch.coupons.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedBranch.coupons.map((c) => (
                          <div
                            key={c.id}
                            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-1.5 text-xs font-bold text-red-800 dark:text-red-300"
                          >
                            <span className="font-black text-red-600">
                              {c.discount}:
                            </span>{' '}
                            {c.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
