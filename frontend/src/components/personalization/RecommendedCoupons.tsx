'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Ticket,
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Award,
} from 'lucide-react';

interface RecommendedCoupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string | null;
  type: string;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  branches: {
    name: string;
    city: string;
  }[];
  score: number;
}

interface Props {
  onViewCoupon?: (couponId: string) => void;
}

export default function RecommendedCoupons({ onViewCoupon }: Props) {
  const [coupons, setCoupons] = useState<RecommendedCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // Intentar obtener la ubicación del usuario para mejorar las recomendaciones
        let latParam = '';
        let lngParam = '';
        if (typeof window !== 'undefined' && navigator.geolocation) {
          try {
            const pos = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 3000,
                });
              },
            );
            latParam = `&lat=${pos.coords.latitude}`;
            lngParam = `&lng=${pos.coords.longitude}`;
          } catch {
            // Sin ubicación, continuar sin parámetros geográficos
          }
        }

        const res = await fetch(
          `http://localhost:3001/personalization/recommendations?${latParam}${lngParam}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCoupons(data as RecommendedCoupon[]);
          }
        }
      } catch {
        // Silencioso — las recomendaciones son opcionales
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleToggleFavorite = async (couponId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await fetch(
        `http://localhost:3001/personalization/favorite/coupon/${couponId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch {
      // Silencioso
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-zinc-950">
        <div className="h-5 w-48 rounded-xl bg-gray-200 dark:bg-zinc-800 mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 w-56 shrink-0 rounded-2xl bg-gray-100 dark:bg-zinc-900"
            />
          ))}
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return null; // No mostrar la sección si no hay recomendaciones
  }

  const maxScroll = Math.max(0, coupons.length - 3);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-2 text-white shadow-lg shadow-amber-400/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-800 dark:text-zinc-100">
              Recomendado para ti
            </h2>
            <p className="text-[11px] text-gray-400">
              Cupones seleccionados según tus preferencias y ubicación
            </p>
          </div>
        </div>

        {/* Controles de Scroll */}
        {coupons.length > 3 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
              disabled={scrollIndex === 0}
              className="rounded-xl border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-800 dark:hover:bg-zinc-900 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setScrollIndex(Math.min(maxScroll, scrollIndex + 1))
              }
              disabled={scrollIndex >= maxScroll}
              className="rounded-xl border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-800 dark:hover:bg-zinc-900 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Carrusel de Cupones */}
      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${scrollIndex * 240}px)` }}
        >
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="group relative w-56 shrink-0 overflow-hidden rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-[#1d0b30] via-[#121630] to-[#0d1c3a] text-white shadow-md hover:shadow-xl hover:border-rose-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => onViewCoupon?.(coupon.id)}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-teal-400 shrink-0" />

              {/* Imagen / Placeholder */}
              <div className="relative h-28 w-full bg-gradient-to-tr from-violet-900/40 via-purple-900/30 to-indigo-900/40 overflow-hidden border-b border-white/10">
                {coupon.imageUrl ? (
                  <img
                    src={coupon.imageUrl}
                    alt={coupon.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Ticket className="absolute inset-0 m-auto h-8 w-8 text-rose-400/50" />
                )}

                {/* Badge de Descuento */}
                <div className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md border border-white/20">
                  {coupon.discount}
                </div>

                {/* Botón de Favorito */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleToggleFavorite(coupon.id);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-white/10 p-1.5 text-zinc-300 hover:text-pink-500 backdrop-blur-md transition shadow-sm border border-white/20"
                >
                  <Heart className="h-3.5 w-3.5" />
                </button>

                {/* Score Indicator */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 backdrop-blur-sm">
                  <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                  <span className="text-[9px] font-bold text-white">
                    {coupon.score}pts
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-3 space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-400/30 inline-block">
                  {coupon.category.name}
                </span>
                <h3 className="text-xs font-black leading-snug text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                  {coupon.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-bold">
                  <Award className="h-3 w-3 text-rose-400" />
                  <span className="truncate">{coupon.company.name}</span>
                </div>
                {coupon.branches.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <MapPin className="h-3 w-3 text-teal-400" />
                    <span className="truncate">{coupon.branches[0].city}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
