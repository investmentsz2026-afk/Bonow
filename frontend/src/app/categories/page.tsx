'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Coffee,
  Hotel,
  Sparkle,
  Dumbbell,
  Film,
  HeartPulse,
  ShoppingBag,
  Plane,
  Sparkles,
  ArrowRight,
  Loader2,
  Tag,
  CheckCircle,
  Building2,
  Save,
  Check,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface CompanyData {
  id: string;
  name: string;
  corporateName: string;
  categoryId?: string | null;
  category?: CategoryItem | null;
  categories?: CategoryItem[];
}

const renderCategoryIcon = (iconNameOrEmoji?: any, name?: string) => {
  if (typeof iconNameOrEmoji === 'string' && iconNameOrEmoji.trim()) {
    if (/\p{Extended_Pictographic}/u.test(iconNameOrEmoji)) {
      return <span className="text-3xl">{iconNameOrEmoji}</span>;
    }
  }
  const lower = (name || '').toLowerCase();
  if (
    lower.includes('restauran') ||
    lower.includes('comida') ||
    lower.includes('gastronom')
  ) {
    return <UtensilsCrossed className="h-7 w-7 text-white" />;
  }
  if (lower.includes('café') || lower.includes('cafeter')) {
    return <Coffee className="h-7 w-7 text-white" />;
  }
  if (lower.includes('hotel') || lower.includes('hosped')) {
    return <Hotel className="h-7 w-7 text-white" />;
  }
  if (
    lower.includes('belleza') ||
    lower.includes('spa') ||
    lower.includes('estétic')
  ) {
    return <Sparkle className="h-7 w-7 text-white" />;
  }
  if (
    lower.includes('gimnasio') ||
    lower.includes('fitness') ||
    lower.includes('sport')
  ) {
    return <Dumbbell className="h-7 w-7 text-white" />;
  }
  if (
    lower.includes('cine') ||
    lower.includes('entretenim') ||
    lower.includes('divers')
  ) {
    return <Film className="h-7 w-7 text-white" />;
  }
  if (
    lower.includes('salud') ||
    lower.includes('médic') ||
    lower.includes('clínic')
  ) {
    return <HeartPulse className="h-7 w-7 text-white" />;
  }
  if (
    lower.includes('tienda') ||
    lower.includes('compras') ||
    lower.includes('moda')
  ) {
    return <ShoppingBag className="h-7 w-7 text-white" />;
  }
  if (
    lower.includes('viaje') ||
    lower.includes('turismo') ||
    lower.includes('vuelo')
  ) {
    return <Plane className="h-7 w-7 text-white" />;
  }
  return <Sparkles className="h-7 w-7 text-white" />;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBusiness, setIsBusiness] = useState(false);
  const [myCompany, setMyCompany] = useState<CompanyData | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
    const init = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        let userRole = '';
        if (storedUser) {
          const u = JSON.parse(storedUser);
          userRole = u.role || '';
        }

        const isBiz = userRole === 'BUSINESS';
        setIsBusiness(isBiz);

        // Cargar lista maestra de categorías del sistema
        const resCat = await fetch(
          'http://localhost:3001/coupons/categories/list',
        );
        if (resCat.ok) {
          const dataCat = await resCat.json();
          if (Array.isArray(dataCat)) {
            setCategories(dataCat);
          }
        }

        // Si es empresa, obtener datos de su empresa para cargar las categorías asignadas
        if (isBiz && token) {
          const resComp = await fetch(
            'http://localhost:3001/companies/my-company',
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (resComp.ok) {
            const dataComp: CompanyData = await resComp.json();
            setMyCompany(dataComp);

            // Obtener arreglos de IDs de categorías asignadas
            let assignedIds: string[] = [];
            if (dataComp.categories && dataComp.categories.length > 0) {
              assignedIds = dataComp.categories.map((c) => c.id);
            } else if (dataComp.categoryId) {
              assignedIds = [dataComp.categoryId];
            }
            setSelectedCategoryIds(assignedIds);
          }
        }
      } catch {
        // Silencioso
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  const toggleCategorySelection = (catId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(catId)) {
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleSaveCompanyCategories = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !myCompany) return;

    if (selectedCategoryIds.length === 0) {
      alert('Por favor selecciona al menos una categoría para tu empresa.');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('http://localhost:3001/companies/my-company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryIds: selectedCategoryIds,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al guardar categorías de la empresa');
      }

      setSuccessMsg('✅ Categorías de tu empresa actualizadas correctamente.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/40 text-zinc-900 py-12 px-6">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* VISTA 1: SI EL USUARIO ES UNA EMPRESA (BUSINESS) */}
        {isBusiness ? (
          <div className="space-y-8 text-left">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase tracking-wider">
                <Building2 className="h-4 w-4" />
                <span>PANEL DE EMPRESA • CONFIGURACIÓN DE RUBRO</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                ¿A qué categoría(s) pertenece tu empresa?
              </h1>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium max-w-3xl">
                Selecciona una o varias categorías oficiales agregadas por el
                Administrador. Tus cupones, promociones y sucursales aparecerán
                clasificados bajo los rubros que selecciones.
              </p>

              {myCompany && (
                <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 px-4 py-2 rounded-2xl text-xs font-bold text-violet-800 dark:text-violet-300">
                  <Building2 className="h-4 w-4 text-violet-600" />
                  <span>Empresa: {myCompany.name}</span>
                </div>
              )}
            </div>

            {successMsg && (
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-4 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button
                  onClick={() => setSuccessMsg(null)}
                  className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Grid de Selección de Categorías para Empresa */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                    Selecciona los Rubros de Tu Empresa (
                    {selectedCategoryIds.length} seleccionadas)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Presiona en una categoría para activarla o desactivarla.
                    Puedes modificar tus opciones más adelante cuando lo
                    requieras.
                  </p>
                </div>

                <button
                  disabled={saving}
                  onClick={handleSaveCompanyCategories}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-xs font-black uppercase text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 cursor-pointer shrink-0"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar Categorías de Mi Empresa</span>
                    </>
                  )}
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
                  <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Cargando categorías oficiales...
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`group relative rounded-3xl border p-5 cursor-pointer transition-all duration-200 flex items-center justify-between space-x-3 select-none ${
                          isSelected
                            ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/30 shadow-md ring-2 ring-violet-500/20'
                            : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 hover:border-violet-400'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 transition ${
                              isSelected
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {renderCategoryIcon(cat.icon, cat.name)}
                          </div>

                          <div className="min-w-0">
                            <h4
                              className={`font-black text-sm uppercase tracking-wide truncate ${
                                isSelected
                                  ? 'text-violet-900 dark:text-violet-200'
                                  : 'text-zinc-900 dark:text-white'
                              }`}
                            >
                              {cat.name}
                            </h4>
                            <span className="text-[10px] font-bold text-zinc-400 block">
                              {isSelected
                                ? '✓ Seleccionada'
                                : 'Haz clic para seleccionar'}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center border transition ${
                            isSelected
                              ? 'border-violet-600 bg-violet-600 text-white'
                              : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-4 w-4 stroke-[3]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VISTA 2: CLIENTES / USUARIOS NORMALES Y VISITANTES */
          <>
            {/* Cabecera Principal */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-200/80 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-violet-700 shadow-sm backdrop-blur-md">
                <Tag className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
                Catálogo Oficial de Beneficios
              </span>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-900">
                EXPLORA POR CATEGORÍAS
              </h1>
              <p className="text-sm md:text-base text-zinc-600 font-medium">
                Encuentra los mejores descuentos 2x1 y ofertas exclusivas
                organizados en tus rubros favoritos en todo México.
              </p>
            </div>

            {/* Carga o Grid Moderno de Categorías */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Cargando categorías...
                </p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() =>
                      navigateOrLogin(`/coupons?categoryId=${cat.id}`)
                    }
                    className="group relative rounded-3xl bg-white border border-zinc-200/80 p-6 shadow-sm hover:shadow-xl hover:border-violet-400 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 overflow-hidden"
                  >
                    {/* Badge Superior */}
                    <div className="flex justify-between items-center z-10">
                      <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                        🔥 Hasta 50% OFF
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                        {cat.slug}
                      </span>
                    </div>

                    {/* Ícono Centrado */}
                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-4 z-10">
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25 border border-white/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        {renderCategoryIcon(cat.icon, cat.name)}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-wider text-zinc-900 group-hover:text-violet-600 transition duration-300">
                          {cat.name}
                        </h3>
                        <p className="text-xs font-bold text-zinc-500">
                          Descuentos disponibles
                        </p>
                      </div>
                    </div>

                    {/* Botón CTA Inferior */}
                    <div className="pt-2 z-10">
                      <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-black uppercase tracking-wider text-zinc-950 hover:from-amber-400 hover:to-orange-400 transition shadow-md shadow-amber-500/20 group-hover:scale-[1.02]">
                        <span>Explorar</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Banner Inferior */}
            <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 md:p-10 text-center space-y-4 shadow-xl text-white">
              <h2 className="text-2xl font-black uppercase tracking-wide">
                ¿Buscas una categoría específica o tu negocio favorito?
              </h2>
              <p className="text-xs md:text-sm text-violet-100 max-w-2xl mx-auto font-medium">
                Explora nuestro catálogo completo con filtros avanzados de
                búsqueda, ubicación y tipo de cupón.
              </p>
              <button
                onClick={() => navigateOrLogin('/coupons')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-violet-900 font-black text-xs px-6 py-3 uppercase tracking-wider hover:bg-zinc-100 transition shadow-lg cursor-pointer"
              >
                <span>Ver Todos los Cupones</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
