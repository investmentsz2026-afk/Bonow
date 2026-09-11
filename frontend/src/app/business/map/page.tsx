'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  Loader2,
  Building2,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import InteractiveMapPicker from '@/components/InteractiveMapPicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faTrashAlt, faTag } from '@fortawesome/free-solid-svg-icons';

interface Category {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  schedules: string | null;
  categories?: Category[];
}

interface Company {
  id: string;
  name: string;
  corporateName: string;
  logoUrl: string | null;
  status: string;
  branches: Branch[];
}

export default function BusinessMapPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  // Branch Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const fetchMyCompany = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/companies/my-company', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setError('Aún no has registrado tu empresa.');
        } else {
          setError('Error al obtener datos de tu empresa.');
        }
        return;
      }
      const data = await res.json();
      setCompany(data);
      if (data.branches && data.branches.length > 0) {
        setSelectedBranch(data.branches[0]);
      }
    } catch {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3001/coupons/categories/list');
      if (res.ok) {
        const data = await res.json();
        setAllCategories(data);
      }
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    void fetchMyCompany();
    void fetchCategories();
  }, []);

  const handleSaveBranch = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!branchForm.name.trim() || !branchForm.address.trim()) {
      alert('Por favor ingresa el nombre y la dirección de la sucursal.');
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!branchForm.id;
      const url = isEdit
        ? `http://localhost:3001/companies/my-company/branches/${branchForm.id}`
        : 'http://localhost:3001/companies/my-company/branches';
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al guardar sucursal');
      }

      setSuccessMsg(
        isEdit
          ? 'Sucursal actualizada correctamente.'
          : 'Nueva sucursal y ubicación registrada con éxito.',
      );
      setShowModal(false);
      await fetchMyCompany();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('¿Deseas eliminar esta sucursal y ubicación del mapa?'))
      return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:3001/companies/my-company/branches/${branchId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setSuccessMsg('Sucursal eliminada.');
        await fetchMyCompany();
      }
    } catch {
      alert('Error al eliminar sucursal.');
    }
  };

  const openNewModal = () => {
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
    setShowModal(true);
  };

  const openEditModal = (b: Branch) => {
    setBranchForm({
      id: b.id,
      name: b.name,
      address: b.address,
      city: b.city || 'Ciudad de México',
      state: b.state || 'CDMX',
      latitude: b.latitude ? b.latitude.toString() : '19.432608',
      longitude: b.longitude ? b.longitude.toString() : '-99.133209',
      schedules: b.schedules || 'Lun - Dom: 09:00 - 22:00',
      categoryIds: b.categories ? b.categories.map((c) => c.id) : [],
    });
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 text-left">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="h-4 w-4" />
            <span>PANEL DE EMPRESA • MIS SUCURSALES</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-8 w-8 text-violet-600 animate-pulse" />
            Ubicaciones de Mi Empresa en el Mapa
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1 max-w-2xl">
            Registra y ubica las direcciones de tus tiendas o locales. En este
            panel solo verás las sucursales registradas por tu empresa (
            {company?.name || 'Tu Empresa'}).
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-3.5 text-xs font-black uppercase text-white hover:from-red-600 hover:to-rose-700 transition shadow-lg shadow-red-500/25 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Agregar Nueva Sucursal</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-4 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-3 text-zinc-500">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-xs font-bold uppercase tracking-wider">
            Cargando sucursales de tu empresa...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 text-center text-red-600 space-y-3">
          <AlertTriangle className="mx-auto h-8 w-8" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      ) : company?.branches.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center">
            <MapPin className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Aún no has agregado sucursales a tu empresa
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Haz clic en &quot;+ Agregar Nueva Sucursal&quot; para fijar tu
              primer local en el mapa con su dirección, horarios y categoría.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-3 text-xs font-black uppercase text-white hover:bg-red-600 transition shadow-lg shadow-red-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Primer Local</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Listado de Sucursales de la Empresa */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Mis Sucursales Registradas ({company?.branches.length})
              </span>
            </div>

            <div className="space-y-3">
              {company?.branches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className={`rounded-2xl border p-4 cursor-pointer transition text-left space-y-3 ${
                    selectedBranch?.id === b.id
                      ? 'border-violet-600 bg-violet-50/40 dark:bg-violet-950/20 shadow-md ring-2 ring-violet-500/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-black text-sm text-zinc-900 dark:text-white leading-tight truncate">
                        {b.name}
                      </h4>
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> {b.city || 'CDMX'}, {b.state || 'CDMX'}
                      </p>
                    </div>

                    <span className="font-mono text-[9px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg shrink-0">
                      {b.latitude?.toFixed(4)}, {b.longitude?.toFixed(4)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {b.address}
                  </p>

                  {/* Categorías asociadas a esta sucursal */}
                  {b.categories && b.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {b.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faTag} className="text-violet-500" /> {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {b.schedules && (
                    <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3 text-violet-600" />
                      <span>{b.schedules}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1"
                    >
                      <span>Abrir Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(b);
                        }}
                        className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 cursor-pointer"
                        title="Editar Sucursal"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteBranch(b.id);
                        }}
                        className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 cursor-pointer"
                        title="Eliminar Sucursal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa Interactivo con las Sucursales de la Empresa */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xl overflow-hidden h-[420px] relative">
              {selectedBranch ? (
                <iframe
                  title="Google Maps Ubicación Sucursal"
                  src={`https://maps.google.com/maps?q=${selectedBranch.latitude},${selectedBranch.longitude}&z=16&output=embed`}
                  className="w-full h-full rounded-2xl border-0"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400 text-xs font-bold">
                  Selecciona una sucursal para ver su mapa interactivo
                </div>
              )}
            </div>

            {selectedBranch && (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-3 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-violet-600 tracking-wider">
                      {company?.name}
                    </span>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                      {selectedBranch.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> {selectedBranch.address}, {selectedBranch.city},{' '}
                      {selectedBranch.state}
                    </p>
                  </div>

                  <button
                    onClick={() => openEditModal(selectedBranch)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                  >
                    <Edit className="h-4 w-4 text-violet-600" />
                    <span>Editar Sucursal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR SUCURSAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-violet-600" />
                {branchForm.id
                  ? 'Editar Ubicación de Sucursal'
                  : 'Nueva Ubicación en el Mapa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> Selecciona Ubicación Exacta en el Mapa (Presiona en el mapa
                  para fijar)
                </label>
                <InteractiveMapPicker
                  initialLat={parseFloat(branchForm.latitude) || 19.432608}
                  initialLng={parseFloat(branchForm.longitude) || -99.133209}
                  height="280px"
                  onLocationSelect={(lat, lng, addr) => {
                    setBranchForm((prev) => ({
                      ...prev,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                      address: addr || prev.address,
                    }));
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Nombre de la Sucursal / Tienda
                </label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="Ej: Sucursal Polanco / Matriz Centro / Tienda 2"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Categoría(s) de esta Sucursal (Selecciona una o varias)
                </label>
                <div className="mt-1 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  {allCategories.length > 0 ? (
                    allCategories.map((cat) => {
                      const isSelected = branchForm.categoryIds.includes(
                        cat.id,
                      );
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setBranchForm((prev) => {
                              const exists = prev.categoryIds.includes(cat.id);
                              return {
                                ...prev,
                                categoryIds: exists
                                  ? prev.categoryIds.filter(
                                      (id) => id !== cat.id,
                                    )
                                  : [...prev.categoryIds, cat.id],
                              };
                            });
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                            isSelected
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-violet-500'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}
                          {cat.name}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium">
                      Cargando categorías...
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Dirección Completa (Calle, Número, Colonia)
                </label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, address: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  placeholder="Ej: Av. Homero 458, Col. Polanco, Miguel Hidalgo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={branchForm.city}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={branchForm.state}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, state: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Latitud Coordenadas
                  </label>
                  <input
                    type="text"
                    value={branchForm.latitude}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, latitude: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Longitud Coordenadas
                  </label>
                  <input
                    type="text"
                    value={branchForm.longitude}
                    onChange={(e) =>
                      setBranchForm({
                        ...branchForm,
                        longitude: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Horarios de Atención
                </label>
                <input
                  type="text"
                  value={branchForm.schedules}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, schedules: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  placeholder="Ej: Lun - Dom: 09:00 - 22:00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                onClick={handleSaveBranch}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-xs font-black text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Ubicación'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
