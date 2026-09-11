'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Tag,
  Award,
  Loader2,
  AlertCircle,
  CheckCircle,
  Ticket,
  X,
  Heart,
  Eye,
  QrCode,
  Sparkles,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  Phone,
  Globe,
  Star,
  Percent,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Sparkles as Sparkle,
  Dumbbell,
  Film,
  HeartPulse,
  ShoppingBag,
  Plane,
  Flame,
  MapPin,
  Map,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import RecommendedCoupons from '../../components/personalization/RecommendedCoupons';

interface Company {
  id: string;
  name: string;
  corporateName?: string;
  logoUrl?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  status: string;
  category?: { name: string } | null;
  couponsCount?: number;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  discountValue?: string;
  discount?: string;
  imageUrl?: string | null;
  conditions?: string | null;
  type: 'SINGLE_USE' | 'REUSABLE';
  usageLimit?: number | null;
  usageCount?: number;
  company: {
    name: string;
    logoUrl?: string | null;
  };
  category?: {
    id?: string;
    name: string;
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
  companyLogo?: string | null;
  category?: string;
  discount?: string;
  isFeatured?: boolean;
  company?: {
    name: string;
    logoUrl?: string;
  };
}

interface RealCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

const CATEGORY_STYLES = [
  { bg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20', iconBg: 'bg-rose-500 text-white' },
  { bg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20', iconBg: 'bg-amber-500 text-white' },
  { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20', iconBg: 'bg-indigo-500 text-white' },
  { bg: 'bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/30 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20', iconBg: 'bg-pink-500 text-white' },
  { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20', iconBg: 'bg-emerald-500 text-white' },
  { bg: 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20', iconBg: 'bg-purple-500 text-white' },
  { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20', iconBg: 'bg-cyan-500 text-white' },
  { bg: 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20', iconBg: 'bg-violet-500 text-white' },
];

const getCategoryIcon = (iconName?: string, catName?: string) => {
  const name = (iconName || catName || '').toLowerCase();
  if (name.includes('restauran') || name.includes('utensils') || name.includes('comida')) return UtensilsCrossed;
  if (name.includes('caf') || name.includes('coffee') || name.includes('bebida')) return Coffee;
  if (name.includes('hotel') || name.includes('hosped')) return Hotel;
  if (name.includes('belleza') || name.includes('spa') || name.includes('sparkle')) return Sparkle;
  if (name.includes('gimnas') || name.includes('fit') || name.includes('dumbbell')) return Dumbbell;
  if (name.includes('entreten') || name.includes('cine') || name.includes('film')) return Film;
  if (name.includes('salud') || name.includes('med') || name.includes('heart')) return HeartPulse;
  if (name.includes('tienda') || name.includes('compr') || name.includes('shopping')) return ShoppingBag;
  if (name.includes('viaj') || name.includes('vuelo') || name.includes('plane')) return Plane;
  return Tag;
};

export default function ExplorePage() {
  const router = useRouter();

  // Datos
  const [promotions, setPromotions] = useState<AdPromotion[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<RealCategory[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Estados de carga y modales
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [previewCoupon, setPreviewCoupon] = useState<Coupon | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchExploreData = async () => {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      try {
        // Cargar en paralelo todas las secciones
        const [resPromos, resCoupons, resCompanies, resCategories] = await Promise.all([
          fetch('http://localhost:3001/coupons/promotions-page'),
          fetch('http://localhost:3001/coupons'),
          fetch('http://localhost:3001/coupons/companies/public'),
          fetch('http://localhost:3001/coupons/categories'),
        ]);

        if (isMounted) {
          if (resPromos.ok) {
            const dataPromos = await resPromos.json();
            if (dataPromos && Array.isArray(dataPromos.items)) {
              setPromotions(dataPromos.items);
            } else if (Array.isArray(dataPromos)) {
              setPromotions(dataPromos);
            }
          }

          if (resCoupons.ok) {
            const dataCoupons = await resCoupons.json();
            setCoupons(Array.isArray(dataCoupons) ? dataCoupons : []);
          }

          if (resCompanies.ok) {
            const dataCompanies = await resCompanies.json();
            if (Array.isArray(dataCompanies)) {
              setCompanies(
                dataCompanies.filter(
                  (c: Company) =>
                    c.name.toUpperCase() !== 'BONOW' &&
                    c.name.toUpperCase() !== 'WYNNI' &&
                    !c.corporateName?.toUpperCase().includes('BONOW'),
                ),
              );
            }
          }

          if (resCategories.ok) {
            const dataCat = await resCategories.json();
            setCategories(Array.isArray(dataCat) ? dataCat : []);
          }
        }

        // Cargar favoritos del usuario si está autenticado
        if (token && isMounted) {
          try {
            const resFavs = await fetch('http://localhost:3001/personalization/favorite/coupon-ids', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resFavs.ok) {
              const idsArr = await resFavs.json();
              setFavoriteIds(new Set(idsArr));
            }
          } catch {
            // silencioso
          }
        }
      } catch (e) {
        console.error('Error al cargar datos de explorar', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchExploreData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFavorite = async (couponId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/personalization/favorite/coupon/${couponId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (data.favorited) next.add(couponId);
          else next.delete(couponId);
          return next;
        });
      }
    } catch {
      // silencioso
    }
  };

  const handleRedeemCoupon = async (coupon: Coupon) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/coupons/${coupon.id}/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.generatedCode) {
        setRedeemedCode(data.generatedCode);
        setPreviewCoupon(coupon);
      } else {
        alert(data.message || 'No se pudo obtener el cupón.');
      }
    } catch {
      alert('Error al procesar la solicitud.');
    }
  };

  // Filtrado de cupones por búsqueda y categoría
  const filteredCoupons = coupons.filter((c) => {
    const matchesCategory = selectedCategory ? c.category?.id === selectedCategory : true;
    const matchesSearch = searchQuery
      ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Filtrado de promociones destacadas (tanto de empresas como creadas por admin)
  const filteredPromotions = promotions.filter((ad) => {
    const hasFeatured = promotions.some((p) => p.isFeatured === true);
    if (hasFeatured && ad.isFeatured !== true) {
      return false;
    }

    const matchesSearch = searchQuery
      ? ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ad.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ad.companyName || ad.company?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    let matchesCategory = true;
    if (selectedCategory) {
      const catObj = categories.find((c) => c.id === selectedCategory);
      const catName = catObj ? catObj.name.toLowerCase() : '';
      matchesCategory =
        (ad.category || '').toLowerCase().includes(catName) ||
        catName.includes((ad.category || '').toLowerCase());
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-24 text-left">
      
      {/* 1. HERO PRINCIPAL IMPACTANTE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-950 p-8 lg:p-12 text-white shadow-2xl shadow-indigo-950/30">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-violet-600/30 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300">
            <Compass className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Centro Oficial de Exploración BONOW</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Descubre Ofertas, Promociones 2x1 y Aliados Exclusivos
          </h1>

          <p className="text-sm lg:text-base text-violet-100/90 font-medium leading-relaxed">
            Explora de manera integrada las promociones activas, cupones de descuento y empresas aliadas verificadas en todo México.
          </p>

          {/* BUSCADOR IMPACTANTE EN HERO */}
          <div className="pt-2">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar promociones, cupones o empresas..."
                  className="w-full bg-white/10 dark:bg-zinc-900/60 pl-11 pr-4 py-3 text-sm font-semibold rounded-xl text-white placeholder-violet-200/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 bg-zinc-900/90 dark:bg-zinc-900 text-xs font-black rounded-xl text-white border border-white/20 focus:outline-none cursor-pointer"
                >
                  <option value="">Todas las Categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* BADGES DE METRICAS REALES */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-violet-200">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>+{companies.length || 15} Empresas Aliadas</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full">
              <Ticket className="h-4 w-4 text-amber-400" />
              <span>+{coupons.length || 20} Cupones Activos</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full">
              <Flame className="h-4 w-4 text-rose-400" />
              <span>+{promotions.length || 5} Promociones 2x1</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECOMENDACIONES PERSONALIZADAS */}
      <RecommendedCoupons onViewCoupon={(id) => setPreviewCoupon(coupons.find((c) => c.id === id) || null)} />

      {/* SPINNER CARGANDO */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
        </div>
      )}

      {!loading && (
        <>
          {/* ==================== SECCIÓN 1: PROMOCIONES DESTACADAS Y 2X1 ==================== */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                  <Flame className="h-6 w-6 text-rose-500 fill-rose-500" />
                  Promociones Destacadas y 2x1
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Ofertas especiales publicadas por marcas aliadas y administradores
                </p>
              </div>
              <button
                onClick={() => router.push('/promotions')}
                className="text-xs font-black text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                Ver todas las promociones <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {filteredPromotions.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-xs text-zinc-500">
                Aún no hay promociones destacadas en esta sección.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPromotions.map((ad) => (
                  <div
                    key={ad.id}
                    onClick={() => {
                      if (ad.targetUrl) window.open(ad.targetUrl, '_blank');
                      else router.push('/promotions');
                    }}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-violet-900 to-indigo-900">
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-[10px] font-black uppercase text-white px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 shadow-md">
                        <Sparkles className="h-3 w-3 text-amber-300" />
                        <span>{ad.discount || 'Promoción Oficial'}</span>
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
                        <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-1">
                          {ad.companyName || ad.company?.name || 'Empresa Registrada'}
                        </span>
                        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                          {ad.title}
                        </h3>
                        {ad.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                            {ad.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
                        <span>Ir a la promoción</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ==================== SECCIÓN 2: CUPONES DE DESCUENTO ACTIVOS ==================== */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                  <Award className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  Cupones Exclusivos Disponibles
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Obtén tus cupones digitales y preséntalos en caja para ahorrar al instante
                </p>
              </div>
              <button
                onClick={() => router.push('/coupons')}
                className="text-xs font-black text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                Ver todos los cupones <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {filteredCoupons.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-xs text-zinc-500">
                No se encontraron cupones que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCoupons.slice(0, 6).map((coupon) => {
                  const isFavorited = favoriteIds.has(coupon.id);
                  return (
                    <div
                      key={coupon.id}
                      className="group relative overflow-hidden rounded-3xl border-2 border-violet-500/30 bg-gradient-to-br from-[#1d0b30] via-[#121630] to-[#0d1c3a] text-white shadow-xl hover:shadow-2xl hover:border-rose-400 transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Barra Superior Gradiente Marca BONOW */}
                      <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-teal-400 shrink-0" />

                      <div className="absolute top-5 left-4 z-10 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 px-4 py-1.5 text-xs font-black text-white shadow-lg shadow-rose-500/30 border border-white/30">
                        {coupon.discountValue || coupon.discount || 'DESCUENTO'}
                      </div>

                      <button
                        onClick={() => void handleToggleFavorite(coupon.id)}
                        className="absolute top-5 right-4 z-10 rounded-full bg-white/10 p-2 backdrop-blur-md hover:scale-110 transition shadow-md border border-white/20"
                      >
                        <Heart
                          className={`h-4 w-4 transition ${
                            isFavorited ? 'fill-pink-500 text-pink-500' : 'text-zinc-300 hover:text-pink-500'
                          }`}
                        />
                      </button>

                      <div className="h-44 w-full bg-gradient-to-tr from-violet-900/40 via-purple-900/30 to-indigo-900/40 relative overflow-hidden border-b border-white/10">
                        {coupon.imageUrl ? (
                          <img
                            src={coupon.imageUrl}
                            alt={coupon.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
                            <Building2 className="h-10 w-10 text-rose-400/60 mb-1" />
                            <span className="text-xs font-bold text-rose-300">{coupon.company?.name || 'BONOW'}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest bg-rose-500/20 px-3 py-0.5 rounded-full border border-rose-400/30">
                            {coupon.company?.name || 'Empresa Aliada'}
                          </span>
                          <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                            {coupon.title}
                          </h3>
                          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                            {coupon.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/15 flex gap-2">
                          <button
                            onClick={() => setPreviewCoupon(coupon)}
                            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs py-2.5 rounded-2xl transition border border-white/20"
                          >
                            Ver Detalle
                          </button>
                          <button
                            onClick={() => void handleRedeemCoupon(coupon)}
                            className="flex-1 bg-gradient-to-r from-red-500 via-rose-500 to-violet-600 hover:from-red-600 hover:to-violet-700 text-white font-black text-xs py-2.5 rounded-2xl transition shadow-lg shadow-rose-500/30"
                          >
                            Obtener Cupón
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==================== SECCIÓN 3: EMPRESAS Y ALIADOS VERIFICADOS ==================== */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                  <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Empresas y Aliados Verificados
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Comercios y establecimientos oficiales asociados a la red BONOW
                </p>
              </div>
              <button
                onClick={() => router.push('/companies')}
                className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Ver directorio de empresas <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {companies.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-xs text-zinc-500">
                Aún no hay empresas aliadas públicas visibles.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.slice(0, 6).map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
                        {comp.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={comp.logoUrl} alt={comp.name} className="h-full w-full object-cover rounded-2xl" />
                        ) : (
                          comp.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Verificada</span>
                        </div>
                        <h3 className="text-base font-black text-zinc-900 dark:text-white truncate mt-0.5">
                          {comp.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {comp.category?.name || 'Comercio Registrado'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {comp.description || 'Establecimiento oficial en la red BONOW con descuentos exclusivos.'}
                    </p>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-bold">
                        {comp.couponsCount ? `${comp.couponsCount} cupones activos` : 'Cupones disponibles'}
                      </span>
                      <button
                        onClick={() => router.push(`/coupons?query=${encodeURIComponent(comp.name)}`)}
                        className="text-emerald-600 dark:text-emerald-400 font-black hover:underline flex items-center gap-1"
                      >
                        <span>Ver cupones</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ==================== SECCIÓN 4: CATEGORÍAS POPULARES ==================== */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                  <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  Explorar por Categorías
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Encuentra cupones organizados por tipo de establecimiento
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-xs text-zinc-500">
                Cargando categorías...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.map((cat, idx) => {
                  const IconComp = getCategoryIcon(cat.icon, cat.name);
                  const style = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];
                  return (
                    <div
                      key={cat.id || cat.name}
                      onClick={() => router.push(`/coupons?category=${encodeURIComponent(cat.id || cat.name)}`)}
                      className={`group border rounded-3xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${style.bg} hover:scale-[1.03] shadow-sm`}
                    >
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-md transform group-hover:rotate-6 transition duration-300 ${style.iconBg}`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black block truncate text-center px-1">
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==================== SECCIÓN 5: MAPA DE SUCURSALES Y UBICACIONES ==================== */}
          <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-900/50">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-bold text-indigo-300">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span>Geolocalización en Tiempo Real</span>
              </div>
              <h3 className="text-2xl font-black">Ubica las Sucursales más Cercanas a Ti</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                Accede al mapa interactivo para encontrar establecimientos con promociones activas cerca de tu ubicación exacta.
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard/map')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-6 py-4 rounded-2xl transition shadow-lg shadow-indigo-600/30 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Map className="h-4 w-4" />
              <span>Abrir Mapa Interactivo</span>
            </button>
          </section>
        </>
      )}

      {/* MODAL CÓDIGO QR / DETALLE */}
      {previewCoupon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm text-left"
          onClick={() => setPreviewCoupon(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <span className="text-xs font-black uppercase text-violet-600 tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTicketAlt} className="text-violet-500" /> Detalle del Cupón
              </span>
              <button
                onClick={() => setPreviewCoupon(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-[#0F1E36] to-slate-950 p-6 text-white shadow-xl relative overflow-hidden space-y-4 border border-violet-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest block">
                    {previewCoupon.company?.name || 'BONOW PLATAFORMA'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {previewCoupon.title}
                  </h3>
                </div>
                <span className="rounded-2xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-zinc-950 shadow-md">
                  {previewCoupon.discountValue || previewCoupon.discount || 'DESCUENTO'}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {previewCoupon.description}
              </p>

              {redeemedCode && (
                <div className="p-3 bg-violet-600/30 border border-violet-400/40 rounded-2xl text-center">
                  <span className="text-[10px] font-black uppercase text-amber-300 block">Tu Código Obtenido:</span>
                  <span className="text-xl font-mono font-black text-white tracking-widest">{redeemedCode}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPreviewCoupon(null)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition"
              >
                Cerrar
              </button>
              {!redeemedCode && (
                <button
                  onClick={() => void handleRedeemCoupon(previewCoupon)}
                  className="flex-1 rounded-2xl bg-violet-600 py-3 text-xs font-black text-white hover:bg-violet-700 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>Obtener Cupón</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
