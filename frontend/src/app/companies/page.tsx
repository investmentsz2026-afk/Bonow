'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Ticket,
  MapPin,
  Sparkles,
  X,
  Phone,
  Mail,
  Globe,
  Tag,
  Award,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface CompanyPromo {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  discount?: string;
}

interface CompanyCoupon {
  id: string;
  title: string;
  description?: string;
  discount?: string;
  imageUrl?: string;
  category?: string;
}

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
  categoriesList?: string[];
  couponsCount?: number;
  promotions?: CompanyPromo[];
  coupons?: CompanyCoupon[];
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<Company | null>(null);

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
    const fetchCompanies = async () => {
      try {
        const res = await fetch(
          'http://localhost:3001/coupons/companies/public',
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Filtrar activamente cualquier posible empresa del sistema
            const filtered = data.filter(
              (c: Company) =>
                c.name.toUpperCase() !== 'BONOW' &&
                c.name.toUpperCase() !== 'WYNNI' &&
                !c.corporateName?.toUpperCase().includes('BONOW'),
            );
            setCompanies(filtered);
          }
        } else {
          // Fallback a coupons
          const resCoupons = await fetch('http://localhost:3001/coupons');
          if (resCoupons.ok) {
            const couponsData = await resCoupons.json();
            if (Array.isArray(couponsData)) {
              const uniqueMap = new Map<string, Company>();
              couponsData.forEach((c: any) => {
                if (
                  c.company &&
                  c.company.name.toUpperCase() !== 'BONOW' &&
                  c.company.name.toUpperCase() !== 'WYNNI' &&
                  !uniqueMap.has(c.company.name)
                ) {
                  uniqueMap.set(c.company.name, {
                    id: c.companyId || c.id,
                    name: c.company.name,
                    logoUrl: c.company.logoUrl,
                    description:
                      'Comercio aliado oficial verificado por BONOW.',
                    status: 'APPROVED',
                    category: c.category,
                    categoriesList: c.category?.name ? [c.category.name] : ['Comercio Aliado'],
                  });
                }
              });
              setCompanies(Array.from(uniqueMap.values()));
            }
          }
        }
      } catch {
        // Silencioso
      } finally {
        setLoading(false);
      }
    };
    void fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) => {
    const matchesName = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      (c.category?.name && c.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.categoriesList && c.categoriesList.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesName || matchesCat;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-16 text-left">
      {/* Header Institucional */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F1E36] via-slate-900 to-[#0F1E36] p-8 md:p-10 text-white shadow-2xl border border-slate-800">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-400 shadow-md">
              <ShieldCheck className="h-4 w-4 text-red-400" />
              Directorio Comercial Verificado
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
              EMPRESAS & MARCAS ALIADAS
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium">
              Conoce las marcas y establecimientos participantes donde puedes redimir tus cupones y beneficios 2x1 en México.
            </p>
          </div>

          {/* Buscador Integrado en Header */}
          <div className="w-full md:w-80 shrink-0 relative z-10">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o categoría..."
                className="w-full rounded-2xl border-2 border-slate-700 bg-slate-950/80 px-4 py-3 pl-11 text-xs font-bold text-white placeholder-slate-400 outline-none focus:border-red-500 transition shadow-inner backdrop-blur-md"
              />
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Empresas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Cargando directorio comercial verificado...
          </p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-zinc-900/60 p-12 text-center text-slate-500 shadow-sm space-y-3">
          <Building2 className="mx-auto h-10 w-10 text-slate-400" />
          <p className="text-xs font-black uppercase tracking-wider">
            No se encontraron empresas aliadas para tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Comercios Aliados Activos ({filteredCompanies.length})
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" /> 100% Verificados
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((comp) => {
              const cats = comp.categoriesList && comp.categoriesList.length > 0
                ? comp.categoriesList
                : comp.category?.name
                ? [comp.category.name]
                : [];

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompanyModal(comp)}
                  className="group bg-white dark:bg-zinc-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:border-red-400/60 transition duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-black text-xl overflow-hidden shadow-lg border-2 border-white shrink-0">
                        {comp.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={comp.logoUrl}
                            alt={comp.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          comp.name.substring(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="space-y-1 text-left min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-base uppercase text-slate-900 dark:text-white group-hover:text-red-500 transition truncate">
                            {comp.name}
                          </h3>
                          <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                        </div>

                        {cats.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cats.slice(0, 2).map((catName) => (
                              <span
                                key={catName}
                                className="inline-block rounded-full bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 px-2.5 py-0.5 text-[9px] font-black uppercase"
                              >
                                {catName}
                              </span>
                            ))}
                            {cats.length > 2 && (
                              <span className="text-[9px] font-black text-slate-400">
                                +{cats.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 text-left font-medium leading-relaxed">
                      {comp.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                      <span className="flex items-center gap-1 text-red-500">
                        <Ticket className="h-3.5 w-3.5" />
                        {comp.couponsCount || comp.coupons?.length || 0} Cupones / Promos
                      </span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" /> Validez Directa
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCompanyModal(comp);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 py-3.5 text-xs font-black uppercase text-white shadow-lg shadow-red-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Ver Perfil & Ofertas</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DETALLES DE EMPRESA (CON CATEGORÍAS, PROMOCIONES Y CUPONES) */}
      {selectedCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-2xl text-left space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedCompanyModal(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-white transition"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Cabecera del Modal */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2 border-b border-slate-100 dark:border-zinc-800 pb-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-black text-2xl overflow-hidden shadow-xl border-2 border-white shrink-0">
                {selectedCompanyModal.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedCompanyModal.logoUrl}
                    alt={selectedCompanyModal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedCompanyModal.name.substring(0, 2).toUpperCase()
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
                    {selectedCompanyModal.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Empresa Verificada
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedCompanyModal.description ||
                    'Comercio aliado oficial verificado por la red de beneficios BONOW.'}
                </p>

                {/* Categorías Asignadas */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <Tag className="h-3 w-3 text-red-500" /> Categorías:
                  </span>
                  {(selectedCompanyModal.categoriesList || [selectedCompanyModal.category?.name || 'Comercio Aliado']).map((catName) => (
                    <span
                      key={catName}
                      className="rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 px-3 py-1 text-[10px] font-black uppercase shadow-xs"
                    >
                      {catName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Datos de Contacto */}
            {(selectedCompanyModal.phone || selectedCompanyModal.email || selectedCompanyModal.website) && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                {selectedCompanyModal.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-red-500" />
                    <span>{selectedCompanyModal.phone}</span>
                  </div>
                )}
                {selectedCompanyModal.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-red-500" />
                    <span>{selectedCompanyModal.email}</span>
                  </div>
                )}
                {selectedCompanyModal.website && (
                  <a
                    href={selectedCompanyModal.website.startsWith('http') ? selectedCompanyModal.website : `https://${selectedCompanyModal.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{selectedCompanyModal.website}</span>
                  </a>
                )}
              </div>
            )}

            {/* SECCIÓN DE PROMOCIONES DE LA EMPRESA */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2 tracking-wider">
                <Flame className="h-5 w-5 text-rose-500" />
                Promociones de la Empresa ({(selectedCompanyModal.promotions || []).length})
              </h3>

              {!selectedCompanyModal.promotions || selectedCompanyModal.promotions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 text-center text-xs text-slate-400 font-medium">
                  Esta empresa aún no cuenta con promociones especiales de temporada activas.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedCompanyModal.promotions.map((promo) => (
                    <div
                      key={promo.id}
                      onClick={() => {
                        setSelectedCompanyModal(null);
                        navigateOrLogin('/promotions');
                      }}
                      className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-red-400 transition cursor-pointer"
                    >
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md inline-block">
                          {promo.discount || 'PROMOCIÓN'}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                          {promo.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {promo.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black text-red-500 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                        <span>Ver Promoción</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN DE CUPONES DISPONIBLES */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2 tracking-wider">
                <Award className="h-5 w-5 text-amber-500" />
                Cupones Exclusivos Disponibles ({(selectedCompanyModal.coupons || []).length})
              </h3>

              {!selectedCompanyModal.coupons || selectedCompanyModal.coupons.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 text-center text-xs text-slate-400 font-medium">
                  Esta empresa actualmente no tiene cupones de descuento vigentes.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedCompanyModal.coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      onClick={() => {
                        setSelectedCompanyModal(null);
                        navigateOrLogin('/coupons');
                      }}
                      className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-amber-400 transition cursor-pointer"
                    >
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md inline-block">
                          {coupon.discount || 'DESCUENTO'}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                          {coupon.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {coupon.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black text-amber-600 dark:text-amber-400 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                        <span>Obtener Cupón</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
