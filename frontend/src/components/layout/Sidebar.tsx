'use client';

import { API_URL } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import {
  Home,
  Award,
  Heart,
  HelpCircle,
  X,
  ShieldAlert,
  Users,
  Building2,
  LogOut,
  TrendingUp,
  Megaphone,
  MapPin,
  FileText,
  Bell,
  User as UserIcon,
  Gift,
  Tag,
  Compass,
  Star,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BonowLogo } from './BonowLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faBuilding,
  faUserTie,
  faTicketAlt,
  faHeart,
  faCheckCircle,
  faChartLine,
  faMapMarkerAlt,
  faBullhorn,
  faFileContract,
  faConciergeBell,
  faLayerGroup,
  faCompass,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search);
    }
  }, [pathname]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as UserSession);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  interface MenuItem {
    label: string;
    icon: any;
    faIcon?: any;
    href: string;
    badge?: number;
  }

  const getMenuItems = (): MenuItem[] => {
    if (!user) {
      return [
        { label: 'Inicio Público', icon: Home, faIcon: null, href: '/' },
        { label: 'Cupones Públicos', icon: Award, faIcon: faTicketAlt, href: '/coupons' },
        { label: 'Ayuda', icon: HelpCircle, faIcon: faQuestionCircle, href: '#' },
      ];
    }

    const roles = user.roles || [];

    if (roles.includes('ADMIN')) {
      return [
        { label: 'Inicio Admin', icon: Home, href: '/admin/home' },
        { label: 'Panel General', icon: Users, faIcon: faUserTie, href: '/admin/dashboard' },
        { label: 'Empresas Aliadas', icon: Building2, faIcon: faBuilding, href: '/admin/companies' },
        { label: 'Gestión Contratos', icon: FileText, faIcon: faFileContract, href: '/admin/contracts' },
        { label: 'Anuncios y Ads', icon: Megaphone, faIcon: faBullhorn, href: '/admin/ads' },
        { label: 'Mapa Sucursales', icon: MapPin, faIcon: faMapMarkerAlt, href: '/dashboard/map' },
        { label: 'Reportes Plataforma', icon: TrendingUp, faIcon: faChartLine, href: '/dashboard/analytics' },
        { label: 'Notificaciones', icon: Bell, faIcon: faConciergeBell, href: '/dashboard/notifications' },
        { label: 'Mensajes de Soporte', icon: HelpCircle, faIcon: faQuestionCircle, href: '/admin/support' },
      ];
    }

    if (roles.includes('BUSINESS')) {
      return [
        { label: 'Panel Empresa', icon: Home, href: '/business/dashboard' },
        { label: 'Mi Perfil Empresa', icon: Building2, faIcon: faBuilding, href: '/business/company' },
        { label: 'Contratos Firmados', icon: FileText, faIcon: faFileContract, href: '/business/contracts' },
        { label: 'Cupones Publicados', icon: Award, faIcon: faTicketAlt, href: '/business/coupons' },
        { label: 'Membresía / Créditos', icon: ShieldAlert, href: '/dashboard/membership' },
        { label: 'Categorías Empresa', icon: Tag, faIcon: faLayerGroup, href: '/business/categories' },
        { label: 'Mapa Sucursales', icon: MapPin, faIcon: faMapMarkerAlt, href: '/business/map' },
        { label: 'Reportes y Ventas', icon: TrendingUp, faIcon: faChartLine, href: '/dashboard/analytics' },
        { label: 'Notificaciones', icon: Bell, faIcon: faConciergeBell, href: '/dashboard/notifications' },
        { label: 'Ayuda y Soporte', icon: HelpCircle, faIcon: faQuestionCircle, href: '/dashboard/support' },
      ];
    }

    // USER
    return [
      { label: 'Inicio', icon: Home, href: '/dashboard' },
      { label: 'Explorar Ofertas', icon: Compass, faIcon: faCompass, href: '/explore' },
      { label: 'Catálogo Cupones', icon: Award, faIcon: faTicketAlt, href: '/coupons' },
      { label: 'Mis Cupones Guardados', icon: Tag, faIcon: faTicketAlt, href: '/coupons?filter=my-coupons' },
      { label: 'Mis Favoritos', icon: Heart, faIcon: faHeart, href: '/coupons?filter=favorites' },
      { label: 'Historial Canjeados', icon: FileText, href: '/coupons?filter=redemptions' },
      { label: 'Mi Membresía', icon: ShieldAlert, href: '/dashboard/membership' },
      { label: 'Notificaciones', icon: Bell, href: '/dashboard/notifications' },
      { label: 'Mi Perfil', icon: UserIcon, href: '/profile' },
      { label: 'Ayuda y Soporte', icon: HelpCircle, faIcon: faQuestionCircle, href: '/dashboard/support' },
    ];
  };

  const menuItems = getMenuItems();

  const isItemActive = (href: string) => {
    const fullCurrentUrl = `${pathname}${currentSearch}`;
    if (href === fullCurrentUrl) return true;
    if (href === pathname && !currentSearch) return true;
    if (href !== '/' && !href.includes('?') && pathname.startsWith(href)) return true;
    return false;
  };

  const getUserBadge = () => {
    if (!user) return null;
    const roles = user.roles || [];
    if (roles.includes('ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-md">
          <FontAwesomeIcon icon={faCrown} className="text-[10px]" /> ADMIN PLATAFORMA
        </span>
      );
    }
    if (roles.includes('BUSINESS')) {
      return (
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-md">
          <FontAwesomeIcon icon={faBuilding} className="text-[10px]" /> CUENTA EMPRESA
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-md">
        <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" /> MIEMBRO VIP
      </span>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-md lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-[#0A0E17] via-[#0F172A] to-[#0A0D16] border-r border-slate-800/80 shadow-2xl transition-all duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 no-scrollbar ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Glow de fondo tenue */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-12 -right-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

        {/* Encabezado Móvil */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-6 lg:hidden bg-slate-950/40 backdrop-blur-md">
          <BonowLogo variant="light" size="sm" showSlogan={false} />
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tarjeta de Perfil de Usuario */}
        {user && (
          <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex items-center gap-3.5 relative overflow-hidden">
            <div className="relative shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 p-[2px] shadow-lg shadow-violet-500/20">
                <div className="h-full w-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-base uppercase">
                  {user.firstName ? user.firstName.substring(0, 2) : 'US'}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-sm" />
            </div>

            <div className="min-w-0 flex-1 text-left space-y-1">
              <h4 className="text-sm font-black text-white leading-tight truncate tracking-tight">
                ¡Hola, {user.firstName}!
              </h4>
              <div>{getUserBadge()}</div>
            </div>
          </div>
        )}

        {/* Navegación del Menú con Indicador Activo Resaltado */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto no-scrollbar relative z-10">
          {menuItems.map((item) => {
            const active = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-black transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-violet-600/30 scale-[1.02] border-l-4 border-amber-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {item.faIcon ? (
                    <FontAwesomeIcon
                      icon={item.faIcon}
                      className={`text-base shrink-0 transition-transform group-hover:scale-110 ${
                        active ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]' : 'text-slate-400 group-hover:text-violet-400'
                      }`}
                    />
                  ) : (
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                        active ? 'text-amber-300 fill-amber-300/20' : 'text-slate-400 group-hover:text-violet-400'
                      }`}
                    />
                  )}
                  <span className="truncate tracking-wide">{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white shrink-0 shadow-md">
                    {item.badge}
                  </span>
                ) : (
                  active && (
                    <ChevronRight className="h-4 w-4 text-amber-300 animate-pulse shrink-0" />
                  )
                )}
              </Link>
            );
          })}

          {user && (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-xs font-black text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition duration-200 mt-6 border border-rose-500/20 shadow-sm cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              <span>Cerrar sesión</span>
            </button>
          )}
        </nav>

        {/* Banner Inferior Promocional */}
        {user && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md relative z-10">
            <div className="bg-gradient-to-br from-violet-900/40 via-slate-900 to-purple-950/50 border border-violet-500/30 rounded-2xl p-4 text-left relative overflow-hidden shadow-xl">
              <div className="space-y-1 max-w-[75%]">
                <div className="flex items-center gap-1 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> INVITA Y GANA
                </div>
                <p className="text-[10px] text-slate-300 leading-tight font-medium">
                  Invita a tus amigos y gana 1 mes gratis de membresía BONOW+.
                </p>
                <button className="bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded-xl shadow-md transition duration-200 mt-2 cursor-pointer">
                  Invitar ahora
                </button>
              </div>
              <div className="absolute -right-2 -bottom-2 text-violet-500/20 pointer-events-none">
                <Gift className="h-16 w-16 stroke-1" />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
