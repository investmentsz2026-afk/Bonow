'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Upload,
  Flame,
  Megaphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faFlagCheckered,
  faHourglassHalf,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faTag,
  faBolt,
} from '@fortawesome/free-solid-svg-icons';

interface Branch {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string | null;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  rejectionReason?: string | null;
  type: 'SINGLE_USE' | 'REUSABLE';
  usageLimit: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
  conditions: string | null;
  category: Category;
  branches: Branch[];
}

interface BusinessAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  description?: string;
}

interface CreditBalanceInfo {
  hasActiveMembership: boolean;
  couponCredits: number;
  packages: CreditPackage[];
}

export default function BusinessCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessAds, setBusinessAds] = useState<BusinessAd[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'coupons' | 'promotions'>('coupons');

  // Estado de Saldo de Créditos y Paquetes
  const [creditInfo, setCreditInfo] = useState<CreditBalanceInfo | null>(null);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [buyingPackageId, setBuyingPackageId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario y Modal de Promoción Destacada de Empresa
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [promoCategory, setPromoCategory] = useState('Restaurantes');
  const [promoImage, setPromoImage] = useState('');
  const [promoStart, setPromoStart] = useState('');
  const [promoEnd, setPromoEnd] = useState('');

  const promoFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePromoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen seleccionada supera el límite de 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPromoImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Formulario de Validación de Código
  const [validationCode, setValidationCode] = useState('');
  const [validationResult, setValidationResult] = useState<{
    user: { firstName: string; lastName: string };
    coupon: { title: string; discount: string };
  } | null>(null);

  // Modales y formularios de Cupón
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [couponTitle, setCouponTitle] = useState('');
  const [couponDescription, setCouponDescription] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponImage, setCouponImage] = useState('');
  const [couponType, setCouponType] = useState<'SINGLE_USE' | 'REUSABLE'>(
    'SINGLE_USE',
  );
  const [couponLimit, setCouponLimit] = useState('');
  const [couponStart, setCouponStart] = useState('');
  const [couponEnd, setCouponEnd] = useState('');
  const [couponConditions, setCouponConditions] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [couponFilter, setCouponFilter] = useState<'ALL' | 'ACTIVE' | 'EXHAUSTED'>('ALL');

  const couponFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCouponFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen seleccionada supera el límite de 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCouponImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // 1. Obtener cupones creados
      const resCoupons = await fetch(
        `${API_URL}/coupons/business/my-coupons`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resCoupons.status === 401) {
        localStorage.clear();
        router.push('/login');
        return;
      }
      const dataCoupons = await resCoupons.json();
      if (!resCoupons.ok) throw new Error(dataCoupons.message);
      setCoupons(dataCoupons as Coupon[]);

      // 2. Obtener sucursales
      const resCompany = await fetch(
        `${API_URL}/companies/my-company`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dataCompany = await resCompany.json();
      if (resCompany.ok) {
        setBranches((dataCompany.branches || []) as Branch[]);
      }

      // 4. Obtener promociones destacadas enviadas por la empresa
      const resAds = await fetch(
        `${API_URL}/advertising/business/my-ads`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resAds.ok) {
        const dataAds = await resAds.json();
        setBusinessAds(dataAds as BusinessAd[]);
      }

      // 5. Obtener saldo de créditos de cupones y paquetes
      const resBalance = await fetch(
        `${API_URL}/coupons/credit-balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resBalance.ok) {
        const dataBalance = await resBalance.json();
        setCreditInfo(dataBalance as CreditBalanceInfo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setBuyingPackageId(packageId);
    try {
      const res = await fetch(
        `${API_URL}/payments/stripe/create-credit-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packageId }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setIsBuyCreditsModalOpen(false);
        if (data.isRealStripe && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          router.push(data.checkoutUrl || `/checkout/${data.paymentId}`);
        }
      } else {
        alert(data.message || 'Error al procesar la sesión de pago con Stripe.');
      }
    } catch {
      alert('Error de conexión al iniciar compra con Stripe.');
    } finally {
      setBuyingPackageId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const resCoupons = await fetch(
          `${API_URL}/coupons/business/my-coupons`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resCoupons.status === 401) {
          localStorage.clear();
          router.push('/login');
          return;
        }
        const dataCoupons = await resCoupons.json();

        const resCompany = await fetch(
          `${API_URL}/companies/my-company`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const dataCompany = await resCompany.json();

        const resAds = await fetch(
          `${API_URL}/advertising/business/my-ads`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const resBalance = await fetch(
          `${API_URL}/coupons/credit-balance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (isMounted) {
          if (!resCoupons.ok) throw new Error(dataCoupons.message);
          setCoupons(dataCoupons as Coupon[]);
          if (resCompany.ok) {
            setBranches((dataCompany.branches || []) as Branch[]);
          }
          if (resAds.ok) {
            const dataAds = await resAds.json();
            setBusinessAds(dataAds as BusinessAd[]);
          }
          if (resBalance.ok) {
            const dataBalance = await resBalance.json();
            setCreditInfo(dataBalance as CreditBalanceInfo);
          }
          const resCategories = await fetch(
            `${API_URL}/coupons/categories/list`,
          );
          if (resCategories.ok) {
            const dataCategories = await resCategories.json();
            if (Array.isArray(dataCategories) && dataCategories.length > 0) {
              setCategories(dataCategories);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al conectar');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleOpenAddPromoModal = () => {
    setPromoTitle('');
    setPromoDescription('');
    setPromoImage('');
    setPromoStart('');
    setPromoEnd('');
    setIsPromoModalOpen(true);
  };

  const handleSaveBusinessPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(
        `${API_URL}/advertising/business/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: promoTitle,
            description: promoDescription,
            imageUrl: promoImage || undefined,
            category: promoCategory,
            adType: promoCategory,
            position: 'PROMOTIONS_PAGE',
            startDate: promoStart || undefined,
            endDate: promoEnd || undefined,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || 'Error al solicitar publicación de la promoción',
        );
      }

      setSuccess(
        '¡Promoción enviada con éxito! Queda pendiente de aprobación por el Administrador antes de aparecer en la página de Promociones.',
      );
      setIsPromoModalOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    if (!creditInfo || (!creditInfo.hasActiveMembership && creditInfo.couponCredits <= 0)) {
      router.push('/dashboard/membership');
      return;
    }
    setEditingCoupon(null);
    setCouponTitle('');
    setCouponDescription('');
    setCouponDiscount('');
    setCouponImage('');
    setCouponType('SINGLE_USE');
    setCouponLimit('');
    setCouponStart('');
    setCouponEnd('');
    setCouponConditions('');
    setSelectedBranches([]);
    setSelectedCategory(categories.length > 0 ? categories[0].id : '');
    setSelectedCategories(categories.length > 0 ? [categories[0].id] : []);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponTitle(coupon.title);
    setCouponDescription(coupon.description);
    setCouponDiscount(coupon.discount);
    setCouponImage(coupon.imageUrl || '');
    setCouponType(coupon.type);
    setCouponLimit(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setCouponStart(coupon.startDate.substring(0, 10));
    setCouponEnd(coupon.endDate.substring(0, 10));
    setCouponConditions(coupon.conditions || '');
    setSelectedBranches(coupon.branches.map((b) => b.id));
    setSelectedCategory(coupon.category?.id || '');

    // Extraer categorías adicionales de condiciones si existen
    let cats = coupon.category?.id ? [coupon.category.id] : [];
    if (coupon.conditions && coupon.conditions.includes('[CATEGORIES:')) {
      const match = coupon.conditions.match(/\[CATEGORIES:([^\]]+)\]/);
      if (match && match[1]) {
        cats = match[1].split(',').filter(Boolean);
      }
    }
    setSelectedCategories(cats);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('accessToken');
    const url = editingCoupon
      ? `${API_URL}/coupons/${editingCoupon.id}`
      : `${API_URL}/coupons`;
    const method = editingCoupon ? 'PUT' : 'POST';

    const effectiveCategoryIds = selectedCategories.length > 0
      ? selectedCategories
      : (selectedCategory ? [selectedCategory] : []);

    if (effectiveCategoryIds.length === 0) {
      setError('Por favor selecciona al menos una categoría para el cupón.');
      setActionLoading(false);
      return;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: couponTitle,
          description: couponDescription,
          discount: couponDiscount,
          imageUrl: couponImage || undefined,
          type: couponType,
          usageLimit: couponLimit ? parseInt(couponLimit) : undefined,
          startDate: couponStart,
          endDate: couponEnd,
          conditions: couponConditions || undefined,
          branchIds: selectedBranches,
          categoryId: effectiveCategoryIds[0],
          categoryIds: effectiveCategoryIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar cupón');

      setSuccess('Cupón guardado correctamente');
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch(`${API_URL}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('Cupón eliminado con éxito');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');
    const newStatus = coupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await fetch(
        `${API_URL}/coupons/${coupon.id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    setValidationResult(null);
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch(`${API_URL}/coupons/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: validationCode }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Error al validar el código');

      setSuccess('¡Código validado exitosamente!');
      setValidationResult(data);
      setValidationCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBranchSelect = (branchId: string) => {
    if (selectedBranches.includes(branchId)) {
      setSelectedBranches(selectedBranches.filter((id) => id !== branchId));
    } else {
      setSelectedBranches([...selectedBranches, branchId]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {/* BANNER DE ESTADO DE CRÉDITOS / MEMBRESÍA */}
      {creditInfo && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0 shadow-lg text-white">
              <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight text-white flex items-center gap-2">
                {creditInfo.hasActiveMembership ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Membresía Activa (Publicación Ilimitada)
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-400" /> Saldo Actual: {creditInfo.couponCredits} Crédito(s) Disponible(s)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {creditInfo.hasActiveMembership
                  ? 'Tu cuenta de empresa cuenta con membresía activa oficial. Puedes publicar cupones y promociones sin límite.'
                  : creditInfo.couponCredits > 0
                  ? `Cuentas con ${creditInfo.couponCredits} crédito(s) disponible(s). Se utilizará 1 crédito por cada nuevo cupón o promoción que publiques.`
                  : 'No dispones de créditos activos ni membresía. Adquiere un paquete de créditos para poder publicar tus ofertas.'}
              </p>
            </div>
          </div>

          {!creditInfo.hasActiveMembership && (
            <button
              onClick={() => router.push('/dashboard/membership')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 px-5 py-3 text-xs font-black uppercase text-white shadow-lg shadow-red-500/30 transition-all transform hover:scale-105 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Comprar Créditos</span>
            </button>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna Izquierda: Validar Código de Tienda */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950">
            <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-650" />
              Validar Cupón
            </h2>
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Código del Cliente
                </label>
                <input
                  type="text"
                  required
                  value={validationCode}
                  onChange={(e) =>
                    setValidationCode(e.target.value.toUpperCase())
                  }
                  placeholder="BONOW-RED-XXXXXX"
                  className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm focus:outline-none focus:border-red-500 dark:border-gray-800 dark:bg-zinc-900 dark:text-white font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-2xl bg-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition"
              >
                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Validar Código'
                )}
              </button>
            </form>

            {/* Resultado de Validación */}
            {validationResult && (
              <div className="mt-6 rounded-2xl bg-green-50/50 p-4 border border-green-200 dark:bg-green-950/10 dark:border-green-900/30 text-xs space-y-3">
                <p className="font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Validación Exitosa</span>
                </p>
                <div>
                  <span className="text-gray-400 font-bold block uppercase text-[10px]">
                    Cliente
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-250">
                    {validationResult.user.firstName}{' '}
                    {validationResult.user.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block uppercase text-[10px]">
                    Cupón Aplicado
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-250">
                    {validationResult.coupon.title} (
                    {validationResult.coupon.discount})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Listado y CRUD de cupones / promociones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs de Selección */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
            <button
              onClick={() => setActiveSubTab('coupons')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeSubTab === 'coupons'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>Mis Cupones ({coupons.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('promotions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeSubTab === 'promotions'
                  ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white shadow-md shadow-red-500/25'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Flame className="h-4 w-4 text-amber-300" />
              <span>Promociones Destacadas ({businessAds.length})</span>
            </button>
          </div>

          {activeSubTab === 'coupons' ? (
            <>
              {/* Info de saldo de créditos de cupones */}
              {creditInfo && !creditInfo.hasActiveMembership && creditInfo.couponCredits <= 0 ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-left shadow-sm">
                  <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-bold">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>No tienes créditos de cupones ni membresía activa (0 Créditos disponibles). Para crear nuevos cupones necesitas comprar créditos.</span>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/membership')}
                    className="shrink-0 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/20 transition cursor-pointer"
                  >
                    Comprar Créditos o Membresía →
                  </button>
                </div>
              ) : creditInfo && !creditInfo.hasActiveMembership && creditInfo.couponCredits > 0 ? (
                <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 rounded-2xl p-3.5 flex items-center justify-between text-xs text-left shadow-sm">
                  <span className="font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
                    <Ticket className="h-4 w-4 text-violet-600" />
                    Saldo de Publicaciones: <strong>{creditInfo.couponCredits} Crédito(s) Disponible(s)</strong> (Cupones Creados: {coupons.length})
                  </span>
                  <button
                    onClick={() => router.push('/dashboard/membership')}
                    className="text-violet-600 dark:text-violet-400 font-black hover:underline text-[11px] cursor-pointer"
                  >
                    + Adquirir más créditos
                  </button>
                </div>
              ) : null}

              {(() => {
                const activeList = coupons.filter((c) => {
                  const isExhausted = c.usageLimit !== null && c.usageLimit !== undefined && c.usageLimit > 0 && c.usageCount >= c.usageLimit;
                  const isExpired = new Date(c.endDate) < new Date();
                  return c.status === 'ACTIVE' && !isExhausted && !isExpired;
                });

                const exhaustedList = coupons.filter((c) => {
                  const isExhausted = c.usageLimit !== null && c.usageLimit !== undefined && c.usageLimit > 0 && c.usageCount >= c.usageLimit;
                  return isExhausted;
                });

                const filteredCoupons = coupons.filter((c) => {
                  const isExhausted = c.usageLimit !== null && c.usageLimit !== undefined && c.usageLimit > 0 && c.usageCount >= c.usageLimit;
                  const isExpired = new Date(c.endDate) < new Date();

                  if (couponFilter === 'ACTIVE') {
                    return c.status === 'ACTIVE' && !isExhausted && !isExpired;
                  }
                  if (couponFilter === 'EXHAUSTED') {
                    return isExhausted;
                  }
                  return true;
                });

                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                        Mis Cupones de Descuento
                      </h2>
                      <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/10 hover:bg-violet-700 transition cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Crear Cupón</span>
                      </button>
                    </div>

                    {/* Filtros por pestaña */}
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setCouponFilter('ALL')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          couponFilter === 'ALL'
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
                        }`}
                      >
                        Todos ({coupons.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponFilter('ACTIVE')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          couponFilter === 'ACTIVE'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
                        }`}
                      >
                        Activos ({activeList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponFilter('EXHAUSTED')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          couponFilter === 'EXHAUSTED'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
                        }`}
                      >
                        Canjeados / Agotados ({exhaustedList.length})
                      </button>
                    </div>

                    {filteredCoupons.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-800">
                        <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm font-semibold">
                          No se encontraron cupones en esta categoría.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredCoupons.map((coupon) => {
                          const isExhausted = coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit;

                          return (
                            <div
                              key={coupon.id}
                              className={`rounded-3xl border p-6 shadow-sm space-y-3 transition ${
                                isExhausted
                                  ? 'border-amber-300/60 bg-amber-50/30 dark:border-amber-900/40 dark:bg-zinc-950'
                                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-zinc-950'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1.5 flex-1 pr-4">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-750 dark:bg-violet-950/20 dark:text-violet-400">
                                      {coupon.discount}
                                    </span>

                                    {isExhausted ? (
                                      <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 border border-amber-300">
                                        <FontAwesomeIcon icon={faFlagCheckered} className="text-amber-600" /> CANJEADO TOTALMENTE (AGOTADO)
                                      </span>
                                    ) : coupon.status === 'PENDING' ? (
                                      <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 border border-amber-300/40">
                                        <FontAwesomeIcon icon={faHourglassHalf} className="text-amber-500" /> EN REVISIÓN POR ADMIN
                                      </span>
                                    ) : coupon.status === 'ACTIVE' ? (
                                      <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 border border-emerald-300/40">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" /> Publicado y Activo
                                      </span>
                                    ) : coupon.status === 'REJECTED' ? (
                                      <span className="rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-2.5 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 border border-red-300/40">
                                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" /> Rechazado
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-0.5 text-[10px] font-black uppercase">
                                        Inactivo
                                      </span>
                                    )}
                                  </div>
                                  <h3 className={`font-bold text-base ${isExhausted ? 'line-through text-gray-500' : 'text-gray-800 dark:text-zinc-100'}`}>
                                    {coupon.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {coupon.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-400 pt-1">
                                    <span className={isExhausted ? 'font-bold text-amber-600' : ''}>
                                      Usados: {coupon.usageCount}
                                    </span>
                                    <span>•</span>
                                    <span>Límite: {coupon.usageLimit || 'Ilimitado'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {!isExhausted && (coupon.status === 'ACTIVE' || coupon.status === 'INACTIVE') && (
                                    <button
                                      onClick={() => void handleToggleStatus(coupon)}
                                      className="text-gray-500 hover:text-violet-650"
                                      title={
                                        coupon.status === 'ACTIVE' ? 'Desactivar' : 'Activar'
                                      }
                                    >
                                      {coupon.status === 'ACTIVE' ? (
                                        <ToggleRight className="h-8 w-8 text-violet-600" />
                                      ) : (
                                        <ToggleLeft className="h-8 w-8 text-gray-400" />
                                      )}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleOpenEditModal(coupon)}
                                    className="rounded-xl border border-gray-200 dark:border-gray-800 p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
                                    title="Editar cupón"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() => void handleDeleteCoupon(coupon.id)}
                                    className="rounded-xl bg-red-50 dark:bg-red-950/20 p-2 text-red-500 hover:bg-red-100 transition"
                                    title="Eliminar cupón"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {coupon.status === 'REJECTED' && (
                                <div className="rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 animate-in fade-in">
                                  <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    <span>Motivo de rechazo por el Administrador:</span>
                                  </div>
                                  <p className="mt-1 text-xs text-red-900 dark:text-red-200 font-medium italic bg-white/60 dark:bg-black/30 p-2.5 rounded-xl border border-red-200/50 dark:border-red-900/30">
                                    "{coupon.rejectionReason || 'No se detalló un motivo específico.'}"
                                  </p>
                                </div>
                              )}

                              {coupon.status === 'PENDING' && (
                                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300">
                                  <p className="font-semibold text-[11px] flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-amber-500 shrink-0" />
                                    <span>Este cupón está en proceso de revisión por los administradores de la plataforma. Una vez aprobado, se publicará automáticamente para los usuarios.</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            /* TAB DE PROMOCIONES DESTACADAS DE EMPRESA */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1E36] to-slate-900 p-5 rounded-3xl text-white shadow-xl">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-white">
                    <Flame className="h-5 w-5 text-amber-400" />
                    Promociones de Empresa
                  </h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Publica la oferta de tu empresa en la página de Promociones de BONOW.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddPromoModal}
                  className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-4 py-2.5 text-xs font-black uppercase text-white shadow-lg shadow-red-500/30 hover:scale-105 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publicar Promoción</span>
                </button>
              </div>

              {businessAds.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-800 space-y-3">
                  <Megaphone className="mx-auto h-12 w-12 text-red-400" />
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    No has publicado ninguna promoción de empresa aún.
                  </p>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Haz clic en el botón <strong>"Publicar Promoción"</strong> para enviar la oferta especial de tu negocio a revisión del Administrador.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {businessAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-zinc-950 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {ad.imageUrl && (
                          <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              {ad.status === 'ACTIVE' ? (
                                <span className="rounded-full bg-emerald-500 text-white px-3 py-1 text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Publicado en Promociones
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-500 text-white px-3 py-1 text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                                  ⏳ Pendiente Aprobación Admin
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <h3 className="font-black text-slate-900 dark:text-white text-base uppercase leading-snug">
                          {ad.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                          {ad.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Enviado: {ad.createdAt?.substring(0, 10)}</span>
                        {ad.status === 'INACTIVE' && (
                          <span className="text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-200/50">
                            En espera de aprobación
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Cupón */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-zinc-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-850">
              <h3 className="text-lg font-bold text-gray-850 dark:text-white">
                {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-805"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Título del Cupón
                  </label>
                  <input
                    type="text"
                    required
                    value={couponTitle}
                    onChange={(e) => setCouponTitle(e.target.value)}
                    placeholder="2x1 en Hamburguesas"
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Descuento (Texto Libre)
                  </label>
                  <input
                    type="text"
                    required
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(e.target.value)}
                    placeholder="20% OFF / 2x1 / $100 de Ahorro"
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  required
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  placeholder="Aplica en la compra de cualquier platillo fuerte..."
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              {/* SELECCIÓN DE IMAGEN DEL CUPÓN DESDE DISPOSITIVO (PC / CELULAR) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Imagen de Portada del Cupón (Opcional)
                </label>
                <input
                  type="file"
                  ref={couponFileInputRef}
                  accept="image/*"
                  onChange={handleCouponFileSelect}
                  className="hidden"
                />

                {couponImage ? (
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group">
                    <img
                      src={couponImage}
                      alt="Portada"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => couponFileInputRef.current?.click()}
                        className="rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-xs font-bold shadow hover:bg-zinc-100 transition cursor-pointer"
                      >
                        Cambiar Imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponImage('')}
                        className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-bold shadow hover:bg-red-500 transition cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => couponFileInputRef.current?.click()}
                    className="border-2 border-dashed border-violet-300 dark:border-violet-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-violet-500 bg-violet-50/30 dark:bg-violet-950/10 transition group"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center mb-1 group-hover:scale-110 transition duration-300">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                      Subir Imagen desde PC o Celular
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Haz clic para seleccionar fotos de tu galería o archivos
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Tipo de Uso
                  </label>
                  <select
                    value={couponType}
                    onChange={(e) =>
                      setCouponType(e.target.value as 'SINGLE_USE' | 'REUSABLE')
                    }
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="SINGLE_USE">Único uso</option>
                    <option value="REUSABLE">Reutilizable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Límite Global de Usos
                  </label>
                  <input
                    type="number"
                    value={couponLimit}
                    onChange={(e) => setCouponLimit(e.target.value)}
                    placeholder="Ilimitado"
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Categorías (Puedes seleccionar 1 o más)
                  </label>

                  {/* Badges de Categorías Seleccionadas */}
                  <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-950/40">
                    {selectedCategories.length === 0 ? (
                      <span className="text-xs text-zinc-400 self-center px-1 font-medium italic">
                        -- Ninguna categoría seleccionada. Selecciona una abajo --
                      </span>
                    ) : (
                      selectedCategories.map((catId) => {
                        const catObj = categories.find((c) => c.id === catId);
                        return (
                          <span
                            key={catId}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600 text-white text-xs font-bold shadow-sm animate-in fade-in zoom-in duration-150"
                          >
                            <span><FontAwesomeIcon icon={faTag} className="mr-1 text-violet-200" /> {catObj ? catObj.name : catId}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextIds = selectedCategories.filter((id) => id !== catId);
                                setSelectedCategories(nextIds);
                                setSelectedCategory(nextIds[0] || '');
                              }}
                              className="hover:bg-violet-700 p-0.5 rounded-full transition cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5 text-violet-200 hover:text-white" />
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Selector para añadir más categorías */}
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (selectedId && !selectedCategories.includes(selectedId)) {
                        const nextIds = [...selectedCategories, selectedId];
                        setSelectedCategories(nextIds);
                        setSelectedCategory(nextIds[0]);
                      }
                    }}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="">+ Selecciona para agregar una categoría...</option>
                    {categories
                      .filter((c) => !selectedCategories.includes(c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={couponStart}
                    onChange={(e) => setCouponStart(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Fecha de Término
                  </label>
                  <input
                    type="date"
                    required
                    value={couponEnd}
                    onChange={(e) => setCouponEnd(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Seleccionar Sucursales Válidas
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 max-h-24 overflow-y-auto border border-gray-100 p-2.5 rounded-xl dark:border-gray-850">
                  {branches.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 dark:text-gray-405"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBranches.includes(b.id)}
                        onChange={() => handleBranchSelect(b.id)}
                        className="rounded border-gray-300 text-violet-650 focus:ring-violet-500"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Condiciones y Términos
                </label>
                <textarea
                  rows={2}
                  value={couponConditions}
                  onChange={(e) => setCouponConditions(e.target.value)}
                  placeholder="No acumulable con otras promociones..."
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-250 py-2.5 text-sm font-bold text-gray-650 hover:bg-gray-50 transition dark:border-gray-700 dark:hover:bg-zinc-800 dark:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 flex justify-center items-center rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-750 transition"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Promoción Destacada de Empresa */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-zinc-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white">
                  Publicar Promoción de Empresa
                </h3>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300">
              <p className="font-semibold text-[11px] leading-relaxed">
                ℹ️ Al hacer clic en <strong>Publicar Promoción</strong>, la oferta quedará en revisión por el Administrador. Una vez aprobada, aparecerá publicada en la sección de Promociones de la app con el nombre y logo de tu empresa.
              </p>
            </div>

            <form onSubmit={handleSaveBusinessPromo} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Título de la Promoción
                </label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="ej. 2x1 en Platillos Fuertes y Coctelería de Autor"
                  className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold focus:outline-none focus:border-red-500 dark:border-slate-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Categoría de la Promoción
                </label>
                <select
                  value={promoCategory}
                  onChange={(e) => setPromoCategory(e.target.value)}
                  className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold focus:outline-none focus:border-red-500 dark:border-slate-800 dark:bg-zinc-950 dark:text-white"
                >
                  {categories && categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Restaurantes">Restaurantes</option>
                      <option value="Cafeterías">Cafeterías</option>
                      <option value="Hoteles">Hoteles</option>
                      <option value="Belleza">Belleza</option>
                      <option value="Gimnasios">Gimnasios</option>
                      <option value="Entretenimiento">Entretenimiento</option>
                      <option value="Salud">Salud</option>
                      <option value="Tiendas">Tiendas</option>
                      <option value="Viajes">Viajes</option>
                      <option value="Más">Más</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  required
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  placeholder="Describe la oferta especial, condiciones o vigencia para los clientes..."
                  className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm focus:outline-none focus:border-red-500 dark:border-slate-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              {/* Subir Imagen de la Promoción */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                  Imagen de Portada para la Promoción
                </label>
                <input
                  type="file"
                  ref={promoFileInputRef}
                  accept="image/*"
                  onChange={handlePromoFileSelect}
                  className="hidden"
                />

                {promoImage ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-zinc-950 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={promoImage}
                      alt="Portada de Promoción"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => promoFileInputRef.current?.click()}
                        className="rounded-xl bg-white text-slate-900 px-3 py-1.5 text-xs font-black uppercase shadow hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cambiar Imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => setPromoImage('')}
                        className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-black uppercase shadow hover:bg-red-500 transition cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => promoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-red-300 dark:border-red-900/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-500 bg-red-50/20 dark:bg-red-950/10 transition group"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-1 group-hover:scale-110 transition duration-300">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                      Subir Imagen desde PC o Celular
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Haz clic para seleccionar fotos de tu galería o archivos
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={promoStart}
                    onChange={(e) => setPromoStart(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:border-red-500 dark:border-slate-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                    Fecha Término
                  </label>
                  <input
                    type="date"
                    value={promoEnd}
                    onChange={(e) => setPromoEnd(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:border-red-500 dark:border-slate-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-black uppercase text-slate-600 hover:bg-slate-100 transition dark:border-slate-800 dark:hover:bg-zinc-800 dark:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 flex justify-center items-center rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 py-3 text-xs font-black uppercase text-white shadow-lg shadow-red-500/30 hover:scale-105 transition cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Publicar Promoción'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / PANEL LATERAL DERECHO DE CRÉDITOS Y MEMBRESÍAS */}
      {isBuyCreditsModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg h-full bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-2xl overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setIsBuyCreditsModalOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="space-y-2 border-b border-slate-100 dark:border-zinc-800 pb-4 pr-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                <Flame className="h-3.5 w-3.5 text-red-500" />
                Sin Créditos o Membresía
              </span>
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
                Adquirir Créditos de Cupones
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                No tienes créditos disponibles ni una membresía activa en tu cuenta. Para poder crear y publicar nuevos cupones comerciales, adquiere uno de los siguientes paquetes o una membresía.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Paquetes Disponibles para Empresas:
              </h3>
              {(creditInfo?.packages || []).map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-3 ${
                    pkg.popular
                      ? 'border-red-500 bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent dark:bg-red-950/20 shadow-lg'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-6 bg-red-500 text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase shadow-md">
                      MÁS POPULAR
                    </span>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                        {pkg.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 px-3 py-0.5 text-[10px] font-black uppercase mt-1">
                        <FontAwesomeIcon icon={faBolt} className="text-red-500" /> {pkg.credits} Cupones
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-red-500 dark:text-red-400">
                        ${pkg.price} <span className="text-xs font-bold text-slate-400">MXN</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {pkg.description || `Publica hasta ${pkg.credits} ofertas especiales en la app.`}
                  </p>

                  <button
                    onClick={() => handleBuyCredits(pkg.id)}
                    disabled={buyingPackageId === pkg.id}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 py-3 text-xs font-black uppercase text-white shadow-lg shadow-red-500/25 transition transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                  >
                    {buyingPackageId === pkg.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        <span>Comprar Paquete ({pkg.credits} Créditos)</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
              <span className="text-xs text-slate-500 font-medium block">
                ¿Prefieres pagar una membresía mensual para publicaciones ilimitadas?
              </span>
              <button
                onClick={() => router.push('/dashboard/membership')}
                className="w-full rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs py-3.5 hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shadow-md"
              >
                <span>Ver Planes de Membresía →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
