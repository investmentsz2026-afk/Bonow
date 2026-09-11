'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building,
  ShieldCheck,
  Check,
  Phone,
  Compass,
  Star,
  MapPin,
  Heart,
} from 'lucide-react';

import { BonowLogo } from '@/components/layout/BonowLogo';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [role, setRole] = useState<'USER' | 'BUSINESS'>('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [simToken, setSimToken] = useState<string | null>(null);
  const router = useRouter();

  // Validaciones dinámicas de la contraseña
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setSimToken(null);

    // Separar nombre completo en primer nombre y apellido (con fallback para cumplir con DTO)
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '.';

    try {
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role,
          phone: phone || undefined,
          cardNumber: cardNumber ? cardNumber.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }

      setSuccess('Usuario registrado con éxito.');
      if (data.emailVerificationToken) {
        setSimToken(data.emailVerificationToken);
      }

      setTimeout(() => {
        router.push('/login');
      }, 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVerification = async () => {
    if (!simToken) return;
    try {
      const res = await fetch('http://localhost:3001/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: simToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('¡Correo verificado con éxito! Redirigiendo a Login...');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar');
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
        {/* Left Side: Mockup & Info (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-12 z-10 overflow-hidden bg-zinc-900/20">
          {/* Top corner text */}
          <div className="mt-16 text-left">
            <BonowLogo variant="light" size="lg" />
          </div>

          {/* Title and Phone Mockup Section */}
          <div className="relative z-10 grid grid-cols-12 gap-6 my-auto items-center text-left">
            <div className="col-span-6 space-y-6">
              <h2 className="text-3xl font-black text-white leading-tight uppercase">
                Únete a BONOW+
                <br />y comienza a ahorrar
              </h2>
              <p className="text-xs text-zinc-450 leading-relaxed font-medium">
                Crea tu cuenta y accede a descuentos exclusivos, promociones y
                muchos beneficios más.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-red-400">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase">
                      Acceso inmediato
                    </h4>
                    <p className="text-[9px] text-zinc-400">
                      Únete en segundos y comienza a disfrutar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-red-400">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase">
                      Promociones exclusivas
                    </h4>
                    <p className="text-[9px] text-zinc-400">
                      Descuentos que no encontrarás en otro lugar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-red-400">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase">
                      Membresía flexible
                    </h4>
                    <p className="text-[9px] text-zinc-400">
                      Elige el plan que mejor se adapte a ti.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile App Mockup Screen */}
            <div className="col-span-6 relative flex justify-center">
              <div className="w-[185px] h-[380px] bg-zinc-950 border-[6px] border-zinc-800 rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col justify-between p-3.5 select-none text-[9px] text-zinc-150">
                <div className="flex justify-between items-center pb-2">
                  <span className="font-extrabold text-[8px]">
                    Hola, Ana 👋
                  </span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#0F1E36] via-red-500 to-teal-600 rounded-2xl p-2.5 text-white flex flex-col justify-between gap-1.5">
                  <div>
                    <p className="text-[7px] text-zinc-200">
                      Tu membresía vence en
                    </p>
                    <p className="text-sm font-black">18 días</p>
                  </div>
                  <button className="bg-white text-[#0F1E36] font-bold rounded-lg py-1 px-2.5 text-[7px] text-center self-start">
                    Ver detalles
                  </button>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-[7px] text-zinc-400 uppercase tracking-wider">
                    Recomendados para ti
                  </p>
                  <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-1.5 flex gap-2 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=60"
                      alt="Pizza"
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[7px] text-white truncate">
                        La Pizzeria
                      </p>
                      <p className="text-[6px] text-red-400 font-semibold uppercase">
                        20% OFF
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-[7px] text-zinc-400 uppercase tracking-wider">
                    Cerca de ti
                  </p>
                  <div className="relative rounded-xl overflow-hidden h-14 bg-zinc-900 border border-zinc-850">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=200"
                      alt="Map snippet"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-zinc-950/80 px-2 py-0.5 rounded-md font-bold text-[6px] border border-zinc-800 text-white">
                        Ver mapa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-900 pt-2 text-[7px] text-zinc-500">
                  <span className="text-red-500 font-bold">Inicio</span>
                  <span>Explorar</span>
                  <span>Cupones</span>
                  <span>Favoritos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-zinc-450 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4.5 w-4.5 text-red-400" />
            <span>Compra 100% segura</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center px-6 py-6 md:px-12 bg-zinc-950 border-l border-zinc-900/60 min-h-screen">
          <div className="w-full max-w-md space-y-4 text-left mt-6 lg:mt-0">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Crear cuenta
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Completa tus datos para crear tu cuenta
              </p>
            </div>

            {/* Selector de Rol en forma de tabs modernas */}
            <div className="flex bg-zinc-900/40 p-1 rounded-2xl border border-zinc-850 gap-1">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition duration-200 ${
                  role === 'USER'
                    ? 'bg-red-500 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Usuario</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('BUSINESS');
                  setCardNumber('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition duration-200 ${
                  role === 'BUSINESS'
                    ? 'bg-red-500 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>Empresa</span>
              </button>
            </div>

            {/* Alertas */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/25 border border-red-900/50 p-3 text-xs text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-950/25 border border-emerald-900/50 p-3 text-xs text-emerald-400">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {simToken && (
              <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-3 text-[11px] text-red-400 space-y-2">
                <p className="font-bold">
                  Simulación de Verificación (Fase 2):
                </p>
                <p className="text-[10px] text-zinc-400">
                  Haz clic abajo para verificar el correo electrónico e ingresar
                  inmediatamente:
                </p>
                <button
                  type="button"
                  onClick={handleSimulateVerification}
                  className="rounded-xl bg-red-500 px-3.5 py-1.5 font-bold text-white hover:bg-red-600 transition"
                >
                  Verificar cuenta ahora
                </button>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-2.5">
              {/* Nombre completo */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  {role === 'USER' ? 'Nombre completo' : 'Nombre de la empresa'}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      role === 'USER'
                        ? 'Ingresa tu nombre completo'
                        : 'Nombre comercial de tu empresa (Ej: La Pizzeria)'
                    }
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-550 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                  />
                </div>
              </div>

              {/* Correo electrónico */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-550 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                  />
                </div>
              </div>

              {/* Teléfono (Opcional) */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  Teléfono (opcional)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Phone className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="55 1234 5678"
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-550 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                  />
                </div>
              </div>

              {/* Tarjeta Virtual (Exclusivo para Usuarios finales) */}
              {role === 'USER' && (
                <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Número de Tarjeta (Física o Digital) (opcional)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <ShieldCheck className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="BONOW-XXXX-XXXX"
                      className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-550 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                    />
                  </div>
                  <span className="text-[8px] text-zinc-500 font-medium block mt-0.5">
                    Si adquiriste una tarjeta virtual o física BONOW, ingresa su código aquí para vincularla a tu cuenta.
                  </span>
                </div>
              )}

              {/* Contraseña */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crea una contraseña"
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-550 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Validaciones de contraseña (Fase 15) */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8px] font-semibold tracking-wide text-zinc-500 pt-0.5">
                <span
                  className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-500' : ''}`}
                >
                  <Check className="h-3 w-3" /> Mínimo 8 caracteres
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-500' : ''}`}
                >
                  <Check className="h-3 w-3" /> Una mayúscula
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500' : ''}`}
                >
                  <Check className="h-3 w-3" /> Un número
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-500' : ''}`}
                >
                  <Check className="h-3 w-3" /> Un carácter especial
                </span>
              </div>

              {/* Botón Registrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 text-xs transition duration-300 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-850"></div>
              </div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                <span className="bg-zinc-950 px-2 text-zinc-500">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Botones Sociales */}
            <div className="grid grid-cols-3 gap-2">
              {/* Google */}
              <button className="flex items-center justify-center py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800 transition">
                <svg
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.72 5.72 0 0 1 8.27 12.88a5.72 5.72 0 0 1 5.722-5.72c1.555 0 2.977.585 4.077 1.54l3.057-3.057C19.265 3.843 16.732 2.6 13.992 2.6C8.802 2.6 4.6 6.8 4.6 11.99s4.202 9.39 9.392 9.39c5.42 0 9.013-3.81 9.013-9.176c0-.583-.052-1.147-.15-1.692l-10.615-.227z" />
                </svg>
              </button>
              {/* Facebook */}
              <button className="flex items-center justify-center py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800 transition">
                <svg
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </button>
              {/* Apple */}
              <button className="flex items-center justify-center py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800 transition">
                <svg
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08.2.1.26.1.86 0 1.9-.62 2.55-1.43z" />
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs mt-3 text-zinc-400">
              <span>¿Ya tienes cuenta?</span>{' '}
              <Link
                href="/login"
                className="font-bold text-red-400 hover:text-red-300 transition"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
