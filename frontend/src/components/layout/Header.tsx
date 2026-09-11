'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import {
  Menu,
  Bell,
  User,
  MapPin,
  ChevronDown,
  LogOut,
  HelpCircle,
  Loader2,
  X,
  Shield,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCheck,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BonowLogo } from './BonowLogo';

interface HeaderProps {
  onMenuToggle: () => void;
}

interface UserSession {
  firstName: string;
  lastName: string;
  role?: string;
  roles?: string[];
}

interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  channels: string[];
  status?: string;
  createdAt: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [activeToast, setActiveToast] = useState<HeaderNotification | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Escuchar sesión y notificaciones del usuario
  useEffect(() => {
    let isMounted = true;

    const handleStorage = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored) as UserSession);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    handleStorage();
    window.addEventListener('storage', handleStorage);

    const closeDropdown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#profile-dropdown-container')) {
        setIsDropdownOpen(false);
      }
      if (!target.closest('#bell-dropdown-container')) {
        setIsBellOpen(false);
      }
    };
    window.addEventListener('click', closeDropdown);

    // Obtener notificaciones del backend
    const fetchHeaderNotifications = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (isMounted) {
          setNotifications([]);
          setActiveToast(null);
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setNotifications(data as HeaderNotification[]);

          // Evaluar si hay notificaciones no leídas ni descartadas en la sesión actual
          const dismissed = JSON.parse(
            sessionStorage.getItem('dismissed_toasts') || '[]',
          ) as string[];
          const unreadUrgent = (data as HeaderNotification[]).find(
            (n) => n.status !== 'READ' && !dismissed.includes(n.id),
          );
          if (unreadUrgent) {
            setActiveToast(unreadUrgent);
          }
        }
      } catch {
        // Silencioso
      }
    };

    void fetchHeaderNotifications();

    // Polling cada 15 segundos y re-evaluar al enfocar ventana
    const interval = setInterval(() => {
      void fetchHeaderNotifications();
    }, 15000);

    const handleFocus = () => {
      void fetchHeaderNotifications();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('click', closeDropdown);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname]);

  const unreadCount = notifications.filter((n) => n.status !== 'READ').length;

  const handleDismissToast = (id: string) => {
    const dismissed = JSON.parse(
      sessionStorage.getItem('dismissed_toasts') || '[]',
    ) as string[];
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      sessionStorage.setItem('dismissed_toasts', JSON.stringify(dismissed));
    }
    setActiveToast(null);
  };

  const handleNotificationClick = async (notif: HeaderNotification) => {
    handleDismissToast(notif.id);
    setIsBellOpen(false);

    // Marcar como leída en backend
    const token = localStorage.getItem('accessToken');
    if (token && notif.status !== 'READ') {
      try {
        await fetch(`${API_URL}/notifications/${notif.id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, status: 'READ' } : n)),
        );
      } catch {
        // Silencioso
      }
    }

    // Redirección por tipo de notificación
    if (notif.type === 'COUPON_PENDING') {
      router.push('/admin/dashboard?tab=coupons');
    } else if (notif.type === 'PROMOTION_PENDING') {
      router.push('/admin/dashboard?tab=promotions');
    } else if (notif.type === 'COMPANY_PENDING') {
      router.push('/admin/dashboard?tab=companies');
    } else if (
      notif.type === 'COUPON_APPROVED' ||
      notif.type === 'COUPON_REJECTED'
    ) {
      router.push('/business/coupons');
    } else if (
      notif.type === 'PROMOTION_APPROVED' ||
      notif.type === 'PROMOTION_REJECTED'
    ) {
      router.push('/business/coupons?subtab=promotions');
    } else if (notif.type === 'MEMBERSHIP_EXPIRING') {
      router.push('/dashboard/membership');
    } else if (notif.type === 'PAYMENT_SUCCESS') {
      router.push('/dashboard');
    } else if (notif.type === 'NEW_COUPON' || notif.type === 'FAVORITE_COMPANY') {
      router.push('/coupons');
    } else {
      router.push('/dashboard/notifications');
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'READ' })),
      );
    } catch {
      // Silencioso
    }
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (e) {
        console.error('Error al revocar refresh token', e);
      }
    }

    setTimeout(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setShowLogoutModal(false);
      setIsLoggingOut(false);
      router.push('/login');
    }, 1200);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-zinc-200 bg-white/95 px-6 dark:border-zinc-800 dark:bg-zinc-950/95 shadow-sm">
        {/* Lado Izquierdo: Menu Hamburguesa + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-zinc-650 hover:bg-zinc-100 dark:text-zinc-350 dark:hover:bg-zinc-900 lg:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <BonowLogo size="md" showSlogan={true} />
            </Link>
          </div>
        </div>

        {/* Menú Central: Opciones de Navegación (Solo Desktop) */}
        <nav className="hidden lg:flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full transition ${
              pathname === '/'
                ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-105'
                : 'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            Inicio
          </Link>

          {!pathname.startsWith('/admin') &&
            user?.role !== 'ADMIN' &&
            !(Array.isArray(user?.roles) && user.roles.includes('ADMIN')) && (
              <button
                onClick={() =>
                  user ? router.push('/explore') : router.push('/login')
                }
                className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                  pathname === '/explore' || pathname === '/coupons' || pathname === '/explorar'
                    ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-105'
                    : 'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                }`}
              >
                Explorar
              </button>
            )}

          <button
            onClick={() =>
              user ? router.push('/categories') : router.push('/login')
            }
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              pathname === '/categories'
                ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-105'
                : 'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            Categorías
          </button>

          <button
            onClick={() =>
              user ? router.push('/promotions') : router.push('/login')
            }
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              pathname === '/promotions'
                ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-105'
                : 'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            Promociones
          </button>

          <button
            onClick={() =>
              user ? router.push('/companies') : router.push('/login')
            }
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              pathname === '/companies'
                ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-105'
                : 'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            Empresas
          </button>

          <button
            onClick={() => {
              if (!user) {
                router.push('/login');
              } else if (user.role === 'BUSINESS') {
                router.push('/business/map');
              } else {
                router.push('/dashboard/map');
              }
            }}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              pathname.includes('/map')
                ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-105'
                : 'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            Mapa
          </button>

          <button
            onClick={() => router.push('/about')}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              pathname === '/about'
                ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-105'
                : 'hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
          >
            Nosotros
          </button>
        </nav>

        {/* Lado Derecho: Ubicación, Notificaciones, Sesión */}
        <div className="flex items-center gap-4">
          {/* Selector de Ciudad */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350">
            <MapPin className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
            <span>Ciudad de México</span>
          </div>

          {/* Notificaciones y Popover */}
          <div id="bell-dropdown-container" className="relative">
            <button
              onClick={() =>
                user ? setIsBellOpen(!isBellOpen) : router.push('/login')
              }
              className="relative rounded-lg p-2 text-zinc-650 hover:bg-zinc-100 dark:text-zinc-350 dark:hover:bg-zinc-900 cursor-pointer transition"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* POPOVER DROPDOWN DE NOTIFICACIONES */}
            {isBellOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Notificaciones ({unreadCount} no leídas)
                    </h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => void handleMarkAllAsRead()}
                      className="text-[11px] font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Marcar leídas
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      No tienes notificaciones registradas.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => {
                      const isRead = n.status === 'READ';
                      return (
                        <div
                          key={n.id}
                          onClick={() => void handleNotificationClick(n)}
                          className={`group flex items-start gap-3 rounded-2xl p-2.5 transition cursor-pointer border ${
                            isRead
                              ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent text-zinc-400'
                              : 'bg-white dark:bg-zinc-850 border-violet-100 dark:border-violet-900/40 shadow-sm'
                          }`}
                        >
                          <div
                            className={`rounded-xl p-2 shrink-0 mt-0.5 ${
                              isRead
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                                : 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400'
                            }`}
                          >
                            {n.type.includes('ADMIN') ||
                            n.type.includes('PENDING') ? (
                              <Shield className="h-4 w-4 text-amber-500" />
                            ) : n.type.includes('APPROVED') ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : n.type.includes('REJECTED') ? (
                              <AlertTriangle className="h-4 w-4 text-rose-500" />
                            ) : (
                              <Bell className="h-4 w-4 text-violet-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-xs font-bold transition ${
                                  isRead
                                    ? 'text-zinc-500 dark:text-zinc-400'
                                    : 'text-zinc-800 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400'
                                }`}
                              >
                                {n.title}
                              </h4>
                              {!isRead && (
                                <span className="h-2 w-2 rounded-full bg-violet-600 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[9px] font-semibold text-zinc-400 block pt-1">
                              {new Date(n.createdAt).toLocaleDateString(
                                'es-MX',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: 'numeric',
                                  month: 'short',
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setIsBellOpen(false)}
                    className="block w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white transition"
                  >
                    Ir al Centro de Alertas
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Perfil del usuario / Iniciar Sesión */}
          {user ? (
            <div className="flex items-center gap-3">
              {pathname !== '/dashboard' && (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-red-500/20 transition"
                >
                  Ir al Dashboard
                </Link>
              )}

              <div id="profile-dropdown-container" className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 transition focus:outline-none"
                >
                  <div className="flex h-6 w-6 items-center justify-between rounded-full bg-gradient-to-tr from-[#0F1E36] to-red-500 text-white">
                    <User className="m-auto h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">
                    {user.firstName}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* DROPDOWN MENU */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-850 dark:bg-zinc-900 z-50 transform origin-top-right transition duration-200 ease-out animate-in fade-in slide-in-from-top-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition text-left w-full"
                    >
                      <User className="h-4 w-4 text-red-500" />
                      <span>Ver perfil</span>
                    </Link>
                    <Link
                      href="/profile?tab=account"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition text-left w-full"
                    >
                      <CreditCard className="h-4 w-4 text-violet-500" />
                      <span>Mi Cuenta & Tarjeta</span>
                    </Link>
                    <a
                      href="#"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition text-left w-full"
                    >
                      <HelpCircle className="h-4 w-4 text-red-500" />
                      <span>Ayuda y soporte</span>
                    </a>
                    <hr className="my-1.5 border-zinc-100 dark:border-zinc-800" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition px-2 py-1.5"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-red-500/20 transition"
              >
                Únete ahora
              </Link>
            </div>
          )}
        </div>

        {/* CONFIRM LOGOUT MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            />

            {/* Dialog Card */}
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-300 animate-in fade-in zoom-in-95">
              {isLoggingOut ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 animate-pulse">
                    Cerrando sesión de forma segura...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
                    <LogOut className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-850 dark:text-white uppercase tracking-wider">
                      ¿Cerrar sesión?
                    </h3>
                    <p className="text-xs text-zinc-450 dark:text-zinc-550 leading-relaxed">
                      ¿Estás seguro de que deseas salir de tu cuenta de BONOW?
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white dark:border-zinc-855 dark:bg-zinc-900 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition"
                    >
                      No, cancelar
                    </button>
                    <button
                      onClick={() => void handleLogoutConfirm()}
                      className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 py-2.5 text-xs font-bold text-white transition shadow-md shadow-red-500/10"
                    >
                      Sí, salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* BURBUJA FLOTANTE / TOAST ANIMADO DE NOTIFICACIÓN DESTACADA */}
      {activeToast && (
        <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 rounded-3xl p-5 shadow-2xl border border-white/20 backdrop-blur-xl transition-all duration-500 animate-in slide-in-from-top-6 fade-in bg-gradient-to-r from-gray-900/95 via-zinc-900/95 to-violet-950/95 text-white ring-1 ring-violet-500/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              {/* Icono con Anillo de Pulsación */}
              <div className="relative shrink-0 mt-0.5">
                <span className="absolute -inset-1 rounded-2xl bg-violet-500/40 animate-ping opacity-75"></span>
                <div className="relative rounded-2xl p-2.5 bg-violet-600/80 text-white shadow-lg shadow-violet-600/30">
                  {activeToast.type.includes('ADMIN') ||
                  activeToast.type.includes('PENDING') ? (
                    <Shield className="h-5 w-5 text-amber-300" />
                  ) : activeToast.type.includes('APPROVED') ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  ) : activeToast.type.includes('REJECTED') ? (
                    <AlertTriangle className="h-5 w-5 text-rose-300" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-violet-300" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {activeToast.type.includes('PENDING')
                      ? 'Acción Requerida'
                      : activeToast.type.includes('APPROVED')
                      ? 'Aprobación Exitosa'
                      : activeToast.type.includes('REJECTED')
                      ? 'Aviso Importante'
                      : 'Notificación'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-tight">
                  {activeToast.title}
                </h4>

                <p className="text-xs text-zinc-300 leading-snug line-clamp-2">
                  {activeToast.message}
                </p>

                {/* Botón de Acción Directa en la Burbuja */}
                <div className="pt-2">
                  <button
                    onClick={() => void handleNotificationClick(activeToast)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-600/30 transition group cursor-pointer"
                  >
                    <span>
                      {activeToast.type === 'COUPON_PENDING'
                        ? 'Revisar Cupones'
                        : activeToast.type === 'PROMOTION_PENDING'
                        ? 'Revisar Promoción'
                        : activeToast.type.includes('APPROVED') ||
                          activeToast.type.includes('REJECTED')
                        ? 'Ver Mis Promociones'
                        : 'Ver Detalle'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de Cerrar Burbuja */}
            <button
              onClick={() => handleDismissToast(activeToast.id)}
              className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition shrink-0 cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

