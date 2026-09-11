'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Award,
  Users,
  Building,
  DollarSign,
  Ticket,
  Loader2,
  AlertCircle,
  BarChart3,
  Heart,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Search,
  Filter,
  Megaphone,
  CheckCircle,
  Clock,
  Ban,
  Tag,
  Building2,
  Sparkles,
  PieChart,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface SVGChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
  isCurrency?: boolean;
}

function SVGBarChart({
  data,
  height = 220,
  barColor = 'url(#barGradientViolet)',
  isCurrency = false,
}: SVGChartProps) {
  if (!data || data.length === 0)
    return (
      <p className="text-xs text-zinc-400 text-center py-8">
        Sin datos temporales suficientes.
      </p>
    );

  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const padding = 30;
  const chartHeight = height - padding;
  const chartWidth = 550;
  const barWidth = Math.max(
    12,
    Math.floor((chartWidth - padding * 2) / data.length) - 16,
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full min-w-[450px]"
      >
        <defs>
          <linearGradient id="barGradientViolet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        <line
          x1={padding}
          y1={chartHeight}
          x2={chartWidth - padding}
          y2={chartHeight}
          stroke="#e4e4e7"
          strokeWidth={1}
          className="dark:stroke-zinc-800"
        />

        {data.map((d, i) => {
          const x =
            padding + i * ((chartWidth - padding * 2) / data.length) + 10;
          const barHeight = (d.value / maxVal) * (chartHeight - 25);
          const y = chartHeight - barHeight;

          return (
            <g key={i} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                rx={6}
                className="transition-all duration-300 hover:opacity-85"
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="text-[10px] font-black fill-zinc-800 dark:fill-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isCurrency ? `$${d.value}` : d.value}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 18}
                textAnchor="middle"
                className="text-[10px] font-bold fill-zinc-400 dark:fill-zinc-500 uppercase"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [role, setRole] = useState<'USER' | 'BUSINESS' | 'ADMIN' | null>(null);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [metrics, setMetrics] = useState<any>(null);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros de Reportes
  const [activeReportTab, setActiveReportTab] = useState<
    'OVERVIEW' | 'COMPANIES' | 'USERS' | 'COUPONS' | 'ADS' | 'FINANCIAL'
  >('OVERVIEW');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');

  const router = useRouter();

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    const userRoles = user.roles || [];

    let currentRole: 'USER' | 'BUSINESS' | 'ADMIN' = 'USER';
    if (userRoles.includes('ADMIN')) currentRole = 'ADMIN';
    else if (userRoles.includes('BUSINESS')) currentRole = 'BUSINESS';

    setRole(currentRole);

    const endpoint = currentRole.toLowerCase();

    try {
      const resMetrics = await fetch(
        `${API_URL}/analytics/${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const metricsData = await resMetrics.json();
      if (resMetrics.ok) {
        setMetrics(metricsData);
      }

      if (currentRole === 'ADMIN') {
        const queryParams = new URLSearchParams();
        if (searchFilter) queryParams.set('search', searchFilter);
        if (statusFilter) queryParams.set('status', statusFilter);
        if (categoryFilter) queryParams.set('categoryId', categoryFilter);

        const resReports = await fetch(
          `${API_URL}/analytics/admin/reports?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const repData = await resReports.json();
        if (resReports.ok) {
          setReportsData(repData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchFilter, statusFilter, categoryFilter]);

  // Exportar reporte activo a CSV
  const handleExportCSV = () => {
    if (!reportsData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    let fileName = `reporte_plataforma_${activeReportTab.toLowerCase()}_${Date.now()}.csv`;

    if (activeReportTab === 'COMPANIES' && reportsData.companies) {
      csvContent += 'ID,Nombre Comercial,Razon Social,Email Propietario,Categoria,Estado,Creditos,Sucursales,Cupones,Canjes Totales,Fecha Registro\n';
      reportsData.companies.forEach((c: any) => {
        csvContent += `"${c.id}","${c.name}","${c.corporateName}","${c.ownerEmail}","${c.categoryName}","${c.status}",${c.couponCredits},${c.branchesCount},${c.couponsCount},${c.totalRedemptions},"${new Date(c.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (activeReportTab === 'USERS' && reportsData.users) {
      csvContent += 'ID,Nombre,Email,Telefono,Estado,Roles,Membresia,Estado Membresia,Ahorro Acumulado MXN,Fecha Registro\n';
      reportsData.users.forEach((u: any) => {
        csvContent += `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.status}","${u.roles.join('/')}","${u.membershipType}","${u.membershipStatus}",${u.accumulatedSavings},"${new Date(u.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (activeReportTab === 'COUPONS' && reportsData.coupons) {
      csvContent += 'ID,Titulo,Descuento,Empresa,Categoria,Tipo,Estado,Limite Usos,Canjes Efectuados,Fecha Inicio,Fecha Vencimiento\n';
      reportsData.coupons.forEach((cp: any) => {
        csvContent += `"${cp.id}","${cp.title}","${cp.discount}","${cp.companyName}","${cp.categoryName}","${cp.type}","${cp.status}",${cp.usageLimit || 'Ilimitado'},${cp.usageCount},"${new Date(cp.startDate).toLocaleDateString()}","${new Date(cp.endDate).toLocaleDateString()}"\n`;
      });
    } else if (activeReportTab === 'FINANCIAL' && reportsData.transactions) {
      csvContent += 'ID Transaccion,Usuario,Email,Monto MXN,Plan/Concepto,Proveedor Pasarela,Estado,Fecha Pago\n';
      reportsData.transactions.forEach((tx: any) => {
        csvContent += `"${tx.providerTxId}","${tx.userName}","${tx.userEmail}",${tx.amount},"${tx.planType}","${tx.provider}","${tx.status}","${new Date(tx.createdAt).toLocaleDateString()}"\n`;
      });
    } else {
      csvContent += 'Metrica,Valor\n';
      csvContent += `Usuarios Totales,${reportsData.summary?.totalUsers || 0}\n`;
      csvContent += `Empresas Afiliadas,${reportsData.summary?.totalCompanies || 0}\n`;
      csvContent += `Cupones Canjeados,${reportsData.summary?.totalRedemptions || 0}\n`;
      csvContent += `Ingresos Totales MXN,${reportsData.summary?.totalRevenue || 0}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir reporte oficial en formato limpio
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
        <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">
          Generando Reportes de Plataforma...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const summary = reportsData?.summary || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8 print:p-0">
      {/* CABECERA PRINCIPAL REPORTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 print:border-none">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-violet-200 dark:border-violet-800/40">
            <BarChart3 className="h-3.5 w-3.5" />
            Módulo Oficial de Administración
          </span>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-3">
            <span>Reportes de Plataforma</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Análisis comercial consolidado, métricas de rendimiento y descarga de informes de BONOW en tiempo real.
          </p>
        </div>

        {/* Botones de Acción de Reporte */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={() => void loadAllData()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 shadow-md shadow-violet-600/20 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* RENDER ADMIN: REPORTES INTEGRALES DE PLATAFORMA */}
      {role === 'ADMIN' && (
        <div className="space-y-8">
          {/* BARRA DE FILTROS AVANZADOS DE PLATAFORMA */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-violet-600" />
                Filtros Globales de Reporte
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">
                Aplica criterios para filtrar resultados en vivo
              </span>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar por nombre, email o título..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-2.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-violet-500 font-medium"
                />
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
              </div>

              {/* Filtro Estado */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-2.5 px-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-violet-500 font-bold"
                >
                  <option value="">-- Todos los Estados --</option>
                  <option value="APPROVED">Aprobados / Activos (APPROVED)</option>
                  <option value="PENDING">Pendientes (PENDING)</option>
                  <option value="SUSPENDED">Suspendidos (SUSPENDED)</option>
                  <option value="ACTIVE">Activos (ACTIVE)</option>
                </select>
              </div>

              {/* Filtro Categoría */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-2.5 px-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-violet-500 font-bold"
                >
                  <option value="">-- Todas las Categorías --</option>
                  {reportsData?.categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Rango de Tiempo */}
              <div>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-2.5 px-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-violet-500 font-bold"
                >
                  <option value="ALL">Todo el Histórico</option>
                  <option value="TODAY">Hoy</option>
                  <option value="WEEK">Últimos 7 Días</option>
                  <option value="MONTH">Últimos 30 Días</option>
                  <option value="YEAR">Año Actual (2026)</option>
                </select>
              </div>
            </div>
          </div>

          {/* TARJETAS DE INDICADORES CLAVE (KPIS DE PLATAFORMA) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-sky-500">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Usuarios Totales
                </span>
                <Users className="h-4 w-4" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {summary.totalUsers || 0}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">
                  {summary.activeUsers || 0} Activos
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-indigo-500">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Empresas Afiliadas
                </span>
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {summary.totalCompanies || 0}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">
                  {summary.approvedCompanies || 0} Aprobadas
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-violet-600">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Cupones Creados
                </span>
                <Ticket className="h-4 w-4" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {summary.totalCoupons || 0}
                </span>
                <span className="text-[10px] text-violet-500 font-bold">
                  {summary.activeCoupons || 0} Activos
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-emerald-500">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Canjes Efectuados
                </span>
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {summary.totalRedemptions || 0}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">En Caja</span>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-amber-500">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Suscripciones
                </span>
                <Award className="h-4 w-4" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {summary.activeMemberships || 0}
                </span>
                <span className="text-[10px] text-amber-500 font-bold">BONOW+</span>
              </div>
            </div>

            <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg space-y-2">
              <div className="flex items-center justify-between text-white/80">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Recaudación Total
                </span>
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <span className="text-2xl font-black font-mono">
                  ${summary.totalRevenue || 0} MXN
                </span>
                <span className="text-[9px] text-violet-200 block font-bold mt-0.5">
                  Ticket Prom: ${summary.avgTicket || '0.00'} MXN
                </span>
              </div>
            </div>
          </div>

          {/* SELECCIÓN DE REPORTE ESPECÍFICO (TABS REPORTE) */}
          <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 print:hidden">
            {[
              { id: 'OVERVIEW', label: '📊 Resumen Ejecutivo', icon: PieChart },
              { id: 'COMPANIES', label: '🏢 Reporte de Empresas', icon: Building2 },
              { id: 'USERS', label: '👥 Reporte de Usuarios', icon: Users },
              { id: 'COUPONS', label: '🎟️ Reporte de Cupones', icon: Ticket },
              { id: 'ADS', label: '📢 Reporte Publicidad', icon: Megaphone },
              { id: 'FINANCIAL', label: '💰 Reporte Financiero', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
                  activeReportTab === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: RESUMEN EJECUTIVO (TENDENCIAS Y GRÁFICOS) */}
          {activeReportTab === 'OVERVIEW' && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                    <span>Evolución de Ingresos Recaudados (Últimos 6 meses)</span>
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400">
                    Venta de Membresías y Créditos
                  </span>
                </div>
                <SVGBarChart data={metrics?.trends || []} isCurrency={true} />
              </div>

              <div className="md:col-span-1 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                  <span>Resumen del Sistema</span>
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Informe comercial centralizado con estadísticas reales procesadas desde la base de datos de la plataforma BONOW.
                </p>

                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-bold">Empresas Aprobadas</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {summary.approvedCompanies || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-bold">Empresas Pendientes</span>
                    <span className="font-black text-amber-500">
                      {summary.pendingCompanies || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-bold">Ticket Promedio por Usuario</span>
                    <span className="font-black font-mono text-violet-600 dark:text-violet-400">
                      ${summary.avgTicket || '0.00'} MXN
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 font-bold">Redenciones Exitosas</span>
                    <span className="font-black text-sky-500">
                      {summary.totalRedemptions || 0} Canjes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPORTE DE EMPRESAS AFILIADAS */}
          {activeReportTab === 'COMPANIES' && (
            <div className="space-y-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-violet-600" />
                    <span>Reporte Detallado de Empresas Afiliadas</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Se muestran {reportsData?.companies?.length || 0} empresas registradas en la plataforma.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-black uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-3">Empresa / Razón Social</th>
                      <th className="p-3">Propietario</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Créditos</th>
                      <th className="p-3">Sucursales</th>
                      <th className="p-3">Cupones</th>
                      <th className="p-3">Canjes Totales</th>
                      <th className="p-3">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {reportsData?.companies?.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-zinc-400">
                          No se encontraron empresas con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      reportsData?.companies?.map((comp: any) => (
                        <tr key={comp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition">
                          <td className="p-3 font-bold">
                            <span className="text-zinc-900 dark:text-white block font-black">{comp.name}</span>
                            <span className="text-[10px] text-zinc-400 block">{comp.corporateName}</span>
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-300">
                            <span>{comp.ownerEmail}</span>
                          </td>
                          <td className="p-3 font-semibold text-violet-600 dark:text-violet-400">
                            {comp.categoryName}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                comp.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : comp.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
                              }`}
                            >
                              {comp.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-500">
                            {comp.couponCredits} ⚡
                          </td>
                          <td className="p-3 font-semibold">{comp.branchesCount}</td>
                          <td className="p-3 font-semibold">{comp.couponsCount}</td>
                          <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                            {comp.totalRedemptions}
                          </td>
                          <td className="p-3 text-zinc-400 font-mono">
                            {new Date(comp.createdAt).toLocaleDateString('es-MX')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REPORTE DE USUARIOS Y SUSCRIPTORES */}
          {activeReportTab === 'USERS' && (
            <div className="space-y-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-600" />
                    <span>Reporte Detallado de Usuarios Registrados</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Se muestran {reportsData?.users?.length || 0} usuarios listados en el sistema.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-black uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-3">Nombre Completo</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Roles</th>
                      <th className="p-3">Membresía BONOW+</th>
                      <th className="p-3">Ahorro Acumulado</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {reportsData?.users?.map((u: any) => (
                      <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition">
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{u.name}</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-300 font-medium">{u.email}</td>
                        <td className="p-3 font-mono text-zinc-400">{u.phone}</td>
                        <td className="p-3 font-semibold text-violet-600 dark:text-violet-400">
                          {u.roles.join(', ')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              u.membershipStatus === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {u.membershipType} ({u.membershipStatus})
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${u.accumulatedSavings.toFixed(2)} MXN
                        </td>
                        <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">{u.status}</td>
                        <td className="p-3 text-zinc-400 font-mono">
                          {new Date(u.createdAt).toLocaleDateString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REPORTE DE CUPONES Y CANJES */}
          {activeReportTab === 'COUPONS' && (
            <div className="space-y-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-violet-600" />
                    <span>Reporte Detallado de Cupones y Redenciones</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Catálogo general de cupones y canjes procesados en comercios.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-black uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-3">Título del Cupón</th>
                      <th className="p-3">Empresa Emisora</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Descuento</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Canjes Totales</th>
                      <th className="p-3">Límite</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Vigencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {reportsData?.coupons?.map((cp: any) => (
                      <tr key={cp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition">
                        <td className="p-3 font-black text-zinc-900 dark:text-white">{cp.title}</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300 font-bold">{cp.companyName}</td>
                        <td className="p-3 font-semibold text-violet-600 dark:text-violet-400">{cp.categoryName}</td>
                        <td className="p-3 font-black text-rose-600 dark:text-rose-400">{cp.discount}</td>
                        <td className="p-3 text-zinc-500 font-semibold">{cp.type}</td>
                        <td className="p-3 font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                          {cp.usageCount}
                        </td>
                        <td className="p-3 font-mono text-zinc-400">{cp.usageLimit || 'Ilimitado'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              cp.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                            }`}
                          >
                            {cp.status}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400 font-mono">
                          {new Date(cp.startDate).toLocaleDateString()} - {new Date(cp.endDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REPORTE DE PUBLICIDAD Y ANUNCIOS */}
          {activeReportTab === 'ADS' && (
            <div className="space-y-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-violet-600" />
                    <span>Reporte de Publicidad y Banners Promocionales</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Estadísticas de impacto comercial (Impresiones y Clics).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-black uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-3">Título Anuncio</th>
                      <th className="p-3">Empresa Anunciante</th>
                      <th className="p-3">Posición</th>
                      <th className="p-3">Impresiones (Vistas)</th>
                      <th className="p-3">Clics Recibidos</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Vigencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {reportsData?.ads?.map((ad: any) => (
                      <tr key={ad.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition">
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{ad.title}</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300 font-semibold">{ad.companyName}</td>
                        <td className="p-3 font-mono text-violet-600 dark:text-violet-400">{ad.position}</td>
                        <td className="p-3 font-black text-sky-500 font-mono">{ad.impressions}</td>
                        <td className="p-3 font-black text-emerald-500 font-mono">{ad.clicks}</td>
                        <td className="p-3 font-bold">{ad.status}</td>
                        <td className="p-3 text-zinc-400 font-mono">
                          {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTE FINANCIERO E INGRESOS STRIPE */}
          {activeReportTab === 'FINANCIAL' && (
            <div className="space-y-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-violet-600" />
                    <span>Reporte Financiero y Recaudación de Pagos</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Historial de transacciones de Stripe y suscripciones BONOW+.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 font-black uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-3">Referencia TxID</th>
                      <th className="p-3">Cliente / Usuario</th>
                      <th className="p-3">Monto Recaudado</th>
                      <th className="p-3">Concepto / Plan</th>
                      <th className="p-3">Pasarela</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Fecha de Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {reportsData?.transactions?.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition">
                        <td className="p-3 font-mono text-[11px] text-zinc-400">{tx.providerTxId}</td>
                        <td className="p-3 font-bold">
                          <span className="text-zinc-900 dark:text-white block">{tx.userName}</span>
                          <span className="text-[10px] text-zinc-400 block font-normal">{tx.userEmail}</span>
                        </td>
                        <td className="p-3 font-mono font-black text-violet-600 dark:text-violet-400 text-sm">
                          ${tx.amount.toFixed(2)} MXN
                        </td>
                        <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">{tx.planType}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-violet-600 text-white text-[10px] font-black uppercase">
                            {tx.provider}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              tx.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400 font-mono">
                          {new Date(tx.createdAt).toLocaleDateString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER ROL: BUSINESS */}
      {role === 'BUSINESS' && metrics && (
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-zinc-400">Cupones Canjeados</span>
              <p className="text-3xl font-black text-zinc-900 dark:text-white">{metrics.couponsUsed}</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-zinc-400">Clientes Únicos</span>
              <p className="text-3xl font-black text-zinc-900 dark:text-white">{metrics.uniqueUsers}</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-zinc-400">Desempeño Comercial</span>
              <p className="text-xl font-black text-emerald-500">
                {metrics.couponsUsed > 0 ? 'Excelente Rendimiento' : 'Sin Canjes Registrados'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-600" />
              <span>Redenciones Mensuales de tu Empresa</span>
            </h3>
            <SVGBarChart data={metrics.trends || []} />
          </div>
        </div>
      )}

      {/* RENDER ROL: USER */}
      {role === 'USER' && metrics && (
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-zinc-400">Ahorro Acumulado</span>
              <p className="text-3xl font-black text-emerald-600 font-mono">${metrics.accumulatedSavings} MXN</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-zinc-400">Cupones Usados</span>
              <p className="text-3xl font-black text-zinc-900 dark:text-white">{metrics.couponsUsed}</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-zinc-400">Estatus Membresía</span>
              <p className="text-xl font-black text-violet-600">BONOW+ Activo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
