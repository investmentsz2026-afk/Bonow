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
  User,
  Gift,
  Tag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BonowLogo } from './BonowLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

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
    icon: React.ComponentType<any>;
    href: string;
    badge?: number;
  }

  const getMenuItems = (): MenuItem[] => {
    const defaultItems: MenuItem[] = [
      { label: 'Inicio', icon: Home, href: '/dashboard' },
    ];

    if (!user) {
      return [
        { label: 'Inicio Público', icon: Home, href: '/' },
        { label: 'Cupones Públicos', icon: Award, href: '/coupons' },
        { label: 'Ayuda', icon: HelpCircle, href: '#' },
      ];
    }

    const roles = user.roles || [];

    if (roles.includes('ADMIN')) {
      return [
        { label: 'Inicio', icon: Home, href: '/admin/home' },
        { label: 'Panel General Admin', icon: Users, href: '/admin/dashboard' },
        {
          label: 'Administrar Empresas',
          icon: Building2,
          href: '/admin/companies',
        },
        {
          label: 'Administrar Contratos',
          icon: FileText,
          href: '/admin/contracts',
        },
        {
          label: 'Administrar Publicidad',
          icon: Megaphone,
          href: '/admin/ads',
        },
        { label: 'Mapa de Sucursales', icon: MapPin, href: '/dashboard/map' },
        {
          label: 'Reportes de Plataforma',
          icon: TrendingUp,
          href: '/dashboard/analytics',
        },
        {
          label: 'Notificaciones',
          icon: Bell,
          href: '/dashboard/notifications',
        },
      ];
    }

    if (roles.includes('BUSINESS')) {
      return [
        { label: 'Inicio', icon: Home, href: '/business/dashboard' },
        { label: 'Mi Empresa', icon: Building2, href: '/business/company' },
        { label: 'Mis Contratos', icon: FileText, href: '/business/contracts' },
        { label: 'Mis Cupones', icon: Award, href: '/business/coupons' },
        { label: 'Membresía', icon: ShieldAlert, href: '/dashboard/membership' },
        { label: 'Mis Categorías', icon: Tag, href: '/business/categories' },
        { label: 'Mapa de Sucursales', icon: MapPin, href: '/business/map' },
        {
          label: 'Reportes y Ventas',
          icon: TrendingUp,
          href: '/dashboard/analytics',
        },
        {
          label: 'Notificaciones',
          icon: Bell,
          href: '/dashboard/notifications',
        },
      ];
    }

    // USER
    return [
      ...defaultItems,
      { label: 'Explorar', icon: CompassIcon, href: '/explore' },
      { label: 'Cupones', icon: Award, href: '/coupons' },
      { label: 'Mis Cupones', icon: Tag, href: '/coupons?filter=my-coupons' },
      { label: 'Favoritos', icon: Heart, href: '/coupons?filter=favorites' },
      {
        label: 'Mis usos',
        icon: FileText,
        href: '/coupons?filter=redemptions',
      },
      { label: 'Membresía', icon: ShieldAlert, href: '/dashboard/membership' },
      {
        label: 'Notificaciones',
        icon: Bell,
        href: '/dashboard/notifications',
        badge: 5,
      },
      { label: 'Perfil', icon: User, href: '/profile' },
      { label: 'Ayuda y soporte', icon: HelpCircle, href: '#' },
    ];
  };

  const CompassIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );

  const menuItems = getMenuItems();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-45 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-900 bg-zinc-950 transition-transform duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 no-scrollbar ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-900 px-6 lg:hidden">
          <BonowLogo variant="light" size="sm" showSlogan={false} />
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#0F1E36] to-red-500 text-white flex items-center justify-center shrink-0 shadow">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h4 className="text-sm font-black text-white leading-tight flex items-center">
                ¡Hola, {user.firstName}! <FontAwesomeIcon icon={faCrown} className="text-amber-400 ml-1.5 text-xs" />
              </h4>
              <p className="text-[9px] text-zinc-500 mt-0.5">
                Miembro desde{' '}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('es-MX', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Reciente'}
              </p>
              <span className="inline-block bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 tracking-wider">
                BONOW+
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-extrabold text-zinc-400 hover:bg-zinc-900/60 hover:text-white transition duration-200"
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white shrink-0">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}

          {user && (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-xs font-extrabold text-red-500 hover:bg-red-950/20 transition duration-200 mt-4"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Cerrar sesión</span>
            </button>
          )}
        </nav>

        {user && (
          <div className="p-4 border-t border-zinc-900 bg-zinc-950">
            <div className="bg-gradient-to-br from-red-500/10 to-teal-500/10 border border-red-500/10 rounded-2xl p-4 text-left relative overflow-hidden">
              <div className="space-y-1 max-w-[70%]">
                <h4 className="text-[10px] font-black text-white uppercase tracking-wider">
                  Invita y gana
                </h4>
                <p className="text-[9px] text-zinc-400 leading-snug">
                  Invita a tus amigos y gana 1 mes gratis por cada amigo.
                </p>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold text-[8px] px-3.5 py-1.5 rounded-lg transition duration-200 mt-2">
                  Invitar ahora
                </button>
              </div>
              <div className="absolute right-2 bottom-2 text-red-500/20">
                <Gift className="h-10 w-10 stroke-1" />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
