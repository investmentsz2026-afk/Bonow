'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tag,
  CheckCircle,
  Loader2,
  Save,
  Building2,
  AlertCircle,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Sparkles as SparkleIcon,
  Dumbbell,
  Film,
  HeartPulse,
  ShoppingBag,
  Plane,
  Grid,
  Plus,
  Edit3,
  X,
} from 'lucide-react';

interface PlatformCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
}

interface CompanyData {
  id: string;
  name: string;
  logoUrl?: string | null;
  category?: { id: string; name: string } | null;
  categories?: { id: string; name: string }[] | null;
}

export default function BusinessCategoriesPage() {
  const [platformCategories, setPlatformCategories] = useState<PlatformCategory[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [resCats, resCompany] = await Promise.all([
          fetch('http://localhost:3001/coupons/categories'),
          fetch('http://localhost:3001/companies/my-company', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (resCats.ok) {
          const catsData = await resCats.json();
          if (Array.isArray(catsData)) {
            setPlatformCategories(catsData);
          }
        }

        if (resCompany.ok) {
          const compData = await resCompany.json();
          setCompany(compData);

          const initialSet = new Set<string>();
          if (Array.isArray(compData.categories) && compData.categories.length > 0) {
            compData.categories.forEach((c: any) => initialSet.add(c.id));
          } else if (compData.category?.id) {
            initialSet.add(compData.category.id);
          }

          setSelectedCategoryIds(initialSet);
          // Si no tiene ninguna categoría seleccionada, abrir en modo edición
          if (initialSet.size === 0) {
            setIsEditing(true);
          }
        }
      } catch (e) {
        console.error('Error al cargar categorias de empresa', e);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [router]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveCategories = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const categoryIdsArray = Array.from(selectedCategoryIds);
      const res = await fetch('http://localhost:3001/companies/my-company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryIds: categoryIdsArray,
        }),
      });

      if (res.ok) {
        const updatedComp = await res.json();
        setCompany(updatedComp);
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: '¡Las categorías de tu empresa fueron actualizadas correctamente!',
        });
      } else {
        const errorData = await res.json();
        setMessage({
          type: 'error',
          text: errorData.message || 'No se pudieron guardar las categorías.',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error de conexión al guardar categorías.',
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('restauran') || lower.includes('comida')) return UtensilsCrossed;
    if (lower.includes('caf')) return Coffee;
    if (lower.includes('hotel')) return Hotel;
    if (lower.includes('belleza') || lower.includes('spa')) return SparkleIcon;
    if (lower.includes('gimnas')) return Dumbbell;
    if (lower.includes('entreten') || lower.includes('cine')) return Film;
    if (lower.includes('salud')) return HeartPulse;
    if (lower.includes('tienda') || lower.includes('compr')) return ShoppingBag;
    if (lower.includes('viaj')) return Plane;
    return Tag;
  };

  // Obtener la lista de categorías seleccionadas activas
  const activeCategories = platformCategories.filter((cat) => selectedCategoryIds.has(cat.id));

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 text-left">
      {/* Banner de Cabecera */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl border border-slate-800">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-400 shadow-md">
              <Tag className="h-4 w-4 text-red-400" />
              Perfil Comercial de Empresa
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              Categorías de Mi Empresa
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Administra los giros o rubros comerciales a los que pertenece tu empresa. Los clientes podrán encontrar tus ofertas fácilmente al filtrar por estas categorías.
            </p>
          </div>

          {company && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black text-lg flex items-center justify-center overflow-hidden border border-white/30">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  company.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase text-white">{company.name}</p>
                <p className="text-[10px] text-amber-300 font-bold uppercase">
                  {selectedCategoryIds.size} Categoría(s) Activa(s)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Mensaje */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-bold shadow-md transition border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Cargando categorías de tu empresa...
          </p>
        </div>
      ) : !isEditing ? (
        /* VISTA DE CATEGORÍAS SELECCIONADAS GUARDADAS */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Mis Categorías Asignadas ({activeCategories.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Estas son las categorías actuales con las que tu empresa aparece en la plataforma BONOW.
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 px-5 py-3 text-xs font-black uppercase text-white shadow-lg shadow-red-500/25 transition-all transform hover:scale-105 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Seleccionar / Agregar Más Categorías</span>
            </button>
          </div>

          {activeCategories.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-12 text-center text-slate-500 space-y-3">
              <Tag className="mx-auto h-10 w-10 text-slate-400" />
              <p className="text-xs font-black uppercase tracking-wider">
                Aún no has seleccionado ninguna categoría para tu empresa.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-600"
              >
                <Plus className="h-4 w-4" /> Seleccionar Categorías
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCategories.map((cat) => {
                const IconComp = getCategoryIcon(cat.name);
                return (
                  <div
                    key={cat.id}
                    className="bg-white dark:bg-zinc-900 border-2 border-red-500/80 rounded-3xl p-5 shadow-lg shadow-red-500/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <IconComp className="h-6 w-6" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ Asignada & Activa
                        </span>
                      </div>
                    </div>

                    <CheckCircle className="h-6 w-6 text-red-500" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* MODAL / SECCIÓN PARA SELECCIONAR Y AGREGAR CATEGORÍAS DE LA PLATAFORMA */
        <div className="space-y-6 bg-slate-50 dark:bg-zinc-950 p-6 md:p-8 rounded-3xl border-2 border-slate-200 dark:border-zinc-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Grid className="h-5 w-5 text-red-500" />
                Seleccionar Categorías de la Plataforma ({platformCategories.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Marca o desmarca las categorías que apliquen a tu empresa y haz clic en guardar.
              </p>
            </div>

            {selectedCategoryIds.size > 0 && (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          {/* Grid de Selección */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformCategories.map((cat) => {
              const isSelected = selectedCategoryIds.has(cat.id);
              const IconComp = getCategoryIcon(cat.name);

              return (
                <div
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`group relative rounded-3xl p-5 border-2 transition-all duration-300 cursor-pointer flex items-center justify-between select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent border-red-500 shadow-xl shadow-red-500/10 dark:bg-red-950/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                        isSelected
                          ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/30'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>

                    <div className="text-left space-y-0.5">
                      <h3
                        className={`font-black text-sm uppercase tracking-tight ${
                          isSelected
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {cat.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400">
                        {isSelected ? '✓ Seleccionada' : 'Clic para seleccionar'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                      isSelected
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-slate-300 dark:border-zinc-700'
                    }`}
                  >
                    {isSelected && <CheckCircle className="h-4 w-4" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Acciones de Guardar / Cancelar */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800">
            {selectedCategoryIds.size > 0 ? (
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Volver a mis categorías
              </button>
            ) : <div />}

            <button
              onClick={handleSaveCategories}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 px-8 py-4 text-xs font-black uppercase text-white shadow-xl shadow-red-500/25 transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar Categorías Seleccionadas</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
