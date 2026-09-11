'use client';

import { API_URL } from '@/lib/api';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BonowLogo } from '@/components/layout/BonowLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSendToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResetToken(null);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al solicitar código');
      }

      setSuccess('Solicitud enviada.');
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
      }

      setSuccess(
        '¡Contraseña restablecida correctamente! Redirigiendo a Login...',
      );
      setResetToken(null);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-zinc-900">
        {/* Cabecera */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Login
          </Link>
          <div className="text-center mt-4 flex flex-col items-center">
            <BonowLogo size="md" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {resetToken
                ? 'Ingresa tu nueva contraseña a continuación'
                : 'Ingresa tu correo para recibir un enlace de restauración'}
            </p>
          </div>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Formulario 1: Solicitar Token */}
        {!resetToken ? (
          <form onSubmit={handleSendToken} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Correo Electrónico
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@bonow.mx"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-2xl bg-red-500 hover:bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Enviar Enlace'
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Formulario 2: Restablecer Contraseña (Simulación) */
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-750 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 mb-4">
              <span className="font-bold">
                Token de Recuperación Encontrado:
              </span>
              <p className="mt-1 text-[11px] font-mono break-all bg-white/60 p-2 rounded-lg mt-2 dark:bg-black/20">
                {resetToken}
              </p>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Nueva Contraseña
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-2xl bg-red-500 hover:bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Restablecer Contraseña'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
