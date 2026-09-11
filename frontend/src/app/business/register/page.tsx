'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Phone,
  Mail,
  Globe,
  Share2,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function BusinessRegisterPage() {
  const [name, setName] = useState('');
  const [corporateName, setCorporateName] = useState('');
  const [rfc, setRfc] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  const [isExistingCompany, setIsExistingCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const checkExisting = async () => {
      try {
        const res = await fetch('http://localhost:3001/companies/my-company', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setIsExistingCompany(true);
            setName(data.name || '');
            setCorporateName(data.corporateName || '');
            setRfc(data.rfc || '');
            setDescription(data.description || '');
            setPhone(data.phone || '');
            setEmail(data.email || '');
            setWebsite(data.website || '');
            if (data.socialLinks) {
              setFacebook(data.socialLinks.facebook || '');
              setInstagram(data.socialLinks.instagram || '');
            }
          }
        }
      } catch {
        // Ignorar si no existe aún
      }
    };
    void checkExisting();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('accessToken');
    const socialLinks = { facebook, instagram };

    try {
      const url = isExistingCompany
        ? 'http://localhost:3001/companies/my-company'
        : 'http://localhost:3001/companies';
      const method = isExistingCompany ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          corporateName,
          rfc,
          description,
          phone,
          email,
          website,
          socialLinks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar la información');
      }

      setSuccess(
        isExistingCompany
          ? '¡Información de tu empresa actualizada con éxito!'
          : '¡Empresa registrada exitosamente! Tu solicitud ha sido enviada para revisión administrativa.',
      );
      setTimeout(() => {
        router.push('/business/dashboard');
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-zinc-900">
        {/* Cabecera */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="text-center mt-4">
            <span className="text-3xl font-black tracking-wider text-red-500">
              BONOW Business
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Registra tu Negocio
            </h2>
            <p className="text-sm text-gray-500">
              Completa los datos comerciales y fiscales para tu aprobación en el
              Club.
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Nombre Comercial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Nombre Comercial
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mi Restaurante Gourmet"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* Razón Social */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Razón Social
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={corporateName}
                  onChange={(e) => setCorporateName(e.target.value)}
                  placeholder="Restaurantes de México S.A. de C.V."
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* RFC */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                RFC
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  placeholder="ABC123456XYZ"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* Teléfono Comercial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Teléfono Comercial
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 dígitos"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* Email Comercial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Email de Contacto
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ventas@negocio.com"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* Sitio Web */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Sitio Web
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://minegocio.com"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* Redes Sociales */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Facebook Link
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Share2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Enlace a Facebook"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Instagram Link
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Share2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Enlace a Instagram"
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Descripción del Negocio
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos un poco sobre tus productos, servicios y especialidades..."
              className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/15 hover:bg-violet-750 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Enviar Registro'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
