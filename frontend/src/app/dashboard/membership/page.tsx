'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  History,
  Calendar,
  CheckCircle,
  Loader2,
  Sparkles,
  Zap,
  Check,
  Crown,
  ArrowRight,
  Star,
  Ticket,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faExclamationTriangle, faCheckCircle, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Membership {
  id: string;
  type: 'MONTHLY' | 'QUARTERLY' | 'SEMESTERLY' | 'ANNUAL';
  price: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

interface Transaction {
  id: string;
  type: 'MONTHLY' | 'QUARTERLY' | 'SEMESTERLY' | 'ANNUAL';
  price: string;
  startDate: string;
  endDate: string;
  paidAt: string;
}

const DEFAULT_PLANS = [
  {
    id: 'monthly',
    type: 'MONTHLY',
    name: 'Plan Mensual',
    price: 149,
    period: 'mes',
    description: 'Perfecto para probar la experiencia BONOW+.',
    badge: 'Básico',
    features: [
      'Acceso ilimitado a promociones 2x1',
      'Tarjeta digital activa al instante',
      'Sin plazos forzosos',
    ],
  },
  {
    id: 'quarterly',
    type: 'QUARTERLY',
    name: 'Plan Trimestral',
    price: 399,
    period: '3 meses',
    description: 'Ahorra más de un 10% contratando un trimestre.',
    badge: 'Popular',
    popular: true,
    features: [
      'Todo lo del Plan Mensual',
      'Ahorro directo en la tarifa mensual',
      'Prioridad en eventos VIP',
    ],
  },
  {
    id: 'semesterly',
    type: 'SEMESTERLY',
    name: 'Plan Semestral',
    price: 699,
    period: '6 meses',
    description: 'Nuestra opción recomendada a mediano plazo.',
    badge: 'Recomendado',
    recommended: true,
    features: [
      'Todo lo del Plan Trimestral',
      'Mayor margen de ahorro continuo',
      'Pases especiales 2x1 en cine y eventos',
    ],
  },
  {
    id: 'annual',
    type: 'ANNUAL',
    name: 'Plan Anual',
    price: 1199,
    period: 'año',
    description: 'El mejor ahorro. Beneficios premium todo el año.',
    badge: 'Súper Ahorro',
    bestValue: true,
    features: [
      'Acceso ilimitado por 365 días',
      'Máximo ahorro garantizado (< $100/mes)',
      'Incluye Tarjeta Física Coleccionable',
      'Soporte VIP prioritario 24/7',
    ],
  },
];

export default function MembershipPage() {
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [membershipData, setMembershipData] = useState<{
    membership: Membership | null;
    daysRemaining: number;
    alertDays: number | null;
    isExpired: boolean;
  } | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Business User Credits State
  const [isBusinessUser, setIsBusinessUser] = useState(false);
  const [couponCredits, setCouponCredits] = useState(0);
  const [creditPackages, setCreditPackages] = useState<any[]>([]);
  const [buyingPackageId, setBuyingPackageId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const resActive = await fetch(
          'http://localhost:3001/memberships/active',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resActive.status === 401) {
          localStorage.clear();
          router.push('/login');
          return;
        }
        const dataActive = await resActive.json();

        const resHistory = await fetch(
          'http://localhost:3001/memberships/history',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const dataHistory = await resHistory.json();

        // Cargar saldo y paquetes de créditos si la cuenta es de empresa
        try {
          const resCredits = await fetch(
            'http://localhost:3001/coupons/credit-balance',
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (resCredits.ok) {
            const dataCredits = await resCredits.json();
            if (dataCredits.isBusiness) {
              setIsBusinessUser(true);
              setCouponCredits(dataCredits.couponCredits || 0);
              setCreditPackages(dataCredits.packages || []);
            }
          }
        } catch {
          // Silencioso
        }

        // Cargar planes de membresía dinámicos desde backend
        try {
          const resPlans = await fetch(
            'http://localhost:3001/coupons/membership-plans',
          );
          if (resPlans.ok) {
            const plansData = await resPlans.json();
            if (Array.isArray(plansData) && plansData.length > 0) {
              setPlans(plansData);
            }
          }
        } catch {
          // Silencioso
        }

        if (isMounted) {
          if (!resActive.ok) throw new Error(dataActive.message);
          setMembershipData(dataActive);
          if (resHistory.ok) {
            setTransactions(dataHistory as Transaction[]);
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

  const handleBuyCredits = async (packageId: string) => {
    setBuyingPackageId(packageId);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/payments/stripe/create-credit-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar compra de créditos con Stripe');

      if (data.isRealStripe && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(data.checkoutUrl || `/checkout/${data.paymentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setBuyingPackageId(null);
    }
  };

  const [stripeConfig, setStripeConfig] = useState<{ isConfigured: boolean; publishableKey?: string } | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/payments/stripe/config')
      .then((res) => res.json())
      .then((data) => setStripeConfig(data))
      .catch(() => {});
  }, []);

  const handleOpenCheckout = async (plan: any) => {
    setActionLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(
        'http://localhost:3001/payments/stripe/create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planType: plan.type || plan.id.toUpperCase(),
            provider: 'STRIPE',
          }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Error al iniciar sesión de Stripe');

      if (data.isRealStripe && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(data.checkoutUrl || `/checkout/${data.paymentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setActionLoading(false);
    }
  };

  const getPlanNameES = (type: string) => {
    switch (type) {
      case 'MONTHLY':
        return 'Mensual';
      case 'QUARTERLY':
        return 'Trimestral';
      case 'SEMESTERLY':
        return 'Semestral';
      case 'ANNUAL':
        return 'Anual';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[65vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Cargando tu membresía BONOW+...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16">
      {/* Header Institucional de Membresía */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F1E36] via-slate-900 to-[#0F1E36] p-8 text-white shadow-2xl border border-slate-800">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-400 shadow-md">
              <Crown className="h-3.5 w-3.5" />
              Suscripción BONOW+ Active
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
              Mi Membresía BONOW+
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              Administra tu suscripción digital, consulta vencimientos y renueva tu plan comercial para seguir disfrutando beneficios 2x1 ilimitados.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Nivel de Beneficios
              </span>
              <span className="text-sm font-black text-white uppercase tracking-wide">
                Socio VIP BONOW+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas urgentes de Vencimiento */}
      {membershipData?.alertDays !== null &&
        membershipData?.daysRemaining !== undefined &&
        membershipData.daysRemaining > 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/30 animate-pulse transition-all duration-300 hover:scale-[1.01]">
            <div className="rounded-[22px] bg-slate-950 p-5 md:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
              {/* Background Ambient Glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/30 blur-2xl animate-pulse" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-orange-500/30 blur-2xl animate-pulse" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/50">
                  <ShieldAlert className="h-8 w-8 text-slate-950 animate-bounce" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400"></span>
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm md:text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                      <FontAwesomeIcon icon={faBolt} className="text-amber-400" /> ¡TU MEMBRESÍA VENCE PRÓXIMAMENTE!
                    </span>
                    <span className="rounded-full bg-amber-400 text-slate-950 px-3 py-0.5 text-[11px] font-black uppercase tracking-widest shadow-md animate-pulse">
                      ¡Quedan {membershipData.daysRemaining} Días!
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                    Te quedan <strong className="text-amber-300 font-black underline text-sm">{membershipData.daysRemaining} días</strong> de vigencia. Renueva hoy tu suscripción BONOW+ para no perder tus beneficios exclusivos y promociones 2x1.
                  </p>
                </div>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    const el = document.getElementById('planes-membresia');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 px-6 py-3.5 text-xs font-black uppercase text-slate-950 shadow-xl shadow-amber-400/40 hover:from-amber-300 hover:to-orange-300 transition-all transform hover:scale-105 cursor-pointer"
                >
                  <span>Renovar Ahora</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      {membershipData?.isExpired && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 p-1 shadow-2xl shadow-red-500/30 animate-pulse transition-all duration-300 hover:scale-[1.01]">
          <div className="rounded-[22px] bg-slate-950 p-5 md:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/50">
                <ShieldAlert className="h-8 w-8 animate-bounce" />
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base font-black text-red-400 uppercase tracking-wider drop-shadow-[0_0_10px_rgba(248,113,113,0.5)] flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" /> Membresía Vencida o Inactiva
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                  Adquiere un plan comercial para reactivar tu membresía y acceder a todos los descuentos del Club.
                </p>
              </div>
            </div>

            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <button
                onClick={() => {
                  const el = document.getElementById('planes-membresia');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-3.5 text-xs font-black uppercase text-white shadow-xl shadow-red-500/40 hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 cursor-pointer"
              >
                <span>Activar Membresía</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones de éxito/error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/40 border border-red-500/30 p-4 text-xs font-bold text-red-300 shadow-md">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-300 shadow-md">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Estado Actual del Suscriptor */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0F1E36] via-slate-900 to-slate-950 p-6 md:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden space-y-6">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
            Estado del Suscriptor
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            Información en Tiempo Real
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Estado de Cuenta */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-4 group">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              membershipData?.isExpired
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/10'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/20 group-hover:scale-105 transition'
            }`}>
              {membershipData?.isExpired ? (
                <ShieldAlert className="h-7 w-7" />
              ) : (
                <ShieldCheck className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Estado de Cuenta
              </span>
              <span
                className={`text-lg font-black uppercase tracking-wider block mt-0.5 ${
                  membershipData?.isExpired ? 'text-red-400' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                }`}
              >
                {membershipData?.isExpired ? 'Inactivo / Vencido' : (
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" /> ACTIVO
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Card 2: Próximo Vencimiento */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md hover:border-teal-500/40 transition-all duration-300 flex items-center gap-4 group">
            <div className="h-14 w-14 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition">
              <Calendar className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Próximo Vencimiento
              </span>
              <span className="text-lg font-black text-white block mt-0.5 font-mono">
                {membershipData?.membership?.endDate
                  ? new Date(membershipData.membership.endDate).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
          {/* Card 3: Plan Contratado */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md hover:border-red-500/40 transition-all duration-300 flex items-center gap-4 group">
            <div className="h-14 w-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 group-hover:scale-105 transition">
              <CreditCard className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Plan Contratado
              </span>
              <span className="text-base font-black text-white tracking-wide block mt-0.5">
                {membershipData?.membership
                  ? `Plan ${getPlanNameES(membershipData.membership.type)}`
                  : 'Ningún plan activo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Planes de Suscripción */}
      <div id="planes-membresia" className="space-y-6 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block">
              Planes Comerciales Disponibles
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Adquirir / Renovar Membresía
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Selecciona la mejor tarifa para acceder a descuentos exclusivos y beneficios en restaurantes, boutiques y servicios.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const planType = plan.type || plan.id.toUpperCase();
            const isCurrentPlan =
              membershipData?.membership?.status === 'ACTIVE' &&
              !membershipData?.isExpired &&
              membershipData?.membership?.type === planType;

            const isPopular = plan.popular || plan.id === 'quarterly';
            const isRecommended = plan.recommended || plan.id === 'semesterly';
            const isBestValue = plan.bestValue || plan.id === 'annual';

            return (
              <div
                key={plan.id || plan.type}
                className={`rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 relative overflow-hidden group transform hover:-translate-y-1 ${
                  isCurrentPlan
                    ? 'border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/70 via-slate-900 to-[#0F1E36] text-white ring-4 ring-emerald-500/20 shadow-emerald-500/20'
                    : isPopular
                    ? 'border-2 border-red-500 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0F1E36] text-white shadow-red-500/15 hover:border-red-400'
                    : isRecommended
                    ? 'border-2 border-teal-500 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0F1E36] text-white shadow-teal-500/15 hover:border-teal-400'
                    : isBestValue
                    ? 'border-2 border-amber-500 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0F1E36] text-white shadow-amber-500/15 hover:border-amber-400'
                    : 'border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0F1E36] text-white hover:border-slate-700'
                }`}
              >
                {/* Background ambient light */}
                {isPopular && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/20 blur-2xl group-hover:scale-150 transition" />
                )}
                {isRecommended && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-500/20 blur-2xl group-hover:scale-150 transition" />
                )}
                {isBestValue && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl group-hover:scale-150 transition" />
                )}

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-md ${
                        isCurrentPlan
                          ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                          : isPopular
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30'
                          : isRecommended
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/30'
                          : isBestValue
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isCurrentPlan ? '✓ PLAN ACTUAL' : plan.badge || 'ESTÁNDAR'}
                    </span>
                    {isBestValue && (
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400 animate-bounce" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wide">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px] leading-snug">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features Bullet List */}
                  {plan.features && Array.isArray(plan.features) && (
                    <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                      {plan.features.map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-[11px]">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-white group-hover:text-red-400 transition-colors">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-400 ml-1 font-semibold">
                      {plan.period?.includes('MXN')
                        ? plan.period
                        : `MXN / ${plan.period}`}
                    </span>
                  </div>

                  {isCurrentPlan ? (
                    <button
                      onClick={() => handleOpenCheckout(plan)}
                      disabled={actionLoading}
                      className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Renovar / Extender Mi Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(plan)}
                      disabled={actionLoading}
                      className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-700 py-3 text-xs font-black text-white shadow-lg shadow-red-500/25 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      <span>
                        {membershipData?.membership
                          ? 'Cambiar / Mejorar Plan'
                          : 'Contratar Ahora'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN EXCLUSIVA PARA EMPRESAS: COMPRA DE CRÉDITOS DE CUPONES */}
      {isBusinessUser && (
        <div className="rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-zinc-950 p-6 md:p-8 text-white shadow-2xl border border-rose-900/40 space-y-6 text-left relative overflow-hidden animate-in fade-in">
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-300">
                <Ticket className="h-3.5 w-3.5" />
                Módulo Exclusivo Empresas
              </span>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                Paquetes de Créditos para Cupones y Promociones
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Si no deseas contratar una membresía recurrente, puedes comprar créditos de publicación individuales para tus ofertas. Saldo actual: <strong className="text-amber-400 font-mono text-sm">{couponCredits} Créditos disponibles</strong>.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Tu Saldo de Créditos
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {couponCredits}
              </span>
              <span className="text-[10px] font-bold text-slate-300 block">
                Publicaciones
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between space-y-5 ${
                  pkg.popular
                    ? 'border-rose-500 bg-gradient-to-b from-rose-950/60 via-slate-900 to-slate-950 text-white shadow-xl shadow-rose-950/40'
                    : 'border-slate-800 bg-slate-900/60 text-white'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase shadow-md">
                    RECOMENDADO PARA EMPRESAS
                  </span>
                )}

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
                    <FontAwesomeIcon icon={faBolt} className="text-rose-400" /> {pkg.credits} Cupones / Publicaciones
                  </span>
                  <h3 className="text-xl font-black uppercase text-white">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl font-black text-white">
                      ${pkg.price}
                    </span>
                    <span className="text-xs font-bold text-slate-400">MXN</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                    {pkg.description || `Publica hasta ${pkg.credits} ofertas especiales.`}
                  </p>
                </div>

                <button
                  onClick={() => handleBuyCredits(pkg.id)}
                  disabled={buyingPackageId === pkg.id}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:from-rose-600 hover:to-red-700 py-3 text-xs font-black uppercase text-white shadow-lg shadow-rose-500/25 transition transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
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
        </div>
      )}

      {/* Historial de Compras */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-red-500" />
            Historial de Transacciones
          </h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Registro Oficial de Pagos
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-zinc-950 p-8 text-center space-y-2">
            <History className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-500 opacity-60" />
            <p className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              No se registran transacciones anteriores de compra.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Cuando adquieras un paquete de créditos o membresía, tus transacciones y recibos aparecerán listados aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Plan / Paquete Contratado</th>
                  <th className="p-4">Monto MXN</th>
                  <th className="p-4">Fecha de Pago</th>
                  <th className="p-4">Vigencia Oficial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors text-slate-800 dark:text-slate-200">
                    <td className="p-4 font-black flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Plan {getPlanNameES(t.type)}
                    </td>
                    <td className="p-4 font-mono font-black text-red-600 dark:text-red-400">${t.price} MXN</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                      {new Date(t.paidAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono font-semibold">
                      {new Date(t.startDate).toLocaleDateString()} -{' '}
                      {new Date(t.endDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
