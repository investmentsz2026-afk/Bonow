'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Mail,
  Smartphone,
  MessageSquare,
  Ticket,
  Shield,
  Loader2,
  Calendar,
  Sparkles,
  Building2,
  User,
  Filter,
  CheckCheck,
  Check,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  channels: string[];
  status?: string;
  createdAt: string;
}

const TYPE_MAP: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  PAYMENT_SUCCESS: {
    label: 'Pago de Membresía',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle,
  },
  REDEMPTION_CONFIRM: {
    label: 'Canje de Cupón',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    text: 'text-violet-755 dark:text-violet-400',
    icon: Ticket,
  },
  FAVORITE_COMPANY: {
    label: 'Empresa Favorita',
    bg: 'bg-pink-50 dark:bg-pink-950/20',
    text: 'text-pink-700 dark:text-pink-400',
    icon: Sparkles,
  },
  MEMBERSHIP_EXPIRING: {
    label: 'Aviso de Vencimiento',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: AlertCircle,
  },
  NEW_COUPON: {
    label: 'Nuevo Cupón',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: Ticket,
  },
  PROMOTION: {
    label: 'Promocional',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-400',
    icon: Bell,
  },
  COUPON_PENDING: {
    label: 'Revisión de Cupón',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: AlertCircle,
  },
  COUPON_APPROVED: {
    label: 'Cupón Aprobado',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle,
  },
  COUPON_REJECTED: {
    label: 'Cupón Rechazado',
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-400',
    icon: AlertCircle,
  },
  PROMOTION_PENDING: {
    label: 'Revisión de Promoción',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: AlertCircle,
  },
  PROMOTION_APPROVED: {
    label: 'Promoción Aprobada',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle,
  },
  PROMOTION_REJECTED: {
    label: 'Promoción Rechazada',
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-400',
    icon: AlertCircle,
  },
};

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  EMAIL: Mail,
  WHATSAPP: MessageSquare,
  PUSH: Smartphone,
};

const ADMIN_TYPES = ['COUPON_PENDING', 'PROMOTION_PENDING', 'COMPANY_PENDING'];
const BUSINESS_TYPES = [
  'COUPON_APPROVED',
  'COUPON_REJECTED',
  'PROMOTION_APPROVED',
  'PROMOTION_REJECTED',
  'REDEMPTION_VALIDATED',
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'business' | 'user'>('all');

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.roles && Array.isArray(parsed.roles)) {
          setUserRoles(parsed.roles);
        }
      } catch {
        // Ignorar
      }
    }

    const fetchNotifications = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || 'Error al obtener notificaciones');
        if (isMounted) {
          setNotifications(data as Notification[]);
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

    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  const isAdmin = userRoles.includes('ADMIN');
  const isBusiness = userRoles.includes('BUSINESS');

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await fetch(`http://localhost:3001/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n)),
      );
    } catch {
      // Ignorar error
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await fetch('http://localhost:3001/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'READ' })),
      );
    } catch {
      // Ignorar error
    }
  };

  const handleActionClick = async (notification: Notification, targetUrl: string) => {
    if (notification.status !== 'READ') {
      await handleMarkAsRead(notification.id);
    }
    router.push(targetUrl);
  };

  // Filtrado de notificaciones según rol y tab seleccionado
  const visibleNotifications = notifications.filter((notif) => {
    // Si el usuario no es admin, jamás mostrar notificaciones de administración
    if (!isAdmin && ADMIN_TYPES.includes(notif.type)) {
      return false;
    }

    if (activeTab === 'admin') {
      return ADMIN_TYPES.includes(notif.type);
    }
    if (activeTab === 'business') {
      return BUSINESS_TYPES.includes(notif.type);
    }
    if (activeTab === 'user') {
      return !ADMIN_TYPES.includes(notif.type) && !BUSINESS_TYPES.includes(notif.type);
    }

    return true;
  });

  const unreadCount = visibleNotifications.filter((n) => n.status !== 'READ').length;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-zinc-100 flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            Centro de Alertas
          </h1>
          <p className="text-sm text-gray-500">
            Revisa las notificaciones y avisos dirigidos a tu perfil.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={() => void handleMarkAllAsRead()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300 transition"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Marcar todas leídas ({unreadCount})</span>
            </button>
          )}

          {/* Tabs de Filtro de Notificaciones */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              Todas
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </button>
            )}
            {(isBusiness || isAdmin) && (
              <button
                onClick={() => setActiveTab('business')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition ${
                  activeTab === 'business'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Empresa
              </button>
            )}
            <button
              onClick={() => setActiveTab('user')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition ${
                activeTab === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Usuario
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Historial */}
      {visibleNotifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-850 bg-white dark:bg-zinc-950">
          <Bell className="mx-auto h-12 w-12 text-gray-350 dark:text-gray-600 mb-4" />
          <p className="text-sm font-semibold">
            No tienes notificaciones en esta sección.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleNotifications.map((notification) => {
            const config = TYPE_MAP[notification.type] || {
              label: 'General',
              bg: 'bg-gray-50 dark:bg-zinc-900',
              text: 'text-gray-700 dark:text-gray-350',
              icon: Bell,
            };
            const Icon = config.icon;

            const isNotificationAdmin = ADMIN_TYPES.includes(notification.type);
            const isNotificationBusiness = BUSINESS_TYPES.includes(notification.type);
            const isRead = notification.status === 'READ';

            return (
              <div
                key={notification.id}
                className={`rounded-3xl border p-5 shadow-sm transition duration-300 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  isRead
                    ? 'border-gray-200 bg-white/70 opacity-80 dark:border-gray-800 dark:bg-zinc-950/50'
                    : 'border-violet-200 bg-white dark:border-violet-900/50 dark:bg-zinc-950 shadow-md ring-1 ring-violet-500/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icono de Tipo */}
                  <div
                    className={`rounded-2xl p-3 shrink-0 ${config.bg} ${config.text}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {config.label}
                      </span>

                      {/* Badge de destinatario */}
                      {isNotificationAdmin && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Solo Admin
                        </span>
                      )}
                      {isNotificationBusiness && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> Mi Empresa
                        </span>
                      )}
                      {!isNotificationAdmin && !isNotificationBusiness && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 flex items-center gap-1">
                          <User className="h-3 w-3" /> Mi Cuenta
                        </span>
                      )}

                      {!isRead && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse">
                          Sin Leer
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-gray-850 dark:text-zinc-150">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-550 dark:text-gray-450 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Acciones por tipo de notificación */}
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      {notification.type === 'COUPON_PENDING' && isAdmin && (
                        <button
                          onClick={() =>
                            void handleActionClick(
                              notification,
                              '/admin/dashboard?tab=coupons',
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          <span>Revisar Cupones en Admin</span>
                        </button>
                      )}

                      {notification.type === 'PROMOTION_PENDING' && isAdmin && (
                        <button
                          onClick={() =>
                            void handleActionClick(
                              notification,
                              '/admin/dashboard?tab=promotions',
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          <span>Revisar Promociones en Admin</span>
                        </button>
                      )}

                      {(notification.type === 'COUPON_APPROVED' ||
                        notification.type === 'COUPON_REJECTED') && (
                        <button
                          onClick={() =>
                            void handleActionClick(
                              notification,
                              '/business/coupons',
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700 transition"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          <span>Ir a Mis Cupones</span>
                        </button>
                      )}

                      {(notification.type === 'PROMOTION_APPROVED' ||
                        notification.type === 'PROMOTION_REJECTED') && (
                        <button
                          onClick={() =>
                            void handleActionClick(
                              notification,
                              '/business/coupons?subtab=promotions',
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700 transition"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          <span>Ir a Mis Promociones</span>
                        </button>
                      )}

                      {notification.type === 'MEMBERSHIP_EXPIRING' && (
                        <button
                          onClick={() =>
                            void handleActionClick(notification, '/dashboard/membership')
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 transition"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Renovar Membresía</span>
                        </button>
                      )}

                      {!isRead && (
                        <button
                          onClick={() => void handleMarkAsRead(notification.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-300 transition"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Marcar leída</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta de Canales y Fecha */}
                <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(notification.createdAt).toLocaleDateString(
                      'es-MX',
                      {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>

                  <div className="flex gap-1.5 mt-2 sm:mt-0">
                    {notification.channels.map((chan) => {
                      const ChanIcon = CHANNEL_ICONS[chan] || Smartphone;
                      return (
                        <div
                          key={chan}
                          title={`Enviado por ${chan}`}
                          className="rounded-lg border border-gray-150 p-1.5 text-gray-500 dark:border-gray-800 dark:text-gray-400"
                        >
                          <ChanIcon className="h-3.5 w-3.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


