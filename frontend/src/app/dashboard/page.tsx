'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Heart,
  TrendingUp,
  Loader2,
  Calendar,
  ChevronRight,
  Star,
  MapPin,
  Map,
  Share2,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Sparkles as Sparkle,
  Dumbbell,
  Film,
  HeartPulse,
  ShoppingBag,
  Plane,
  Tag,
  Plus,
  Building2,
  Megaphone,
  Gift,
  ExternalLink,
  Flame,
  Percent,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  accumulatedSavings: string;
  roles?: { name: string }[];
  company?: { id: string; name: string; logoUrl: string | null } | null;
  _count: {
    redemptions: number;
    favorites: number;
  };
  membership: {
    status: string;
    type: string;
    endDate: string;
  } | null;
}

interface RealCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  discountValue: string;
  endDate: string;
  type: string;
  code?: string;
  company?: {
    name: string;
    logoUrl?: string;
  };
}

interface AdPromotion {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  companyName?: string;
  companyLogoUrl?: string;
  company?: {
    name: string;
    logoUrl?: string;
  };
  endDate?: string;
}

interface RealBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  company?: {
    name: string;
    logoUrl?: string;
  };
  distanceKm?: number;
  _count?: {
    coupons?: number;
  };
}

const CATEGORY_STYLES = [
  {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40',
    iconBg: 'bg-rose-500 text-white',
  },
  {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40',
    iconBg: 'bg-amber-500 text-white',
  },
  {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/40',
    iconBg: 'bg-indigo-500 text-white',
  },
  {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/20 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/40',
    iconBg: 'bg-pink-500 text-white',
  },
  {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500 text-white',
  },
  {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40',
    iconBg: 'bg-purple-500 text-white',
  },
  {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500 text-white',
  },
  {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/40',
    iconBg: 'bg-violet-500 text-white',
  },
];

const getCategoryIcon = (iconName?: string, catName?: string) => {
  const name = (iconName || catName || '').toLowerCase();
  if (name.includes('restauran') || name.includes('utensils') || name.includes('comida')) return UtensilsCrossed;
  if (name.includes('caf') || name.includes('coffee') || name.includes('bebida')) return Coffee;
  if (name.includes('hotel') || name.includes('hosped') || name.includes('alojamiento')) return Hotel;
  if (name.includes('belleza') || name.includes('spa') || name.includes('sparkle') || name.includes('estética')) return Sparkle;
  if (name.includes('gimnas') || name.includes('fit') || name.includes('dumbbell') || name.includes('deporte')) return Dumbbell;
  if (name.includes('entreten') || name.includes('cine') || name.includes('film') || name.includes('diversión')) return Film;
  if (name.includes('salud') || name.includes('med') || name.includes('heart') || name.includes('farmacia')) return HeartPulse;
  if (name.includes('tienda') || name.includes('compr') || name.includes('shopping') || name.includes('moda')) return ShoppingBag;
  if (name.includes('viaj') || name.includes('vuelo') || name.includes('plane') || name.includes('turismo')) return Plane;
  return Tag;
};

export default function UserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<RealCategory[]>([]);
  const [activeAds, setActiveAds] = useState<AdPromotion[]>([]);
  const [realCoupons, setRealCoupons] = useState<Coupon[]>([]);
  const [realBranches, setRealBranches] = useState<RealBranch[]>([]);
  const [availableCouponsCount, setAvailableCouponsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // 1. Obtener Perfil de usuario
        const resProfile = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resProfile.status === 401) {
          localStorage.clear();
          router.push('/login');
          return;
        }

        const dataProfile = await resProfile.json();
        if (!resProfile.ok) throw new Error(dataProfile.message || 'Error al cargar perfil');

        // REGLA DE ROL: Redirigir según rol (ADMIN -> /admin/dashboard, BUSINESS -> /business/dashboard)
        const userRoles = dataProfile.roles?.map((r: any) => r.name) || [];
        const storedUser = localStorage.getItem('user');
        let isBusinessUser = userRoles.includes('BUSINESS') || !!dataProfile.company;
        let isAdminUser = userRoles.includes('ADMIN');

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.roles?.includes('BUSINESS')) isBusinessUser = true;
            if (parsed.roles?.includes('ADMIN')) isAdminUser = true;
          } catch {
            // ignore
          }
        }

        if (isAdminUser) {
          router.push('/admin/home');
          return;
        }

        if (isBusinessUser) {
          router.push('/business/dashboard');
          return;
        }

        if (isMounted) setProfile(dataProfile as UserProfile);

        // 2. Fetch de Datos Reales en paralelo
        const [resCats, resAds, resCoupons, resBranches] = await Promise.all([
          fetch(`${API_URL}/coupons/categories`),
          fetch(`${API_URL}/advertising/active`),
          fetch(`${API_URL}/coupons`),
          fetch(`${API_URL}/coupons/branches/map`),
        ]);

        if (isMounted) {
          // Categorías reales de la plataforma
          if (resCats.ok) {
            const dataCats = await resCats.json();
            setCategories(Array.isArray(dataCats) ? dataCats : []);
          }

          // Promociones / Publicidad real activa
          if (resAds.ok) {
            const dataAds = await resAds.json();
            setActiveAds(Array.isArray(dataAds) ? dataAds : []);
          }

          // Cupones reales activos
          if (resCoupons.ok) {
            const dataCoupons = await resCoupons.json();
            if (Array.isArray(dataCoupons)) {
              setRealCoupons(dataCoupons);
              setAvailableCouponsCount(dataCoupons.length);
            }
          }

          // Sucursales / Empresas reales para "Cerca de ti"
          if (resBranches.ok) {
            const dataBranches = await resBranches.json();
            setRealBranches(Array.isArray(dataBranches) ? dataBranches : []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al conectar con la plataforma');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600 dark:text-violet-400" />
          <p className="text-xs font-bold text-zinc-500 animate-pulse">Cargando tu panel personalizado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 max-w-2xl mx-auto my-12 text-center">
        <h3 className="font-extrabold text-lg">Error al cargar el panel</h3>
        <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-red-600 px-6 py-3 text-xs font-black text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  // Calcular días de membresía
  const getRemainingDays = () => {
    if (!profile?.membership?.endDate) return 0;
    const end = new Date(profile.membership.endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const remainingDays = getRemainingDays();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 -m-6 lg:-m-8 p-6 lg:p-8 space-y-10 pb-24 text-left transition-colors duration-200">
      
      {/* 1. SECCIÓN DE BIENVENIDA Y CARDS DE MEMBRESÍA CON COLORES VIVOS */}
      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        
        {/* Saludo Principal */}
        <div className="md:col-span-7 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-7 text-white shadow-xl shadow-indigo-500/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition duration-700" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-violet-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              <span>Socio Exclusivo BONOW</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight flex items-center gap-2">
              <span>¡Hola, {profile?.firstName || 'Usuario'}!</span> <FontAwesomeIcon icon={faHeart} className="text-violet-300 text-2xl" />
            </h1>
            <p className="text-sm text-violet-100/90 font-medium max-w-md">
              Explora las mejores ofertas, descuentos y promociones en tiempo real directo de las marcas aliadas.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-200">
              Ubicación: <strong className="text-white">{profile?.city || 'Ciudad de México'}</strong>
            </span>
            <Link
              href="/coupons"
              className="inline-flex items-center gap-1.5 text-xs font-black text-white hover:text-amber-300 transition"
            >
              <span>Explorar catálogo</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card de Membresía */}
        <div className="md:col-span-5 flex">
          {profile?.membership ? (
            <div className="w-full bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/15 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 bg-black/20 px-2.5 py-0.5 rounded-full">
                    Membresía Activa
                  </span>
                  <h3 className="text-lg font-black mt-2">Membresía {profile.membership.type || 'Premium'}</h3>
                  <p className="text-xs text-orange-100 mt-1 font-semibold">
                    Vence en <span className="text-amber-200 font-extrabold text-sm">{remainingDays} días</span> (
                    {new Date(profile.membership.endDate).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    )
                  </p>
                </div>
                <Award className="h-8 w-8 text-amber-300 shrink-0 drop-shadow-md" />
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-[11px] font-bold text-orange-100">
                  <span>Vigencia del periodo</span>
                  <span>{remainingDays > 0 ? `${remainingDays}d restantes` : 'Expirada'}</span>
                </div>
                <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, Math.max(5, (remainingDays / 30) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => router.push('/dashboard/membership')}
                  className="bg-white text-orange-950 hover:bg-orange-50 font-black text-xs py-2.5 px-5 rounded-2xl transition shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Ver detalles del plan
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full">
                  Sin plan activo
                </span>
                <h3 className="text-lg font-black text-white">Desbloquea Cupones VIP</h3>
                <p className="text-xs text-zinc-400 font-medium">
                  Obtén acceso ilimitado a todos los descuentos exclusivos de la plataforma.
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/membership')}
                className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs py-3 px-6 rounded-2xl transition shadow-lg shadow-violet-600/25 text-center cursor-pointer"
              >
                Adquirir Membresía Ahora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. ESTADÍSTICAS DEL USUARIO CON DISEÑO DE COLORES VIBRANTES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Cupones Disponibles */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 border border-emerald-500/30 dark:border-emerald-500/20 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-md shadow-emerald-500/20 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider block truncate">
                Cupones Activos
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {availableCouponsCount}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/15 flex justify-between items-center">
            <Link
              href="/coupons"
              className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Explorar lista <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Usos Realizados */}
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-purple-500/15 border border-purple-500/30 dark:border-purple-500/20 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <div className="bg-purple-600 text-white p-3 rounded-2xl shadow-md shadow-purple-600/20 shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-black uppercase tracking-wider block truncate">
                Usos Realizados
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {profile?._count?.redemptions || 0}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-500/15 flex justify-between items-center">
            <Link
              href="/coupons?filter=redemptions"
              className="text-[11px] font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              Ver historial <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Ahorro Acumulado */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border border-amber-500/30 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-md shadow-amber-500/20 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-wider block truncate">
                Ahorro Acumulado
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                ${parseFloat(profile?.accumulatedSavings || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-500/15 flex justify-between items-center">
            <Link
              href="/dashboard/analytics"
              className="text-[11px] font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Ver ahorro <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Favoritos */}
        <div className="bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-rose-500/15 border border-rose-500/30 dark:border-rose-500/20 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <div className="bg-rose-500 text-white p-3 rounded-2xl shadow-md shadow-rose-500/20 shrink-0">
              <Heart className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-black uppercase tracking-wider block truncate">
                Mis Favoritos
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {profile?._count?.favorites || 0}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-500/15 flex justify-between items-center">
            <Link
              href="/coupons?filter=favorites"
              className="text-[11px] font-black text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              Ver guardados <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. PROMOCIONES DE PLATAFORMA Y EMPRESAS (RECIÉN PUBLICADAS POR EMPRESAS Y ADMIN) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500 fill-rose-500" />
              Promociones Publicadas en la Plataforma
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Promociones aprobadas creadas por empresas y la administración
            </p>
          </div>
          <Link
            href="/coupons"
            className="text-xs font-black text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
          >
            Ver catálogo completo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {activeAds.length === 0 && realCoupons.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center space-y-3">
            <Megaphone className="h-10 w-10 text-zinc-400 mx-auto" />
            <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Sin promociones activas por ahora</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Nuestras empresas aliadas están preparando ofertas exclusivas. ¡Vuelve muy pronto!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Si existen promociones publicitarias reales de empresas/admin */}
            {activeAds.slice(0, 4).map((ad) => (
              <div
                key={ad.id}
                onClick={() => {
                  if (ad.targetUrl) window.open(ad.targetUrl, '_blank');
                  else router.push('/coupons');
                }}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-violet-900 to-indigo-900">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-[10px] font-black uppercase text-white px-2.5 py-1 rounded-xl bg-violet-600 shadow-md">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>Promoción Destacada</span>
                  </div>
                  {ad.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white">
                      <Building2 className="h-10 w-10 text-violet-300 mb-1" />
                      <span className="text-xs font-bold">{ad.companyName || ad.company?.name || 'BONOW'}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                        {ad.companyName || ad.company?.name || 'Empresa Aliada'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                      {ad.title}
                    </h3>
                    {ad.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {ad.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
                    <span>Ver oferta exclusiva</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}

            {/* Cupones reales publicados por empresas */}
            {realCoupons.slice(0, 4 - Math.min(4, activeAds.length)).map((coupon) => (
              <div
                key={coupon.id}
                onClick={() => router.push('/coupons')}
                className="group bg-gradient-to-br from-[#1d0b30] via-[#121630] to-[#0d1c3a] text-white border-2 border-violet-500/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-rose-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between relative"
              >
                <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-teal-400 shrink-0" />

                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-tr from-violet-900/40 via-purple-900/30 to-indigo-900/40 p-4 flex flex-col justify-between border-b border-white/10">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-white bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 px-3 py-1 rounded-full shadow-md border border-white/30">
                      {coupon.discountValue}
                    </span>
                    <Award className="h-6 w-6 text-amber-300" />
                  </div>

                  <div className="text-white">
                    <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest block">
                      {coupon.company?.name || 'Empresa Registrada'}
                    </span>
                    <h4 className="font-black text-sm text-white line-clamp-2 mt-0.5">
                      {coupon.title}
                    </h4>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-zinc-300 line-clamp-2 font-medium">
                    {coupon.description}
                  </p>

                  <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-rose-300 font-extrabold">
                      <Percent className="h-3.5 w-3.5" />
                      Cupón Oficial
                    </span>
                    <span className="text-amber-300 font-black group-hover:underline">
                      Canjear →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SECCIÓN: SUCURSALES Y EMPRESAS REALES CERCA DE TI (SOLO PARA USUARIOS) */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Mapa e información de Sucursales Reales */}
        <div className="md:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Sucursales y Empresas Cerca de Ti
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Ubicaciones reales de establecimientos con beneficios activos
              </p>
            </div>
            <Link
              href="/dashboard/map"
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Abrir mapa interactivo <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            {/* Visual Header / Map Callout */}
            <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-zinc-700 flex flex-col items-center justify-center text-center p-6 text-white shadow-inner">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
              <Map className="h-10 w-10 text-indigo-400 mb-2 relative z-10 animate-bounce" />
              <h3 className="text-base font-black relative z-10">Mapa Real de Sucursales Aliadas</h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-md relative z-10 font-medium">
                Encuentra la sucursal más cercana a tu ubicación y presenta tus cupones digitales directamente en caja.
              </p>
              <Link
                href="/dashboard/map"
                className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 relative z-10 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Explorar Sucursales en el Mapa</span>
              </Link>
            </div>

            {/* Listado de Sucursales Reales */}
            {realBranches.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                Aún no hay sucursales registradas cerca de esta ubicación.
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {realBranches.slice(0, 3).map((branch) => (
                  <div
                    key={branch.id}
                    onClick={() => router.push('/dashboard/map')}
                    className="bg-slate-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                        {branch.company?.name ? branch.company.name.charAt(0).toUpperCase() : 'B'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate">
                          {branch.name}
                        </h4>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold truncate">
                          {branch.company?.name || 'Empresa Aliada'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800 pt-2">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="h-3 w-3 text-indigo-500 shrink-0" />
                        {branch.city || branch.address}
                      </span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Ver sucursal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lado derecho: Banner Referidos con colores súper vivos */}
        <div className="md:col-span-4">
          <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden h-full min-h-[300px] flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-block">
                Programa de Referidos
              </span>
              <h3 className="font-black text-xl leading-tight">
                ¡Invita a tus amigos a BONOW!
              </h3>
              <p className="text-xs text-pink-100 leading-relaxed font-medium">
                Gana 1 mes adicional de Membresía Premium por cada amigo que se registre con tu código personal.
              </p>
            </div>

            <div className="relative z-10 space-y-3 mt-6">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/register');
                  alert('¡Enlace de invitación copiado al portapapeles!');
                }}
                className="w-full bg-white text-pink-950 hover:bg-pink-50 font-black text-xs py-3.5 px-5 rounded-2xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Copiar Enlace de Invitación</span>
              </button>
            </div>

            <div className="absolute right-[-20px] bottom-[-20px] text-white/10 pointer-events-none">
              <Gift className="h-44 w-44 stroke-1" />
            </div>
          </div>
        </div>

      </div>

      {/* 5. SECCIÓN DE CATEGORÍAS REALES AGREGADAS POR ADMIN */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Categorías de la Plataforma
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Categorías activas configuradas por el Administrador
            </p>
          </div>
          <Link
            href="/coupons"
            className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-xs text-zinc-500">
            Cargando categorías oficiales...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat, idx) => {
              const IconComp = getCategoryIcon(cat.icon, cat.name);
              const style = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];

              return (
                <div
                  key={cat.id || cat.name}
                  onClick={() => router.push(`/coupons?category=${encodeURIComponent(cat.name)}`)}
                  className={`group border rounded-3xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${style.bg} hover:scale-[1.03] shadow-sm`}
                >
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md transform group-hover:rotate-6 transition duration-300 ${style.iconBg}`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div className="text-center w-full">
                    <span className="text-xs font-black block truncate px-1">
                      {cat.name}
                    </span>
                    {cat.description && (
                      <span className="text-[10px] opacity-75 line-clamp-1 mt-0.5">
                        {cat.description}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
