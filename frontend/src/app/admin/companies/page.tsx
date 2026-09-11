'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Eye,
  Building2,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  corporateName: string;
  rfc: string;
  description: string | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  phone: string | null;
  email: string | null;
  website: string | null;
  socialLinks?: { facebook?: string; instagram?: string } | null;
  createdAt: string;
  owner: {
    email: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    branches: number;
  };
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const router = useRouter();

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener empresas');

      setCompanies(data as Company[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (isMounted) {
          if (!res.ok) throw new Error(data.message);
          setCompanies(data as Company[]);
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

    void load();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleUpdateStatus = async (
    companyId: string,
    newStatus: 'APPROVED' | 'SUSPENDED',
  ) => {
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch(
        `${API_URL}/companies/${companyId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Error al actualizar estatus');

      setSuccess(
        `Estatus de empresa actualizado a ${newStatus === 'APPROVED' ? 'Aprobado' : 'Suspendido'}`,
      );
      setSelectedCompany(null);
      await fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-zinc-100">
            Aprobación de Empresas
          </h1>
          <p className="text-sm text-gray-500">
            Administra y revisa las solicitudes de afiliación de negocios en
            BONOW.
          </p>
        </div>
        <button
          onClick={() => void fetchCompanies()}
          className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
          <Check className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tabla / Lista de Empresas */}
        <div className="lg:col-span-2 space-y-4">
          {companies.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-800">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-semibold">
                No hay solicitudes de empresas registradas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompany(comp)}
                  className={`rounded-3xl border p-5 shadow-sm bg-white dark:bg-zinc-950 transition cursor-pointer flex justify-between items-center ${
                    selectedCompany?.id === comp.id
                      ? 'border-violet-600 dark:border-violet-400 ring-1 ring-violet-600 dark:ring-violet-400'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-800 dark:text-zinc-100">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-gray-400">RFC: {comp.rfc}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-1">
                      <span>Propietario: {comp.owner.firstName}</span>
                      <span>•</span>
                      <span>Sucursales: {comp._count.branches}</span>
                    </div>
                  </div>

                  <div>
                    {comp.status === 'PENDING' && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                        Pendiente
                      </span>
                    )}
                    {comp.status === 'APPROVED' && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700 dark:bg-green-950/20 dark:text-green-400">
                        Aprobada
                      </span>
                    )}
                    {comp.status === 'SUSPENDED' && (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                        Suspendida
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Detalles de la Empresa Seleccionada */}
        <div className="lg:col-span-1">
          {selectedCompany ? (
            <div className="sticky top-20 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                  {selectedCompany.name}
                </h2>
                <p className="text-xs text-gray-400 font-bold mt-1">
                  RAZÓN SOCIAL: {selectedCompany.corporateName}
                </p>
              </div>

              <div className="space-y-3.5 border-t border-b border-gray-100 py-4 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-350">
                <div>
                  <span className="font-bold block uppercase text-gray-400 text-[10px]">
                    RFC
                  </span>
                  <span className="font-mono text-sm">
                    {selectedCompany.rfc}
                  </span>
                </div>
                {selectedCompany.email && (
                  <div>
                    <span className="font-bold block uppercase text-gray-400 text-[10px]">
                      Email de Contacto
                    </span>
                    <span>{selectedCompany.email}</span>
                  </div>
                )}
                {selectedCompany.phone && (
                  <div>
                    <span className="font-bold block uppercase text-gray-400 text-[10px]">
                      Teléfono
                    </span>
                    <span>{selectedCompany.phone}</span>
                  </div>
                )}
                {selectedCompany.website && (
                  <div>
                    <span className="font-bold block uppercase text-gray-400 text-[10px]">
                      Sitio Web
                    </span>
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline dark:text-violet-400"
                    >
                      {selectedCompany.website}
                    </a>
                  </div>
                )}
                <div>
                  <span className="font-bold block uppercase text-gray-400 text-[10px]">
                    Descripción
                  </span>
                  <p className="mt-0.5 leading-relaxed">
                    {selectedCompany.description || 'Sin descripción.'}
                  </p>
                </div>
              </div>

              {/* Acciones de Aprobación */}
              <div className="space-y-3 pt-2">
                {selectedCompany.status !== 'APPROVED' && (
                  <button
                    onClick={() =>
                      void handleUpdateStatus(selectedCompany.id, 'APPROVED')
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-xs font-bold text-white hover:bg-green-700 transition"
                  >
                    <Check className="h-4 w-4" />
                    Aprobar Empresa
                  </button>
                )}
                {selectedCompany.status !== 'SUSPENDED' && (
                  <button
                    onClick={() =>
                      void handleUpdateStatus(selectedCompany.id, 'SUSPENDED')
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-650 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
                  >
                    <X className="h-4 w-4" />
                    Suspender Empresa
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-800">
              <Eye className="mx-auto h-8 w-8 mb-2" />
              <p className="text-xs">
                Selecciona una empresa para revisar sus datos comerciales y
                aprobarla.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
