'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Star,
  Ticket,
  Loader2,
  CheckCircle,
  Building2,
  ArrowRight,
  Sparkles,
  Search,
  ChevronRight,
  X,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faFire, faBolt, faStar } from '@fortawesome/free-solid-svg-icons';

interface PromoItem {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string | null;
  category: string;
  discount: string;
  description: string;
  imageUrl: string;
  isFeatured?: boolean;
  targetUrl?: string;
  couponId?: string;
}

interface PromotionsPageData {
  heroTag: string;
  title: string;
  subtitle: string;
  cardBadge: string;
  cardPrice: string;
  items: PromoItem[];
  companyItems?: PromoItem[];
}

interface CompanyGroup {
  companyName: string;
  companyLogo: string | null;
  promos: PromoItem[];
}

const DEFAULT_PROMO_DATA: PromotionsPageData = {
  heroTag: '⚡ OFERTAS ESPECIALES 2X1 & DESCUENTOS DESTACADOS',
  title: 'PROMOCIONES DE LA SEMANA',
  subtitle:
    'Disfruta de cupones exclusivos 2x1 en gastronomía, pases VIP de entretenimiento y ofertas por tiempo limitado en México.',
  cardBadge: 'BENEFICIO EXCLUSIVO MIEMBROS',
  cardPrice: '$0 Costo Extra',
  items: [],
  companyItems: [],
};

export default function PromotionsPage() {
  const [promoData, setPromoData] =
    useState<PromotionsPageData>(DEFAULT_PROMO_DATA);
  const [loading, setLoading] = useState(true);
  const [platformCategories, setPlatformCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedCompanyModal, setSelectedCompanyModal] =
    useState<CompanyGroup | null>(null);

  const router = useRouter();

  const navigateOrLogin = (targetUrl: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      router.push(targetUrl);
    }
  };

  useEffect(() => {
    const fetchPromotionsPage = async () => {
      try {
        const res = await fetch(
          'http://localhost:3001/coupons/promotions-page',
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            setPromoData(data);
          }
        }
      } catch {
        // Silencioso
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3001/coupons/categories');
        if (res.ok) {
          const cats = await res.json();
          if (Array.isArray(cats)) {
            setPlatformCategories(cats.map((c: any) => c.name));
          }
        }
      } catch {
        // Silencioso
      }
    };

    void fetchPromotionsPage();
    void fetchCategories();
  }, []);

  // Categorías dinámicas de la plataforma
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    set.add('TODAS');
    platformCategories.forEach((cat) => set.add(cat));
    [
      'Restaurantes',
      'Cafeterías',
      'Hoteles',
      'Belleza',
      'Gimnasios',
      'Entretenimiento',
      'Salud',
      'Tiendas',
      'Viajes',
      'Gastronomía',
      'Más',
    ].forEach((cat) => set.add(cat));
    (promoData.items || []).forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [platformCategories, promoData.items]);

  // Función de coincidencia de filtros para búsqueda y categoría
  const isPromoMatching = (p: PromoItem) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'TODAS' ||
      (p.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes((p.category || '').toLowerCase());

    return matchesSearch && matchesCat;
  };

  // 1. Filtrar Promociones Destacadas (isFeatured === true Y coincide con el filtro)
  const featuredPromotions = useMemo(() => {
    return (promoData.items || []).filter(
      (p) => p.isFeatured === true && isPromoMatching(p),
    );
  }, [promoData.items, searchQuery, selectedCategory]);

  // 2. Agrupar Promociones por Empresa (coincidentes con el filtro)
  const companyGroups = useMemo(() => {
    const map = new Map<string, CompanyGroup>();
    const filteredItems = (promoData.items || []).filter(isPromoMatching);

    filteredItems.forEach((item) => {
      const name = item.companyName || 'Comercio Aliado';
      if (!map.has(name)) {
        map.set(name, {
          companyName: name,
          companyLogo: item.companyLogo || null,
          promos: [],
        });
      }
      map.get(name)!.promos.push(item);
    });

    return Array.from(map.values());
  }, [promoData.items, searchQuery, selectedCategory]);

  // 3. Obtener Lista Completa Filtrada por Búsqueda y Categoría
  const filteredAllPromotions = useMemo(() => {
    return (promoData.items || []).filter(isPromoMatching);
  }, [promoData.items, searchQuery, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-20 text-left">
      {/* Banner Hero Promociones */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0F1E36] via-slate-900 to-[#0F1E36] p-8 md:p-12 overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
        {/* Glow ambient background spots */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="space-y-4 max-w-2xl text-left z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-400 shadow-md backdrop-blur-md">
            <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
            {promoData.heroTag || '⚡ OFERTAS ESPECIALES 2X1 & DESCUENTOS DESTACADOS'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight text-white">
            {promoData.title || 'PROMOCIONES DE LA SEMANA'}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
            {promoData.subtitle ||
              'Disfruta de cupones exclusivos 2x1 en gastronomía, pases VIP de entretenimiento y ofertas por tiempo limitado en México.'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl text-center space-y-3 shrink-0 z-10 shadow-2xl">
          <Star className="h-8 w-8 text-amber-400 fill-amber-400 mx-auto animate-bounce" />
          <p className="text-xs font-black uppercase text-amber-300 tracking-wider">
            {promoData.cardBadge || 'BENEFICIO EXCLUSIVO MIEMBROS'}
          </p>
          <p className="text-2xl font-black text-white">
            {promoData.cardPrice || '$0 Costo Extra'}
          </p>
          <button
            onClick={() => navigateOrLogin('/coupons')}
            className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 py-3 px-6 text-xs font-black uppercase text-white shadow-lg shadow-red-500/30 transition-all transform hover:scale-105 cursor-pointer"
          >
            Ver Todas las Ofertas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Cargando promociones activas...
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* BARRA DE BÚSQUEDA Y CATEGORÍAS */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre de promoción, empresa o palabra clave..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-2xl px-4 py-2.5 text-xs font-black uppercase transition shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: PROMOCIONES DESTACADAS (isFeatured === true) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
                  ⭐ DESTACADAS POR ADMIN
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Promociones Destacadas ({featuredPromotions.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Lo mejor y más relevante en BONOW+
              </span>
            </div>

            {featuredPromotions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredPromotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="group bg-gradient-to-br from-[#121630] via-[#1a0f35] to-[#0d1c3a] border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 flex flex-col justify-between transform hover:-translate-y-1 text-white"
                  >
                    <div className="relative h-48 overflow-hidden bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          promo.imageUrl ||
                          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
                        }
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121630] via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 text-[10px] font-black uppercase text-zinc-950 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg border border-amber-300/40">
                        {promo.discount || '2X1'}
                      </span>
                      <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase text-amber-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> DESTACADA
                      </span>
                    </div>

                    <div className="p-6 space-y-4 text-left flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                          {promo.companyName}
                        </span>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-tight line-clamp-2 group-hover:text-amber-300 transition leading-snug">
                          {promo.title}
                        </h3>
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {promo.description}
                        </p>
                      </div>

                      <button
                        onClick={() => navigateOrLogin('/coupons')}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 py-3 text-xs font-black uppercase text-white shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <Ticket className="h-4 w-4" />
                        <span>Obtener Promoción</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-amber-500/30 bg-amber-500/5 p-8 text-center space-y-2">
                <Star className="h-8 w-8 text-amber-400 mx-auto" />
                <p className="text-xs font-bold text-amber-300 uppercase">
                  No hay promociones destacadas en esta categoría
                </p>
              </div>
            )}
          </div>

          {/* RESULTADOS DE LAS 3 SECCIONES */}
          {featuredPromotions.length === 0 &&
          companyGroups.length === 0 &&
          filteredAllPromotions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 bg-white/50 dark:bg-zinc-900/50">
              <p className="text-sm font-bold">
                No se encontraron promociones que coincidan con la búsqueda o categoría seleccionada.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('TODAS');
                }}
                className="inline-block text-xs font-black text-violet-600 hover:underline uppercase tracking-wider"
              >
                Limpiar filtros de búsqueda
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* SECCIÓN 1: PROMOCIONES DESTACADAS */}
              {featuredPromotions.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
                        <FontAwesomeIcon icon={faStar} className="text-amber-400" /> DESTACADOS DE LA SEMANA
                      </span>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Promociones Destacadas
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {featuredPromotions.length} Ofertas Especiales
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featuredPromotions.map((promo) => (
                      <div
                        key={promo.id}
                        onClick={() =>
                          navigateOrLogin(
                            promo.targetUrl ||
                              `/coupons?id=${promo.couponId || promo.id}`,
                          )
                        }
                        className="group bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 border-2 border-amber-400/60 hover:border-amber-400 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition duration-300 text-white cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 relative overflow-hidden"
                      >
                        <div className="absolute top-4 right-4 z-10 rounded-full bg-amber-400 text-slate-950 px-3 py-1 text-[9px] font-black uppercase shadow-md flex items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-slate-950" /> DESTACADA
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-md">
                              {promo.companyLogo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={promo.companyLogo}
                                  alt={promo.companyName}
                                  className="h-full w-full object-contain rounded-xl"
                                />
                              ) : (
                                <Building2 className="h-5 w-5 text-amber-400" />
                              )}
                            </div>
                            <span className="text-xs font-black uppercase text-slate-300 tracking-wider truncate">
                              {promo.companyName}
                            </span>
                          </div>

                          {promo.imageUrl && (
                            <div className="h-40 w-full rounded-2xl overflow-hidden border border-white/10 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={promo.imageUrl}
                                alt={promo.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}

                          <div className="space-y-1 text-left">
                            <h3 className="text-lg font-black leading-snug text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                              {promo.title}
                            </h3>
                            <p className="text-xs text-slate-300 line-clamp-2 font-medium leading-relaxed">
                              {promo.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                            {promo.discount || 'OFERTA DESTACADA'}
                          </span>

                          <span className="text-xs font-black text-amber-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Obtener Beneficio <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: PROMOCIONES FILTRADAS POR EMPRESA */}
              {companyGroups.length > 0 && (
                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-500 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 shadow-sm">
                        <FontAwesomeIcon icon={faBuilding} className="text-teal-500" /> EXPLORA POR EMPRESA
                      </span>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Promociones por Comercio ({companyGroups.length})
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Haz clic en un comercio para ver todas sus promociones
                    </span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {companyGroups.map((group) => (
                      <div
                        key={group.companyName}
                        onClick={() => setSelectedCompanyModal(group)}
                        className="group bg-gradient-to-br from-slate-900 via-[#121630] to-zinc-950 border-2 border-violet-500/30 hover:border-teal-400 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition duration-300 text-white cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-800 border border-teal-400/40 p-1 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                            {group.companyLogo ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={group.companyLogo}
                                alt={group.companyName}
                                className="h-full w-full object-contain rounded-xl"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-teal-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition truncate">
                              {group.companyName}
                            </h4>
                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                              Comercio Aliado Verificado
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                            <FontAwesomeIcon icon={faFire} className="text-amber-400" /> {group.promos.length} {group.promos.length === 1 ? 'Promoción' : 'Promociones'}
                          </span>

                          <span className="text-xs font-black text-teal-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Ver todas <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN 3: TODAS LAS PROMOCIONES ACTIVAS */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-violet-500 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 shadow-sm">
                      <FontAwesomeIcon icon={faFire} className="text-violet-500" /> CATÁLOGO COMPLETO
                    </span>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      Todas las Promociones ({filteredAllPromotions.length})
                    </h2>
                  </div>
                </div>

                {filteredAllPromotions.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAllPromotions.map((promo) => (
                      <div
                        key={promo.id}
                        className="group bg-white dark:bg-zinc-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-violet-500/60 transition duration-300 flex flex-col justify-between transform hover:-translate-y-1"
                      >
                        <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-zinc-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              promo.imageUrl ||
                              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
                            }
                            alt={promo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-4 flex flex-col justify-between text-white">
                            <span className="self-start rounded-full bg-teal-600/90 border border-teal-400/40 px-3 py-1 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                              {promo.category || 'PROMOCIÓN 2X1'}
                            </span>
                            <div className="flex justify-between items-end">
                              <span className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 text-xs font-black uppercase tracking-wide shadow-lg">
                                {promo.discount || '2X1'}
                              </span>
                              {promo.isFeatured && (
                                <span className="rounded-xl bg-amber-500 text-zinc-950 px-2.5 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-zinc-950" /> DESTACADA
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-4 text-left flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                              {promo.companyLogo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={promo.companyLogo}
                                  alt={promo.companyName}
                                  className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-violet-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs">
                                  {promo.companyName.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-wider truncate">
                                  {promo.companyName}
                                </span>
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                              </div>
                            </div>

                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-2 group-hover:text-violet-600 transition leading-snug">
                              {promo.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                              {promo.description}
                            </p>
                          </div>

                          <button
                            onClick={() => navigateOrLogin('/coupons')}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 py-3.5 text-xs font-black uppercase text-white shadow-lg shadow-violet-600/25 transition-all transform hover:scale-[1.02] cursor-pointer"
                          >
                            <Ticket className="h-4 w-4" />
                            <span>Obtener Promoción</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center space-y-2">
                    <Search className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-black uppercase text-slate-800 dark:text-zinc-200">
                      No se encontraron promociones con ese filtro
                    </p>
                    <p className="text-xs text-slate-500">
                      Intenta cambiar el término de búsqueda o selecciona otra categoría.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE PROMOCIONES POR EMPRESA */}
      {selectedCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-white">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-[#0F1E36] via-slate-900 to-[#0F1E36] p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-teal-400/50 p-1 flex items-center justify-center shadow-lg shrink-0">
                  {selectedCompanyModal.companyLogo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedCompanyModal.companyLogo}
                      alt={selectedCompanyModal.companyName}
                      className="h-full w-full object-contain rounded-xl"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-teal-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black uppercase text-white tracking-wide">
                      {selectedCompanyModal.companyName}
                    </h3>
                    <CheckCircle className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <p className="text-xs text-teal-400 font-bold">
                    {selectedCompanyModal.promos.length} {selectedCompanyModal.promos.length === 1 ? 'Promoción Publicada' : 'Promociones Publicadas'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="rounded-2xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cuerpo del Modal: Grid de Promociones de la Empresa */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid gap-6 md:grid-cols-2">
                {selectedCompanyModal.promos.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          promo.imageUrl ||
                          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
                        }
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-3 flex justify-between items-start">
                        <span className="rounded-full bg-teal-600/90 border border-teal-400/40 px-3 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
                          {promo.category || 'PROMOCIÓN'}
                        </span>
                        <span className="rounded-xl bg-red-500 text-white px-2.5 py-0.5 text-xs font-black uppercase">
                          {promo.discount || '2X1'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-sm text-white uppercase line-clamp-2">
                          {promo.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 font-medium">
                          {promo.description}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCompanyModal(null);
                          navigateOrLogin('/coupons');
                        }}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Ticket className="h-4 w-4" />
                        <span>Obtener Promoción</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

