'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  Building2,
  Ticket,
  Shield,
  CreditCard,
  Megaphone,
  FileText,
  MapPin,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  DollarSign,
  Activity,
  ChevronRight,
  ShieldCheck,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faBuilding, faTicketAlt, faLandmark } from '@fortawesome/free-solid-svg-icons';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalMemberships: number;
  totalEarningsMXN: number;
}

interface RecentActivity {
  text: string;
  desc: string;
  time: string;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (res.ok && isMounted) {
          setStats(data.stats);
          setActivities(data.recentActivities || []);
        } else if (isMounted) {
          setError(data.message || 'Error al cargar métricas de administración');
        }
      } catch (err) {
        if (isMounted) {
          setError('Error de conexión con el servidor de administración');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-xs font-bold text-zinc-500 animate-pulse">
            Cargando Consola Ejecutivo de Administración...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
        <h3 className="font-bold">Error de acceso a administración</h3>
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

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 text-left">
      {/* 1. SECCIÓN BANNER EJECUTIVO PRINCIPAL */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-950 via-slate-900 to-violet-950 p-6 md:p-8 text-white shadow-2xl border border-violet-900/40 relative overflow-hidden space-y-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                SISTEMA 100% OPERATIVO
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
                PORTAL ADMINISTRATIVO EMPRESARIAL
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mt-2.5 flex items-center gap-2">
              <span>¡Bienvenido, Administrador!</span> <FontAwesomeIcon icon={faLandmark} className="text-amber-400 text-2xl md:text-3xl ml-1" />
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-xl">
              Panel general de control ejecutivo: rendimiento comercial, actividad de usuarios, comercios aliados e indicadores de crecimiento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white px-4 py-3 text-xs font-bold transition border border-white/15 backdrop-blur-md"
            >
              <Eye className="h-4 w-4 text-amber-300" />
              <span>Ver sitio público ↗</span>
            </Link>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white px-5 py-3 text-xs font-black transition shadow-lg shadow-red-500/30 uppercase tracking-wider"
            >
              <Users className="h-4 w-4" />
              <span>Panel General Admin</span>
            </Link>
          </div>
        </div>

        {/* Resumen de Estado de la Plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCoins} className="h-3.5 w-3.5" />
              <span>Ingresos Mensuales de Plataforma</span>
            </span>
            <div className="text-2xl font-black text-white font-mono">
              ${(stats?.totalEarningsMXN ?? 0).toLocaleString('es-MX')} <span className="text-xs text-slate-300">MXN</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Membresías activas + paquetes de créditos vendidos a empresas.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBuilding} className="h-3.5 w-3.5" />
              <span>Empresas Aliadas Registradas</span>
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {stats?.totalCompanies ?? 0} <span className="text-xs text-amber-400 font-bold">({stats?.pendingCompanies ?? 0} pendientes)</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Comercios ofreciendo descuentos y promociones en la plataforma.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-300 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTicketAlt} className="h-3.5 w-3.5" />
              <span>Cupones en Catálogo Público</span>
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {stats?.activeCoupons ?? 0} <span className="text-xs text-slate-300">activos</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Ofertas verificadas y publicadas para los usuarios del club.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS CLAVE (DATOS REALES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-violet-50 dark:bg-violet-950/40 p-2.5 rounded-2xl text-violet-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                Usuarios Registrados
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white">
                {stats?.totalUsers ?? 0}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 block">
            {stats?.activeUsers ?? 0} usuarios activos en el club
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl text-emerald-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                Empresas Aliadas
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white">
                {stats?.totalCompanies ?? 0}
              </div>
            </div>
          </div>
          <Link href="/admin/companies" className="text-[10px] font-bold text-violet-600 hover:underline block">
            Administrar empresas →
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-2xl text-amber-600">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                Cupones en Plataforma
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white">
                {stats?.totalCoupons ?? 0}
              </div>
            </div>
          </div>
          <Link href="/admin/dashboard?tab=coupons" className="text-[10px] font-bold text-amber-600 hover:underline block">
            Revisar cupones →
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl text-rose-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                Membresías VIP
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white">
                {stats?.totalMemberships ?? 0}
              </div>
            </div>
          </div>
          <Link href="/admin/dashboard?tab=memberships" className="text-[10px] font-bold text-rose-600 hover:underline block">
            Ver suscripciones →
          </Link>
        </div>
      </div>

      {/* 3. CENTRO DE ACCIONES EJECUTIVAS DE ADMINISTRACIÓN */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-500" />
          Módulos de Gestión de Administración
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Módulo 1: Empresas y Contratos */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-red-500/40 transition">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-zinc-900 dark:text-white text-base">
                Gestión de Empresas & Contratos
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Aprobación de nuevos registros comerciales, contratos fiscales y sucursales.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin/companies"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Administrar Empresas</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link
                href="/admin/contracts"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Administrar Contratos</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Módulo 2: Cupones y Publicidad */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-red-500/40 transition">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-zinc-900 dark:text-white text-base">
                Catálogo & Publicidad
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Aprobación de ofertas, moderación de cupones y banners destacados en portada.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin/dashboard?tab=coupons"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Revisión de Cupones</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link
                href="/admin/ads"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Administrar Publicidad</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Módulo 3: Finanzas y Configuración */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-red-500/40 transition">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-zinc-900 dark:text-white text-base">
                Finanzas & Configuración
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Definición de paquetes de créditos, planes de membresía y reportes del club.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin/dashboard?tab=memberships"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Planes & Tarifas</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
              <Link
                href="/dashboard/analytics"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Reportes Financieros</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVIDAD RECIENTE DEL SISTEMA */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="font-black text-zinc-900 dark:text-white text-base uppercase flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-600" />
            Actividad Reciente en la Plataforma
          </h3>
          <span className="text-xs text-zinc-400 font-bold">Monitoreo en vivo</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {activities.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">
              No hay actividad reciente registrada en el sistema.
            </p>
          ) : (
            activities.map((act, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">{act.text}</p>
                  <span className="text-[10px] text-zinc-400">{act.desc}</span>
                </div>
                <span className="text-[10px] text-zinc-450 font-mono">
                  {new Date(act.time).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
