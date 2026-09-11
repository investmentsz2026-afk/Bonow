'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Edit,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import InteractiveMapPicker from '@/components/InteractiveMapPicker';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  schedules: string | null;
  categories?: { id: string; name: string }[];
}

interface Company {
  id: string;
  name: string;
  corporateName: string;
  rfc: string;
  logoUrl: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  } | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  branches: Branch[];
}

export default function BusinessCompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Modal Editar Empresa
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    corporateName: '',
    rfc: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    description: '',
  });

  // Modal Sucursales
  const [showBusinessBranchModal, setShowBusinessBranchModal] = useState(false);
  const [savingBusinessBranch, setSavingBusinessBranch] = useState(false);
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
  const [branchForm, setBranchForm] = useState({
    id: '',
    name: '',
    address: '',
    city: 'Ciudad de México',
    state: 'CDMX',
    latitude: '19.432608',
    longitude: '-99.133209',
    schedules: 'Lun - Dom: 09:00 - 22:00',
    categoryIds: [] as string[],
  });

  useEffect(() => {
    let isMounted = true;
    const loadCompanyData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/companies/my-company`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          router.push('/business/register');
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al obtener datos');

        if (isMounted) setCompany(data as Company);

        const resCats = await fetch(`${API_URL}/coupons/categories/list`);
        if (resCats.ok && isMounted) {
          const catsData = await resCats.json();
          setAllCategories(catsData);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Error al conectar');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void loadCompanyData();
    return () => { isMounted = false; };
  }, [router]);

  const handleOpenEditCompanyModal = () => {
    if (!company) return;
    setCompanyForm({
      name: company.name || '',
      corporateName: company.corporateName || '',
      rfc: company.rfc || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      facebook: company.socialLinks?.facebook || '',
      instagram: company.socialLinks?.instagram || '',
      description: company.description || '',
    });
    setShowEditCompanyModal(true);
  };

  const handleSaveCompany = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setSavingCompany(true);
    try {
      const res = await fetch(`${API_URL}/companies/my-company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: companyForm.name,
          corporateName: companyForm.corporateName,
          rfc: companyForm.rfc,
          phone: companyForm.phone,
          email: companyForm.email,
          website: companyForm.website,
          socialLinks: {
            facebook: companyForm.facebook,
            instagram: companyForm.instagram,
          },
          description: companyForm.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar cambios');

      setCompany((prev) => (prev ? { ...prev, ...data } : null));
      setShowEditCompanyModal(false);
      alert('¡Datos de la empresa actualizados correctamente!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSaveBusinessBranch = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !branchForm.name || !branchForm.address) return;
    setSavingBusinessBranch(true);
    try {
      const isEdit = !!branchForm.id;
      const url = isEdit
        ? `${API_URL}/companies/my-company/branches/${branchForm.id}`
        : `${API_URL}/companies/my-company/branches`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: branchForm.name,
          address: branchForm.address,
          city: branchForm.city || 'Ciudad de México',
          state: branchForm.state || 'CDMX',
          latitude: parseFloat(branchForm.latitude) || 19.432608,
          longitude: parseFloat(branchForm.longitude) || -99.133209,
          schedules: branchForm.schedules,
          categoryIds: branchForm.categoryIds,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar sucursal');

      setShowBusinessBranchModal(false);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingBusinessBranch(false);
    }
  };

  const handleDeleteBusinessBranch = async (branchId: string) => {
    if (!confirm('¿Deseas eliminar esta sucursal del mapa?')) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(
        `${API_URL}/companies/my-company/branches/${branchId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      alert('Error al eliminar sucursal');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
        <h3 className="font-bold">Error al cargar datos de empresa</h3>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
              EXPEDIENTE COMERCIAL Y FISCAL
            </span>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Mi Empresa: {company?.name}
            </h1>
          </div>
        </div>

        <button
          onClick={handleOpenEditCompanyModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black px-5 py-3 shadow-md shadow-red-600/20 transition cursor-pointer"
        >
          <Edit className="h-4 w-4" />
          <span>Editar Datos de Empresa</span>
        </button>
      </div>

      {/* Datos Fiscales y Comerciales */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-xl space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Nombre Comercial
            </span>
            <span className="font-black text-zinc-900 dark:text-white text-sm block mt-1">
              {company?.name || 'No especificado'}
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Razón Social
            </span>
            <span className="font-black text-zinc-900 dark:text-white text-sm block mt-1">
              {company?.corporateName || 'No especificado'}
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              RFC Fiscal
            </span>
            <span className="font-mono font-black text-red-600 dark:text-red-400 text-sm block mt-1">
              {company?.rfc || 'No especificado'}
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Teléfono Comercial
            </span>
            <span className="font-black text-zinc-900 dark:text-white text-sm block mt-1">
              {company?.phone || 'No registrado'}
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Email de Contacto
            </span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs block mt-1 truncate">
              {company?.email || 'No registrado'}
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Sitio Web
            </span>
            {company?.website ? (
              <a
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-red-600 dark:text-red-400 text-xs block mt-1 hover:underline truncate"
              >
                {company.website} ↗
              </a>
            ) : (
              <span className="text-xs text-zinc-400 block mt-1">Sin sitio web</span>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Facebook
            </span>
            {company?.socialLinks?.facebook ? (
              <a
                href={company.socialLinks.facebook.startsWith('http') ? company.socialLinks.facebook : `https://${company.socialLinks.facebook}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 dark:text-blue-400 text-xs block mt-1 hover:underline truncate"
              >
                {company.socialLinks.facebook} ↗
              </a>
            ) : (
              <span className="text-xs text-zinc-400 block mt-1">No registrado</span>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Instagram
            </span>
            {company?.socialLinks?.instagram ? (
              <a
                href={company.socialLinks.instagram.startsWith('http') ? company.socialLinks.instagram : `https://${company.socialLinks.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-fuchsia-600 dark:text-fuchsia-400 text-xs block mt-1 hover:underline truncate"
              >
                {company.socialLinks.instagram} ↗
              </a>
            ) : (
              <span className="text-xs text-zinc-400 block mt-1">No registrado</span>
            )}
          </div>
        </div>

        {company?.description && (
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Descripción del Negocio
            </span>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {company.description}
            </p>
          </div>
        )}
      </div>

      {/* Seccion Sucursales de la Empresa */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-red-500" />
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                Sucursales Registradas ({company?.branches?.length || 0})
              </h2>
              <p className="text-xs text-zinc-400">
                Sucursales físicas activas de tu negocio visibles en el mapa de BONOW.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setBranchForm({
                id: '',
                name: '',
                address: '',
                city: 'Ciudad de México',
                state: 'CDMX',
                latitude: '19.432608',
                longitude: '-99.133209',
                schedules: 'Lun - Dom: 09:00 - 22:00',
                categoryIds: [],
              });
              setShowBusinessBranchModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 text-xs font-black hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Sucursal</span>
          </button>
        </div>

        {company?.branches?.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 text-xs">
            No has agregado sucursales físicas aún. Haz clic en "Agregar Sucursal" para ubicar tu negocio en el mapa.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {company?.branches.map((b) => (
              <div
                key={b.id}
                className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-black text-zinc-900 dark:text-white text-sm">
                    {b.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">{b.address}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{b.city}, {b.state}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-red-500">
                    {b.schedules || 'Horario flexible'}
                  </span>
                  <button
                    onClick={() => handleDeleteBusinessBranch(b.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-lg"
                    title="Eliminar sucursal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar Datos de Empresa */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-2xl space-y-5">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Editar Datos de la Empresa
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 uppercase">Nombre Comercial</label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-400 uppercase">Razón Social</label>
                <input
                  type="text"
                  value={companyForm.corporateName}
                  onChange={(e) => setCompanyForm({ ...companyForm, corporateName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-400 uppercase">RFC Fiscal</label>
                <input
                  type="text"
                  value={companyForm.rfc}
                  onChange={(e) => setCompanyForm({ ...companyForm, rfc: e.target.value.toUpperCase() })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-400 uppercase">Teléfono Comercial</label>
                <input
                  type="text"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowEditCompanyModal(false)}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCompany}
                disabled={savingCompany}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/20"
              >
                {savingCompany ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Sucursal */}
      {showBusinessBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-2xl space-y-4">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Agregar Sucursal Física
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 uppercase">Nombre de la Sucursal</label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="ej. Sucursal Polanco"
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-400 uppercase">Dirección Completa</label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  placeholder="Av. Presidente Masaryk 123"
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-400 uppercase mb-1">
                  Ubicación Exacta en el Mapa (Latitud / Longitud)
                </label>
                <InteractiveMapPicker
                  initialLat={parseFloat(branchForm.latitude) || 19.432608}
                  initialLng={parseFloat(branchForm.longitude) || -99.133209}
                  onLocationSelect={(lat, lng) => {
                    setBranchForm((prev) => ({
                      ...prev,
                      latitude: lat.toFixed(6),
                      longitude: lng.toFixed(6),
                    }));
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowBusinessBranchModal(false)}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBusinessBranch}
                disabled={savingBusinessBranch}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black"
              >
                {savingBusinessBranch ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Sucursal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
