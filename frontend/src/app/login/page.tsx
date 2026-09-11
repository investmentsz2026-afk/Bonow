'use client';

import { API_URL } from '@/lib/api';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Smartphone,
  Check,
} from 'lucide-react';

import { BonowLogo } from '@/components/layout/BonowLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      setSuccess('Sesión iniciada con éxito. Redirigiendo...');

      // Guardar tokens y usuario en localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      const userRoles = data.user?.roles || [];
      const isAdmin = userRoles.includes('ADMIN');
      const isBusiness = userRoles.includes('BUSINESS');

      setTimeout(() => {
        if (isAdmin) {
          router.push('/admin/dashboard');
        } else if (isBusiness) {
          router.push('/business/dashboard');
        } else {
          router.push('/');
        }
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error de red al conectar al servidor',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between relative overflow-hidden">
      {/* Botón de Regresar */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-300 transition backdrop-blur-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Regresar a la página principal</span>
        </Link>
      </div>

      <div className="flex-1 w-full grid lg:grid-cols-12">
        {/* Left Side: Premium Image & Features (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-12 z-10 overflow-hidden">
          {/* Background Night Image */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/fondo1.jpg"
              alt="Ciudad de México"
              className="w-full h-full object-cover object-center brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0F1E36] via-zinc-950/80 to-transparent" />
          </div>

          <div className="relative z-10 mt-16">
            <BonowLogo variant="light" size="lg" />
          </div>

          <div className="relative z-10 space-y-8 my-auto max-w-md text-left">
            <h2 className="text-4xl font-black text-white leading-tight uppercase">
              Descubre.
              <br />
              Ahorra.
              <br />
              Disfruta.
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              Accede a los mejores descuentos y beneficios exclusivos en México.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-500/20 border border-red-500/20 p-2.5 rounded-2xl text-red-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">
                    Miles de negocios aliados
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Descuentos en restaurantes, hoteles, belleza y más.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-red-500/20 border border-red-500/20 p-2.5 rounded-2xl text-red-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">
                    Membresía digital
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Elige el plan que más se adapte a ti.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-red-500/20 border border-red-500/20 p-2.5 rounded-2xl text-red-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">
                    Ahorra todos los días
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Promociones exclusivas cerca de ti.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-zinc-450 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4.5 w-4.5 text-red-400" />
            <span>Compra 100% segura</span>
          </div>
        </div>

        {/* Right Side: Form (All Screens) */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-zinc-950 border-l border-zinc-900/60 min-h-screen">
          <div className="w-full max-w-md space-y-8 text-left mt-10 lg:mt-0">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Iniciar sesión
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Bienvenido de nuevo, inicia sesión para continuar
              </p>
            </div>

            {/* Alertas */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/25 border border-red-900/50 p-4 text-xs text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-950/25 border border-emerald-900/50 p-4 text-xs text-emerald-400">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Correo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4.5 w-4.5 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="block w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4.5 w-4.5 text-zinc-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="block w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 py-3.5 pl-11 pr-11 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvidé Contraseña */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-400 hover:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-red-500 focus:ring-0"
                  />
                  <span>Recordarme</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-bold text-red-400 hover:text-red-300 transition"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 text-sm transition duration-300 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-850"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-zinc-950 px-3 text-zinc-500">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Botones Sociales */}
            <div className="grid grid-cols-3 gap-3">
              {/* Google */}
              <button className="flex items-center justify-center py-3.5 border border-zinc-800 rounded-2xl bg-zinc-900/30 hover:bg-zinc-800 transition">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.72 5.72 0 0 1 8.27 12.88a5.72 5.72 0 0 1 5.722-5.72c1.555 0 2.977.585 4.077 1.54l3.057-3.057C19.265 3.843 16.732 2.6 13.992 2.6C8.802 2.6 4.6 6.8 4.6 11.99s4.202 9.39 9.392 9.39c5.42 0 9.013-3.81 9.013-9.176c0-.583-.052-1.147-.15-1.692l-10.615-.227z" />
                </svg>
              </button>
              {/* Facebook */}
              <button className="flex items-center justify-center py-3.5 border border-zinc-800 rounded-2xl bg-zinc-900/30 hover:bg-zinc-800 transition">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </button>
              {/* Apple */}
              <button className="flex items-center justify-center py-3.5 border border-zinc-800 rounded-2xl bg-zinc-900/30 hover:bg-zinc-800 transition">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08.2.1.26.1.86 0 1.9-.62 2.55-1.43z" />
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs mt-6 text-zinc-400">
              <span>¿No tienes cuenta?</span>{' '}
              <Link
                href="/register"
                className="font-bold text-red-400 hover:text-red-300 transition"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
