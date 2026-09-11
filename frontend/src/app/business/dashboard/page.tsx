'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Clock,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  Star,
  ChevronRight,
  Bell,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Eye,
  Edit,
  Trash2,
  X,
  QrCode,
  Ticket,
  Check,
  Scan,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import InteractiveMapPicker from '@/components/InteractiveMapPicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faFlagCheckered,
  faMapMarkerAlt,
  faClock,
  faMapMarkedAlt,
} from '@fortawesome/free-solid-svg-icons';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  schedules: string | null;
  categories?: { id: string; name: string }[];
}

interface Coupon {
  id: string;
  title: string;
  discountValue?: string;
  discount?: string;
  endDate: string;
  isActive?: boolean;
  type: string;
  status?: string;
  usageCount?: number;
  usageLimit?: number | null;
  _count?: {
    redemptions: number;
  };
}

interface Company {
  id: string;
  name: string;
  corporateName: string;
  rfc: string;
  logoUrl: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  } | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  branches: Branch[];
  coupons?: Coupon[];
  owner?: {
    id: string;
    email: string;
    membership?: {
      type: string;
      status: string;
      price: string | number;
      startDate: string;
      endDate: string;
    } | null;
  };
}

export default function BusinessDashboard() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Company Profile Edit State
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    corporateName: '',
    rfc: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    description: '',
  });

  const handleOpenEditCompanyModal = () => {
    if (!company) return;
    setCompanyForm({
      name: company.name || '',
      corporateName: company.corporateName || '',
      rfc: company.rfc || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      facebook: company.socialLinks?.facebook || '',
      instagram: company.socialLinks?.instagram || '',
      description: company.description || '',
    });
    setShowEditCompanyModal(true);
  };

  const handleSaveCompany = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setSavingCompany(true);
    try {
      const res = await fetch('http://localhost:3001/companies/my-company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: companyForm.name,
          corporateName: companyForm.corporateName,
          rfc: companyForm.rfc,
          phone: companyForm.phone,
          email: companyForm.email,
          website: companyForm.website,
          socialLinks: {
            facebook: companyForm.facebook,
            instagram: companyForm.instagram,
          },
          description: companyForm.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar cambios');

      setCompany((prev) => (prev ? { ...prev, ...data } : null));
      setShowEditCompanyModal(false);
      alert('¡Datos de la empresa actualizados correctamente!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSavingCompany(false);
    }
  };

  // Business Branch Modal State
  const [showBusinessBranchModal, setShowBusinessBranchModal] = useState(false);
  const [savingBusinessBranch, setSavingBusinessBranch] = useState(false);
  const [allCategories, setAllCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [branchForm, setBranchForm] = useState({
    id: '',
    name: '',
    address: '',
    city: 'Ciudad de México',
    state: 'CDMX',
    latitude: '19.432608',
    longitude: '-99.133209',
    schedules: 'Lun - Dom: 09:00 - 22:00',
    categoryIds: [] as string[],
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(
          'http://localhost:3001/coupons/categories/list',
        );
        if (res.ok) {
          const data = await res.json();
          setAllCategories(data);
        }
      } catch {
        // Silencioso
      }
    };
    void fetchCats();
  }, []);

  const handleSaveBusinessBranch = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !branchForm.name || !branchForm.address) return;
    setSavingBusinessBranch(true);
    try {
      const isEdit = !!branchForm.id;
      const url = isEdit
        ? `http://localhost:3001/companies/my-company/branches/${branchForm.id}`
        : 'http://localhost:3001/companies/my-company/branches';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: branchForm.name,
          address: branchForm.address,
          city: branchForm.city || 'Ciudad de México',
          state: branchForm.state || 'CDMX',
          latitude: parseFloat(branchForm.latitude) || 19.432608,
          longitude: parseFloat(branchForm.longitude) || -99.133209,
          schedules: branchForm.schedules,
          categoryIds: branchForm.categoryIds,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar sucursal');

      setShowBusinessBranchModal(false);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingBusinessBranch(false);
    }
  };

  const handleDeleteBusinessBranch = async (branchId: string) => {
    if (!confirm('¿Deseas eliminar esta sucursal del mapa?')) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:3001/companies/my-company/branches/${branchId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      alert('Error al eliminar sucursal');
    }
  };

  // Coupon Validation State (Scanner & Manual Code Entry)
  const [validationCodeInput, setValidationCodeInput] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidateCouponCode = async (codeToValidate?: string) => {
    const code = codeToValidate || validationCodeInput.trim();
    if (!code) {
      setValidationError(
        'Por favor ingresa o escanea un código de canje válido',
      );
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setValidatingCode(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      const res = await fetch('http://localhost:3001/coupons/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Código inválido o ya canjeado');

      setValidationResult(data);
      setValidationCodeInput('');
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Error al validar el código',
      );
    } finally {
      setValidatingCode(false);
    }
  };

  const [realRedemptions, setRealRedemptions] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCompanyData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/companies/my-company', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          router.push('/business/register');
          return;
        }

        if (res.status === 401) {
          localStorage.clear();
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al obtener datos');

        // Obtener cupones completos de la empresa
        const resCoupons = await fetch('http://localhost:3001/coupons/business/my-coupons', {
          headers: { Authorization: `Bearer ${token}` },
        });
        let coupons: Coupon[] = [];
        if (resCoupons.ok) {
          coupons = await resCoupons.json();
        }

        // Obtener redenciones reales de la empresa en caja
        const resRedemptions = await fetch('http://localhost:3001/coupons/business/redemptions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        let redemptionsData: any[] = [];
        if (resRedemptions.ok) {
          redemptionsData = await resRedemptions.json();
        }

        if (isMounted) {
          setCompany({ ...data, coupons } as Company);
          setRealRedemptions(Array.isArray(redemptionsData) ? redemptionsData : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al conectar');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadCompanyData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
        <h3 className="font-bold">Error al cargar el panel corporativo</h3>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-red-650 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const activeCouponsCount =
    company?.coupons?.filter((c) => c.isActive).length || 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 text-left">
      {/* CABECERA: BIENVENIDA EMPRESARIAL */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block">
            MODO EMPRESARIAL • PANORAMA EN TIEMPO REAL
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5 mt-0.5">
            <span>¡Hola, {company?.name || 'Empresa'}!</span> <FontAwesomeIcon icon={faBuilding} className="text-red-500 text-2xl" />
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Punto de Canje en Caja, Validación de Códigos y Rendimiento de Ofertas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/coupons"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition shadow-sm"
          >
            <Eye className="h-4 w-4 text-red-500" />
            <span>Ver página pública ↗</span>
          </Link>

          <Link
            href="/business/company"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 text-xs font-black hover:opacity-90 transition shadow-md"
          >
            <Building2 className="h-4 w-4" />
            <span>Mi Empresa</span>
          </Link>
        </div>
      </div>

      {/* 1. SECCIÓN PRINCIPAL DESTACADA: VALIDADOR DE CUPONES EN CAJA EN VIVO */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-zinc-900 to-[#0F1E36] p-6 md:p-8 text-white shadow-2xl border border-zinc-800 space-y-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0">
              <Ticket className="h-7 w-7 animate-pulse text-amber-300" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                PUNTO DE VENTA / CAJA FÍSICA EN VIVO
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                Validador y Canje de Cupones
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-md font-medium">
            Ingresa o escanea el código presentado por el cliente en caja para procesar la validación y aplicar la oferta.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6 items-center">
          {/* Formulario de Código */}
          <div className="md:col-span-8 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Código del Cliente (Ejemplo: BONOW-RED-A9F32)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={validationCodeInput}
                  onChange={(e) =>
                    setValidationCodeInput(e.target.value.toUpperCase())
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleValidateCouponCode();
                    }
                  }}
                  placeholder="BONOW-RED-XXXXX"
                  className="w-full rounded-2xl border-2 border-red-500/40 bg-zinc-950 px-4 py-4 text-lg font-mono font-black text-white uppercase tracking-widest outline-none focus:border-red-500 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => {
                    const sample = prompt(
                      'Escanear QR / Simular lector de código QR (Ingresa código alfanumérico):',
                    );
                    if (sample) {
                      setValidationCodeInput(sample.toUpperCase());
                      void handleValidateCouponCode(sample.toUpperCase());
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-2.5 text-amber-300 hover:bg-white/20 hover:scale-105 transition cursor-pointer"
                  title="Escanear Código QR con Cámara"
                >
                  <Scan className="h-6 w-6" />
                </button>
              </div>

              <button
                type="button"
                disabled={validatingCode}
                onClick={() => void handleValidateCouponCode()}
                className="rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-sm px-8 py-4 transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 uppercase tracking-wider"
              >
                {validatingCode ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Validando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Validar Cupón</span>
                  </>
                )}
              </button>
            </div>

            {validationError && (
              <div className="rounded-2xl bg-red-950/60 border border-red-500/40 p-4 text-xs font-bold text-red-300 flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                <span>{validationError}</span>
              </div>
            )}

            {validationResult && (
              <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/50 p-5 text-white space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-black text-emerald-400 uppercase text-xs">
                  <CheckCircle className="h-5 w-5" />
                  <span>¡CUPÓN VALIDADO Y CANJEADO CON ÉXITO!</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Cliente</span>
                    <span className="font-bold text-white">{validationResult.user?.firstName} {validationResult.user?.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Oferta Aplicada</span>
                    <span className="font-bold text-amber-300">{validationResult.coupon?.title} ({validationResult.coupon?.discount})</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Caja Informativa de Ayuda */}
          <div className="md:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-2 text-left">
            <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
              <QrCode className="h-4 w-4 text-amber-300" />
              <span>Instrucciones para Caja</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              1. Solicita al cliente su cupón digital en pantalla o su código alfanumérico.<br />
              2. Escribe o escanea el código en la caja de texto.<br />
              3. Al dar clic en <strong>Validar</strong>, la oferta se registra como canjeada.
            </p>
          </div>
        </div>
      </div>

      {(() => {
        const allCompanyCoupons = company?.coupons || [];

        const activeCouponsList = allCompanyCoupons.filter((c: any) => {
          const isExhausted = c.usageLimit !== null && c.usageLimit !== undefined && c.usageLimit > 0 && (c.usageCount ?? 0) >= c.usageLimit;
          const isExpired = new Date(c.endDate) < new Date();
          return c.status === 'ACTIVE' && !isExhausted && !isExpired;
        });

        const exhaustedCouponsList = allCompanyCoupons.filter((c: any) => {
          const isExhausted = c.usageLimit !== null && c.usageLimit !== undefined && c.usageLimit > 0 && (c.usageCount ?? 0) >= c.usageLimit;
          return isExhausted;
        });

        const totalRedemptionsCount = realRedemptions.length > 0 
          ? realRedemptions.length 
          : allCompanyCoupons.reduce((sum: number, c: any) => sum + (c.usageCount || c._count?.redemptions || 0), 0);

        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Canjes Totales en Caja
                </span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white">
                  {totalRedemptionsCount}
                </div>
                <span className="text-[10px] font-bold text-emerald-600 block">
                  Clientes registrados via BONOW
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Ofertas Activas
                </span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white">
                  {activeCouponsList.length}
                </div>
                <Link href="/business/coupons" className="text-[10px] font-bold text-violet-600 hover:underline block">
                  Administrar cupones →
                </Link>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Sucursales en Mapa
                </span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white">
                  {company?.branches?.length || 0}
                </div>
                <Link href="/business/company" className="text-[10px] font-bold text-red-600 hover:underline block">
                  Ver sucursales →
                </Link>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Estado de Membresía / Créditos
                </span>
                <div className="text-base font-black text-amber-500 font-mono">
                  {company?.owner?.membership ? 'MEMBRESÍA ACTIVA' : 'PLAN CRÉDITOS'}
                </div>
                <Link href="/dashboard/membership" className="text-[10px] font-bold text-zinc-500 hover:underline block">
                  Adquirir créditos / plan →
                </Link>
              </div>
            </div>

            {/* 3. ACCIONES RÁPIDAS Y CANJES RECIENTES */}
            <div className="grid md:grid-cols-12 gap-6 items-start">
              {/* Canjes Recientes */}
              <div className="md:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-black text-zinc-900 dark:text-white text-base uppercase flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-500" />
                    Últimos Canjes Procesados en Caja
                  </h3>
                  <span className="text-xs text-zinc-400 font-bold">Actividad Reciente</span>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {realRedemptions.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Ticket className="h-8 w-8 text-zinc-400 mx-auto stroke-1" />
                      <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">No hay canjes procesados en caja aún.</p>
                      <p className="text-[10px] text-zinc-400 font-medium max-w-sm mx-auto">
                        Cuando los clientes presenten su cupón en tu establecimiento y lo valides en el cuadro superior, aparecerá registrado aquí en tiempo real.
                      </p>
                    </div>
                  ) : (
                    realRedemptions.map((red) => {
                      const userName = `${red.user?.firstName || 'Usuario'} ${red.user?.lastName || ''}`.trim();
                      const code = red.generatedCode || 'N/A';
                      const couponTitle = red.coupon?.title || 'Cupón Redimido';
                      const timeStr = new Date(red.redeemedAt || red.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <div key={red.id} className="py-3 flex items-center justify-between text-left">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {userName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-zinc-850 dark:text-white">{userName}</h4>
                              <p className="text-[10px] text-zinc-400 font-medium">
                                {couponTitle} • Código: <span className="font-mono text-amber-500 font-bold">{code}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[9px] font-black uppercase">
                              CANJEADO
                            </span>
                            <p className="text-[9px] text-zinc-400 mt-0.5 font-medium">{timeStr}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Acciones Comerciales */}
              <div className="md:col-span-4 bg-[#0B132B] text-white rounded-3xl p-6 shadow-xl space-y-4 text-left border border-slate-800">
                <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Acciones Comerciales
                </h3>

                <div className="space-y-2.5">
                  <button
                    onClick={() => router.push('/business/coupons')}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-2">
                      <Plus className="h-4 w-4 text-violet-400" />
                      Crear Nuevo Cupón
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-white">›</span>
                  </button>

                  <button
                    onClick={() => router.push('/business/coupons')}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-400" />
                      Publicar Promoción
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-white">›</span>
                  </button>

                  <button
                    onClick={() => router.push('/business/company')}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-400" />
                      Administrar Mi Empresa
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-white">›</span>
                  </button>

                  <button
                    onClick={() => router.push('/business/coupons')}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Ver Reportes de Ventas
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-white">›</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN: TUS CUPONES ACTIVOS */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-zinc-850 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-emerald-500" />
                  <span>Tus cupones activos ({activeCouponsList.length})</span>
                </h2>
                <Link
                  href="/business/coupons"
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Ver todos →
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeCouponsList.slice(0, 3).map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl overflow-hidden p-5 flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-violet-650 bg-violet-50 dark:bg-violet-950/20 px-2 py-0.5 rounded">
                        {coupon.discountValue || coupon.discount}
                      </span>
                      <h3 className="font-extrabold text-sm text-zinc-850 dark:text-zinc-200 mt-2 leading-snug">
                        {coupon.title}
                      </h3>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-450">
                        Vence:{' '}
                        {new Date(coupon.endDate).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        Activo
                      </span>
                    </div>
                  </div>
                ))}

                {/* Card Crear nuevo cupón */}
                <div
                  onClick={() => router.push('/business/coupons')}
                  className="bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-violet-400 transition"
                >
                  <div className="h-10 w-10 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mb-3 shadow">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-white uppercase">
                    Crear nuevo cupón
                  </h4>
                  <p className="text-[10px] text-zinc-450 mt-1 max-w-[80%]">
                    Crea promociones y atrae más clientes
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN NUEVA: CUPONES CANJEADOS Y AGOTADOS */}
            {exhaustedCouponsList.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-left">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-tight flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-amber-500" />
                    <span>Cupones Canjeados y Agotados ({exhaustedCouponsList.length})</span>
                  </h2>
                  <span className="text-xs text-zinc-400 font-medium">Histórico de Canjes</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {exhaustedCouponsList.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="bg-zinc-50 dark:bg-zinc-950 border border-amber-300/40 dark:border-amber-900/30 rounded-3xl overflow-hidden p-5 flex flex-col justify-between gap-4 shadow-sm opacity-90"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            {coupon.discountValue || coupon.discount}
                          </span>
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <FontAwesomeIcon icon={faFlagCheckered} className="text-amber-600" /> CANJEADO 100%
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-zinc-850 dark:text-zinc-200 mt-2 leading-snug line-through opacity-80">
                          {coupon.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                          Canjeado por {coupon.usageCount || coupon.usageLimit} cliente(s)
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-zinc-200 pt-3 dark:border-zinc-800">
                        <span className="text-[10px] text-zinc-400">
                          Límite: {coupon.usageLimit} | Usados: {coupon.usageCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                          Agotado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* DETALLE Y CRUD SUCURSALES */}
      <div className="space-y-4 text-left">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-zinc-850 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <MapPin className="h-5 w-5 text-violet-600" />
              Ubicación de tus Sucursales en Google Maps (
              {company?.branches.length || 0})
            </h2>
            <p className="text-xs text-zinc-500">
              Registra las coordenadas y dirección de tus locales para que los
              clientes te encuentren en el mapa.
            </p>
          </div>

          <button
            onClick={() => {
              setBranchForm({
                id: '',
                name: '',
                address: '',
                city: 'Ciudad de México',
                state: 'CDMX',
                latitude: '19.432608',
                longitude: '-99.133209',
                schedules: 'Lun - Dom: 09:00 - 22:00',
                categoryIds: [],
              });
              setShowBusinessBranchModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Agregar Sucursal</span>
          </button>
        </div>

        {company?.branches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center text-zinc-500">
            Aún no has registrado sucursales en el mapa. ¡Agrega tu primer local
            para aparecer en la lista de los clientes!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {company?.branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 px-2.5 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> {branch.city || 'CDMX'}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400">
                      {branch.latitude?.toFixed(4)},{' '}
                      {branch.longitude?.toFixed(4)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {branch.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                      {branch.address}
                    </p>
                  </div>

                  {branch.schedules && (
                    <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="text-zinc-400" /> {branch.schedules}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faMapMarkedAlt} /> Google Maps ↗
                  </a>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setBranchForm({
                          id: branch.id,
                          name: branch.name,
                          address: branch.address,
                          city: branch.city || 'Ciudad de México',
                          state: branch.state || 'CDMX',
                          latitude: branch.latitude
                            ? branch.latitude.toString()
                            : '19.432608',
                          longitude: branch.longitude
                            ? branch.longitude.toString()
                            : '-99.133209',
                          schedules:
                            branch.schedules || 'Lun - Dom: 09:00 - 22:00',
                          categoryIds: branch.categories
                            ? branch.categories.map((c) => c.id)
                            : [],
                        });
                        setShowBusinessBranchModal(true);
                      }}
                      className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBusinessBranch(branch.id)}
                      className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR SUCURSAL EMPRESA */}
      {showBusinessBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-violet-600" />
                {branchForm.id
                  ? 'Editar Sucursal en Mapa'
                  : 'Nueva Ubicación en el Mapa'}
              </h3>
              <button
                onClick={() => setShowBusinessBranchModal(false)}
                className="rounded-xl p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> Selecciona Ubicación Exacta en el Mapa (Presiona en el mapa
                  para fijar)
                </label>
                <InteractiveMapPicker
                  initialLat={parseFloat(branchForm.latitude) || 19.432608}
                  initialLng={parseFloat(branchForm.longitude) || -99.133209}
                  height="280px"
                  onLocationSelect={(lat, lng, addr) => {
                    setBranchForm((prev) => ({
                      ...prev,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                      address: addr || prev.address,
                    }));
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Nombre de la Sucursal
                </label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="Ej: Sucursal Polanco / Segunda Tienda / Sucursal Centro"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Categorías de esta Sucursal (Selecciona una o varias)
                </label>
                <div className="mt-1 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  {allCategories.length > 0 ? (
                    allCategories.map((cat) => {
                      const isSelected = branchForm.categoryIds.includes(
                        cat.id,
                      );
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setBranchForm((prev) => {
                              const exists = prev.categoryIds.includes(cat.id);
                              return {
                                ...prev,
                                categoryIds: exists
                                  ? prev.categoryIds.filter(
                                      (id) => id !== cat.id,
                                    )
                                  : [...prev.categoryIds, cat.id],
                              };
                            });
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-violet-500'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}
                          {cat.name}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium">
                      Cargando categorías...
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Dirección Completa (Calle, Número, Colonia)
                </label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, address: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  placeholder="Ej: Av. Homero 458, Col. Polanco, Miguel Hidalgo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={branchForm.city}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={branchForm.state}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, state: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Latitud
                  </label>
                  <input
                    type="text"
                    value={branchForm.latitude}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, latitude: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Ej: 19.432608"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Longitud
                  </label>
                  <input
                    type="text"
                    value={branchForm.longitude}
                    onChange={(e) =>
                      setBranchForm({
                        ...branchForm,
                        longitude: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Ej: -99.133209"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Horarios de Atención
                </label>
                <input
                  type="text"
                  value={branchForm.schedules}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, schedules: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  placeholder="Ej: Lun - Dom: 09:00 - 22:00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={() => setShowBusinessBranchModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={savingBusinessBranch}
                onClick={handleSaveBusinessBranch}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-xs font-black text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savingBusinessBranch ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Ubicación'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DATOS COMERCIALES Y FISCALES DE LA EMPRESA */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-red-600" />
                Editar Datos Comerciales y Fiscales de la Empresa
              </h3>
              <button
                onClick={() => setShowEditCompanyModal(false)}
                className="rounded-xl p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    placeholder="Ej. Mi Restaurante Gourmet"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.corporateName}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        corporateName: e.target.value,
                      })
                    }
                    placeholder="Ej. Restaurantes de México S.A. de C.V."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    RFC Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyForm.rfc}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        rfc: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Ej. ABC123456XYZ"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-mono font-bold text-violet-600 dark:text-violet-400 dark:border-zinc-800 dark:bg-zinc-900 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    Teléfono Comercial
                  </label>
                  <input
                    type="text"
                    value={companyForm.phone}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, phone: e.target.value })
                    }
                    placeholder="10 dígitos"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, email: e.target.value })
                    }
                    placeholder="ventas@negocio.com"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={companyForm.website}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        website: e.target.value,
                      })
                    }
                    placeholder="https://minegocio.com"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    Facebook Link
                  </label>
                  <input
                    type="text"
                    value={companyForm.facebook}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        facebook: e.target.value,
                      })
                    }
                    placeholder="Enlace de Facebook"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                    Instagram Link
                  </label>
                  <input
                    type="text"
                    value={companyForm.instagram}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        instagram: e.target.value,
                      })
                    }
                    placeholder="Enlace de Instagram"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                  Descripción del Negocio
                </label>
                <textarea
                  rows={3}
                  value={companyForm.description}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Cuéntanos sobre tus productos, especialidades o servicios..."
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={() => setShowEditCompanyModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={savingCompany}
                onClick={handleSaveCompany}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-xs font-black text-white hover:from-red-500 hover:to-rose-500 transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savingCompany ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Cambios de Empresa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
