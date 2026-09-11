'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Layers,
  Filter,
  CheckCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';
import RecommendedCoupons from '../../components/personalization/RecommendedCoupons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicketAlt,
  faHeart,
  faCheckCircle,
  faGem,
  faLock,
  faInfinity,
  faHourglassHalf,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

interface Branch {
  name: string;
  city: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface Coupon {
  id: string;
  code?: string;
  title: string;
  description: string;
  discountValue?: string;
  discount?: string;
  imageUrl: string | null;
  conditions: string | null;
  type: 'SINGLE_USE' | 'REUSABLE';
  usageLimit?: number | null;
  usageCount?: number;
  company: {
    name: string;
    logoUrl: string | null;
  };
  category?: {
    id?: string;
    name: string;
  };
  branches?: Branch[];
}

interface Redemption {
  id: string;
  couponId: string;
  generatedCode: string;
  status: 'PENDING' | 'USED' | 'EXPIRED' | 'CANCELLED';
  redeemedAt: string;
  usedAt?: string | null;
  coupon: Coupon;
}

function CouponsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';

  // Tabs de navegación interna
  const [activeTab, setActiveTab] = useState<string>(filterParam);

  // Estados de datos
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<Redemption[]>([]);
  const [favoriteCoupons, setFavoriteCoupons] = useState<Coupon[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);

  // Estados de interfaz
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modales
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [previewModalCoupon, setPreviewModalCoupon] = useState<Coupon | null>(null);

  // Sincronizar tab si cambia el parámetro de URL
  useEffect(() => {
    if (filterParam) {
      setActiveTab(filterParam);
    }
  }, [filterParam]);

  // Carga inicial de datos según la pestaña activa
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      try {
        // 1. Cargar Categorías reales siempre
        const resCat = await fetch(`${API_URL}/coupons/categories/list`);
        if (resCat.ok && isMounted) {
          const dataCat = await resCat.json();
          setCategoriesList(Array.isArray(dataCat) ? dataCat : []);
        }

        // 2. Cargar IDs de favoritos del usuario si hay token
        if (token && isMounted) {
          try {
            const resFavIds = await fetch(`${API_URL}/personalization/favorite/coupon-ids`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resFavIds.ok) {
              const idsArr = await resFavIds.json();
              setFavoriteIds(new Set(idsArr));
            }
          } catch {
            // silencioso
          }

          // Cargar Redenciones del Usuario ("Mis Cupones" y "Mis Usos")
          try {
            const resMyRed = await fetch(`${API_URL}/coupons/my-redemptions`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resMyRed.ok && isMounted) {
              const dataMyRed = await resMyRed.json();
              setMyRedemptions(Array.isArray(dataMyRed) ? dataMyRed : []);
            }
          } catch {
            // silencioso
          }
        }

        // 3. Cargar datos específicos del Tab
        if (activeTab === 'favorites') {
          if (token && isMounted) {
            const resFavs = await fetch(`${API_URL}/personalization/favorite/coupons`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resFavs.ok && isMounted) {
              const dataFavs = await resFavs.json();
              setFavoriteCoupons(Array.isArray(dataFavs) ? dataFavs : []);
            }
          }
        } else {
          // Tab "all" (Todos los cupones activos)
          let url = `${API_URL}/coupons`;
          const params = new URLSearchParams();
          if (selectedCategory) params.append('categoryId', selectedCategory);
          if (searchQuery) params.append('query', searchQuery);

          if (params.toString()) {
            url += `?${params.toString()}`;
          }

          const resCoupons = await fetch(url);
          const dataCoupons = await resCoupons.json();
          if (isMounted) {
            if (!resCoupons.ok) throw new Error(dataCoupons.message || 'Error al obtener cupones');
            setCoupons(Array.isArray(dataCoupons) ? dataCoupons : []);
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

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedCategory]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = `${API_URL}/coupons`;
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchQuery) params.append('query', searchQuery);

      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setCoupons(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (couponId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/personalization/favorite/coupon/${couponId}`, {
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

        if (activeTab === 'favorites') {
          setFavoriteCoupons((prev) => prev.filter((c) => c.id !== couponId));
        }
      }
    } catch {
      // Silencioso
    }
  };

  const handleRedeemCoupon = async (coupon: Coupon) => {
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/coupons/${coupon.id}/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener cupón');

      setRedeemedCode(data.generatedCode);
      setSelectedCoupon(coupon);
      setSuccess('¡Cupón obtenido exitosamente! Guardado en "Mis Cupones".');

      // Actualizar redenciones locales
      const newRedemption: Redemption = {
        id: data.id || coupon.id,
        couponId: coupon.id,
        generatedCode: data.generatedCode,
        status: 'PENDING',
        redeemedAt: new Date().toISOString(),
        coupon,
      };
      setMyRedemptions((prev) => [newRedemption, ...prev]);

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al redimir cupón');
    }
  };

  // Mapa de redenciones obtenidas por el usuario
  const myRedemptionsMap = new Map<string, Redemption>();
  myRedemptions.forEach((r) => {
    myRedemptionsMap.set(r.couponId, r);
  });

  // Filtrado de Redenciones para "Mis Cupones" y "Mis Usos"
  const pendingCoupons = myRedemptions; // Todos los cupones que el usuario obtuvo
  const usedRedemptions = myRedemptions.filter((r) => r.status === 'USED'); // Solo los efectivamente canjeados en tienda

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20 text-left">
      
      {/* 1. CABECERA PRINCIPAL CON ESTILO MODERNO */}
      <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/15 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
            Módulo Oficial de Descuentos BONOW
          </span>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2.5">
            {activeTab === 'my-coupons' ? (
              <>
                <FontAwesomeIcon icon={faTicketAlt} className="text-amber-300" /> Mis Cupones Obtenidos
              </>
            ) : activeTab === 'favorites' ? (
              <>
                <FontAwesomeIcon icon={faHeart} className="text-pink-400" /> Mis Cupones Favoritos
              </>
            ) : activeTab === 'redemptions' ? (
              <>
                <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" /> Historial de Usos Realizados
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faGem} className="text-amber-300" /> Catálogo de Cupones y Beneficios
              </>
            )}
          </h1>
          <p className="text-sm text-violet-100 max-w-2xl font-medium">
            {activeTab === 'my-coupons'
              ? 'Aquí encuentras los cupones que has reclamado. Presenta tu código o QR directamente en el establecimiento.'
              : activeTab === 'favorites'
              ? 'Tus promociones y cupones guardados para acceder a ellos rápidamente.'
              : activeTab === 'redemptions'
              ? 'Registro detallado de todas las ofertas que has canjeado en comercios aliados.'
              : 'Explora y reclama promociones 2x1 y descuentos ilimitados de marcas verificadas en México.'}
          </p>
        </div>
      </div>

      {/* 2. RECOMENDACIONES PERSONALIZADAS (Solo en Tab General) */}
      {activeTab === 'all' && <RecommendedCoupons onViewCoupon={(id) => setPreviewModalCoupon(coupons.find(c => c.id === id) || null)} />}

      {/* 3. BARRA DE NAVEGACIÓN ENTRE MÓDULOS / TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => {
              setActiveTab('all');
              router.push('/coupons');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'all' || activeTab === ''
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Todos los Cupones</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('my-coupons');
              router.push('/coupons?filter=my-coupons');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'my-coupons'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Ticket className="h-4 w-4 text-amber-400" />
            <span>Mis Cupones ({pendingCoupons.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('favorites');
              router.push('/coupons?filter=favorites');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
            <span>Favoritos ({favoriteIds.size})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('redemptions');
              router.push('/coupons?filter=redemptions');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'redemptions'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Mis Usos ({usedRedemptions.length})</span>
          </button>
        </div>

        {/* Buscador Rápido (para Tab All) */}
        {activeTab === 'all' && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cupones..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-violet-500"
              />
            </div>
            {categoriesList.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
              >
                <option value="">Todas las Categorías</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </form>
        )}
      </div>

      {/* ALERTAS */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/30">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && !redeemedCode && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* SPINNER CARGANDO */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
        </div>
      )}

      {/* ==================== VISTA 1: TODOS LOS CUPONES DISPONIBLES ==================== */}
      {!loading && (activeTab === 'all' || activeTab === '') && (
        <div>
          {coupons.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 space-y-3">
              <Ticket className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="font-bold text-zinc-700 dark:text-zinc-300">No se encontraron cupones disponibles</h3>
              <p className="text-xs text-zinc-500">Prueba ajustando los filtros de búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => {
                const userRedemption = myRedemptionsMap.get(coupon.id);
                const isObtainedByMe = !!userRedemption;
                
                // Lógica de límites real: Si un cupón se creó para 10 personas y 5 lo han canjeado, aún quedan 5 para otros usuarios
                const usageLimit = coupon.usageLimit;
                const usageCount = coupon.usageCount || 0;
                const remainingUsages = usageLimit !== null && usageLimit !== undefined ? Math.max(0, usageLimit - usageCount) : null;
                const isSoldOut = remainingUsages !== null && remainingUsages <= 0;

                return (
                  <div
                    key={coupon.id}
                    className="group relative overflow-hidden rounded-3xl border-2 border-violet-500/30 bg-gradient-to-br from-[#1d0b30] via-[#121630] to-[#0d1c3a] text-white shadow-xl hover:shadow-2xl hover:border-rose-400 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Barra Superior Gradiente Marca BONOW */}
                    <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-teal-400 shrink-0" />

                    {/* Badge de Descuento */}
                    <div className="absolute top-5 left-4 z-10 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 px-4 py-1.5 text-xs font-black text-white shadow-lg shadow-rose-500/30 border border-white/30">
                      {coupon.discountValue || coupon.discount || 'OFERTA'}
                    </div>

                    {/* Badge de Límite de Usos o Estado */}
                    {isObtainedByMe ? (
                      <div className="absolute top-5 left-28 z-10 rounded-full bg-emerald-500 px-3.5 py-1 text-[9px] font-black text-white uppercase shadow-md flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-white" /> Obtenido
                      </div>
                    ) : isSoldOut ? (
                      <div className="absolute top-5 left-28 z-10 rounded-full bg-red-600 px-3.5 py-1 text-[9px] font-black text-white uppercase shadow-md">
                        Agotado
                      </div>
                    ) : remainingUsages !== null ? (
                      <div className="absolute top-5 right-14 z-10 rounded-full bg-violet-600 px-3 py-1 text-[9px] font-black text-white uppercase shadow-md border border-white/20">
                        {remainingUsages} disponibles ({usageCount}/{usageLimit})
                      </div>
                    ) : null}

                    {/* Botón Favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleToggleFavorite(coupon.id);
                      }}
                      className="absolute top-5 right-4 z-10 rounded-full bg-white/10 p-2 backdrop-blur-md hover:scale-110 transition shadow-md border border-white/20"
                    >
                      <Heart
                        className={`h-4 w-4 transition ${
                          favoriteIds.has(coupon.id) ? 'fill-pink-500 text-pink-500' : 'text-zinc-300 hover:text-pink-500'
                        }`}
                      />
                    </button>

                    {/* Imagen del cupón */}
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

                    {/* Detalle del cupón */}
                    <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest bg-rose-500/20 px-3 py-0.5 rounded-full border border-rose-400/30">
                            {coupon.company?.name || 'Empresa Aliada'}
                          </span>
                          <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1">
                            {coupon.type === 'SINGLE_USE' ? (
                              <>
                                <FontAwesomeIcon icon={faLock} className="mr-0.5" /> Uso Único
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faInfinity} className="mr-0.5" /> Reutilizable
                              </>
                            )}
                          </span>
                        </div>
                        <h3 className="text-base font-black leading-snug text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {coupon.title}
                        </h3>
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                          {coupon.description}
                        </p>
                      </div>

                      <div className="border-t border-white/15 pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            onClick={() => setPreviewModalCoupon(coupon)}
                            className="flex justify-center items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
                          >
                            <Eye className="h-4 w-4 text-amber-300" />
                            <span>Ver Detalle</span>
                          </button>

                          {isObtainedByMe ? (
                            <button
                              onClick={() => {
                                setRedeemedCode(userRedemption?.generatedCode || 'BONOW-RED-OK');
                                setSelectedCoupon(coupon);
                              }}
                              className="flex justify-center items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Ver Código</span>
                            </button>
                          ) : isSoldOut ? (
                            <button
                              disabled
                              className="flex justify-center items-center gap-1 rounded-2xl bg-white/10 py-2.5 text-xs font-bold text-zinc-400 cursor-not-allowed"
                            >
                              <span>Agotado</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => void handleRedeemCoupon(coupon)}
                              className="flex justify-center items-center gap-1.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-violet-600 hover:from-red-600 hover:to-violet-700 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-500/30 transition"
                            >
                              <Award className="h-4 w-4 text-amber-300" />
                              <span>Obtener Cupón</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== VISTA 2: MIS CUPONES (OBTENIDOS POR EL USUARIO) ==================== */}
      {!loading && activeTab === 'my-coupons' && (
        <div>
          {pendingCoupons.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 space-y-3 bg-white dark:bg-zinc-900">
              <Ticket className="mx-auto h-12 w-12 text-amber-500" />
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">Aún no has obtenido ningún cupón</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Explora el catálogo de cupones y reclama tus ofertas favoritas para guardarlas aquí.
              </p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  router.push('/coupons');
                }}
                className="mt-4 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition shadow-lg shadow-violet-600/20"
              >
                Explorar Cupones Disponibles
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingCoupons.map((red) => {
                const c = red.coupon;
                if (!c) return null;

                return (
                  <div
                    key={red.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800">
                          {c.company?.name || 'Empresa Registrada'}
                        </span>
                        <h3 className="text-base font-black text-zinc-900 dark:text-white mt-2 line-clamp-2">
                          {c.title}
                        </h3>
                      </div>
                      <span className="bg-amber-400 text-zinc-950 font-black text-xs px-3 py-1 rounded-xl shadow-sm shrink-0">
                        {c.discountValue || c.discount || 'CUPÓN'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Código de Validación:</span>
                        <span className="text-xs font-mono font-black text-violet-600 dark:text-violet-400">
                          {red.generatedCode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span>Obtenido el:</span>
                        <span>{new Date(red.redeemedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 font-bold">Estado:</span>
                        <span className={`font-black flex items-center gap-1 ${red.status === 'USED' ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {red.status === 'USED' ? (
                            <>
                              <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" /> Canjeado en tienda
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faHourglassHalf} className="text-amber-500" /> Listo para presentar
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setRedeemedCode(red.generatedCode);
                        setSelectedCoupon(c);
                      }}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-xs py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Mostrar QR / Código en Caja</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== VISTA 3: MIS FAVORITOS ==================== */}
      {!loading && activeTab === 'favorites' && (
        <div>
          {favoriteCoupons.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 space-y-3 bg-white dark:bg-zinc-900">
              <Heart className="mx-auto h-12 w-12 text-pink-500 fill-pink-500/20" />
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">No tienes cupones favoritos guardados</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Haz clic en el icono de corazón en cualquier cupón para guardarlo aquí y acceder rápidamente.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteCoupons.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 relative"
                >
                  <button
                    onClick={() => void handleToggleFavorite(c.id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-500 hover:scale-110 transition"
                  >
                    <Heart className="h-4 w-4 fill-pink-500" />
                  </button>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800">
                      {c.company?.name || 'Empresa Aliada'}
                    </span>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white mt-1 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                    <button
                      onClick={() => setPreviewModalCoupon(c)}
                      className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs py-2.5 rounded-xl transition"
                    >
                      Ver Detalle
                    </button>
                    <button
                      onClick={() => void handleRedeemCoupon(c)}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md"
                    >
                      Obtener Cupón
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== VISTA 4: MIS USOS (HISTORIAL CANJEADO EN TIENDA) ==================== */}
      {!loading && activeTab === 'redemptions' && (
        <div>
          {usedRedemptions.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 space-y-3 bg-white dark:bg-zinc-900">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">Aún no has utilizado cupones en tienda</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Cuando presentes tu código o QR en un comercio aliado y el personal lo escanee, tu historial de ahorros aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {usedRedemptions.map((red) => {
                const c = red.coupon;
                return (
                  <div
                    key={red.id}
                    className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          Utilizado en: {c?.company?.name || 'Empresa Aliada'}
                        </span>
                        <h4 className="text-base font-black text-zinc-900 dark:text-white">
                          {c?.title || 'Cupón Canjeado'}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Código de validación: <code className="font-mono text-emerald-600 font-bold">{red.generatedCode}</code>
                        </p>
                      </div>
                    </div>

                    <div className="text-right md:border-l md:border-zinc-100 md:dark:border-zinc-800 md:pl-6">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" /> Canjeado con Éxito
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold block mt-0.5">
                        {red.usedAt
                          ? new Date(red.usedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date(red.redeemedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL CÓDIGO QR / VALIDACIÓN */}
      {redeemedCode && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <span className="text-xs font-black uppercase text-violet-600 tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTicketAlt} className="text-violet-500" /> Cupón Oficial Obtenido
              </span>
              <button
                onClick={() => setRedeemedCode(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                {selectedCoupon.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Presenta este código en <strong className="text-zinc-800 dark:text-zinc-200">{selectedCoupon.company?.name}</strong> para hacer válido tu descuento.
              </p>
            </div>

            {/* Código en caja */}
            <div className="rounded-2xl border-2 border-dashed border-violet-400/60 bg-violet-50/60 p-4 dark:border-violet-700/60 dark:bg-violet-950/30 text-center">
              <p className="text-[10px] uppercase font-black text-violet-700 dark:text-violet-400 tracking-wider">
                Código de Validación Único
              </p>
              <p className="text-2xl font-black text-violet-600 dark:text-violet-300 tracking-wider font-mono mt-1">
                {redeemedCode}
              </p>
            </div>

            <button
              onClick={() => setRedeemedCode(null)}
              className="w-full rounded-2xl bg-violet-600 hover:bg-violet-700 py-3 text-xs font-black text-white transition shadow-lg shadow-violet-600/20"
            >
              Listo, Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA DETALLADA */}
      {previewModalCoupon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalCoupon(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <span className="text-xs font-black uppercase text-violet-600 tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTicketAlt} className="text-violet-500" /> Detalle del Cupón
              </span>
              <button
                onClick={() => setPreviewModalCoupon(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-[#0F1E36] to-slate-950 p-6 text-white shadow-xl relative overflow-hidden space-y-4 border border-violet-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest block">
                    {previewModalCoupon.company?.name || 'BONOW PLATAFORMA'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {previewModalCoupon.title}
                  </h3>
                </div>
                <span className="rounded-2xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-zinc-950 shadow-md">
                  {previewModalCoupon.discountValue || previewModalCoupon.discount || 'DESCUENTO'}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {previewModalCoupon.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                <span className="text-zinc-400 font-semibold">Tipo:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  {previewModalCoupon.type === 'SINGLE_USE' ? (
                    <>
                      <FontAwesomeIcon icon={faLock} className="mr-0.5" /> Uso Único
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faInfinity} className="mr-0.5" /> Reutilizable
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Condiciones:</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                {previewModalCoupon.conditions || 'Válido presentando en caja. Sujeto a disponibilidad en sucursal.'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPreviewModalCoupon(null)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition"
              >
                Cerrar
              </button>

              {!myRedemptionsMap.has(previewModalCoupon.id) ? (
                <button
                  onClick={() => {
                    const c = previewModalCoupon;
                    setPreviewModalCoupon(null);
                    void handleRedeemCoupon(c);
                  }}
                  className="flex-1 rounded-2xl bg-violet-600 py-3 text-xs font-black text-white hover:bg-violet-700 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>Obtener Cupón</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const red = myRedemptionsMap.get(previewModalCoupon.id);
                    const c = previewModalCoupon;
                    setPreviewModalCoupon(null);
                    setRedeemedCode(red?.generatedCode || 'BONOW-RED-OK');
                    setSelectedCoupon(c);
                  }}
                  className="flex-1 rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Ver Mi Código</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function PublicCouponsPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>}>
      <CouponsContent />
    </Suspense>
  );
}
