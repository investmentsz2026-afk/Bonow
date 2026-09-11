'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  Eye,
  MousePointerClick,
  BarChart,
  Upload,
  Image as ImageIcon,
  FileImage,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface Ad {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  adType: string;
  position:
    | 'HOME_HERO'
    | 'HOME_CAROUSEL'
    | 'SPONSORED_LIST'
    | 'SIDEBAR'
    | 'BOTTOM'
    | 'FLOATING_MODAL'
    | 'FLOATING_BANNER'
    | 'HOME_SECTION';
  status: 'ACTIVE' | 'INACTIVE';
  views: number;
  clicks: number;
  startDate: string;
  endDate: string;
  company: Company | null;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modales y formularios de Anuncio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen seleccionada supera el límite máximo de 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAdImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adPosition, setAdPosition] = useState<Ad['position']>('HOME_CAROUSEL');
  const [adStatus, setAdStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [adStart, setAdStart] = useState('');
  const [adEnd, setAdEnd] = useState('');
  const [adCompanyId, setAdCompanyId] = useState('');
  const [adSelectedType, setAdSelectedType] = useState('BANNER');

  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // 1. Obtener todos los anuncios
      const resAds = await fetch('http://localhost:3001/advertising', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resAds.status === 401) {
        localStorage.clear();
        router.push('/login');
        return;
      }
      const dataAds = await resAds.json();
      if (!resAds.ok) throw new Error(dataAds.message);
      setAds(dataAds as Ad[]);

      // 2. Obtener lista de empresas para asociar patrocinadores
      const resCompanies = await fetch('http://localhost:3001/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataCompanies = await resCompanies.json();
      if (resCompanies.ok) {
        setCompanies(dataCompanies as Company[]);
      }
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
        const resAds = await fetch('http://localhost:3001/advertising', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataAds = await resAds.json();

        const resCompanies = await fetch('http://localhost:3001/companies', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataCompanies = await resCompanies.json();

        if (isMounted) {
          if (!resAds.ok) throw new Error(dataAds.message);
          setAds(dataAds as Ad[]);
          if (resCompanies.ok) {
            setCompanies(dataCompanies as Company[]);
          }
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

  const handleOpenAddModal = () => {
    setEditingAd(null);
    setAdTitle('');
    setAdDescription('');
    setAdImageUrl('');
    setAdLinkUrl('');
    setAdPosition('HOME_CAROUSEL');
    setAdStatus('ACTIVE');
    setAdStart('');
    setAdEnd('');
    setAdCompanyId('');
    setAdSelectedType('BANNER');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdDescription(ad.description || '');
    setAdImageUrl(ad.imageUrl || '');
    setAdLinkUrl(ad.linkUrl || '');
    setAdPosition(ad.position);
    setAdStatus(ad.status);
    setAdStart(ad.startDate.substring(0, 10));
    setAdEnd(ad.endDate.substring(0, 10));
    setAdCompanyId(ad.company?.id || '');
    setAdSelectedType(ad.adType);
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('accessToken');
    const url = editingAd
      ? `http://localhost:3001/advertising/${editingAd.id}`
      : 'http://localhost:3001/advertising';
    const method = editingAd ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: adTitle,
          description: adDescription || undefined,
          imageUrl: adImageUrl || undefined,
          linkUrl: adLinkUrl || undefined,
          adType: adSelectedType,
          startDate: adStart,
          endDate: adEnd,
          position: adPosition,
          status: adStatus,
          companyId: adCompanyId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar anuncio');

      setSuccess('Anuncio guardado correctamente');
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch(`http://localhost:3001/advertising/${adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('Anuncio eliminado con éxito');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (ad: Ad) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');
    const newStatus = ad.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await fetch(
        `http://localhost:3001/advertising/${ad.id}/status`,
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
      if (!res.ok) throw new Error(data.message);

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateCTR = (clicks: number, views: number) => {
    if (views <= 0) return '0.00%';
    return `${((clicks / views) * 100).toFixed(2)}%`;
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
          <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-violet-650" />
            Administrador de Publicidad
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Programa anuncios y banners publicitarios, monitorea clics e
            impresiones.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/10 hover:bg-violet-750 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Anuncio</span>
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Listado y Rendimiento */}
      {ads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-850">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-semibold">
            No se registran anuncios programados.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                {/* Miniatura Imagen */}
                <div className="h-20 w-32 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200 dark:border-gray-800 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[9px] font-bold text-violet-750 dark:bg-violet-950/20 dark:text-violet-400 uppercase tracking-wider">
                      {ad.position}
                    </span>
                    <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[9px] font-bold text-gray-600 dark:bg-zinc-900 dark:text-gray-400 uppercase tracking-wider">
                      {ad.adType}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-850 dark:text-zinc-100">
                    {ad.title}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Vigencia: {new Date(ad.startDate).toLocaleDateString()} -{' '}
                    {new Date(ad.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Estadísticas de clicks y views */}
              <div className="flex items-center gap-6 text-center shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-gray-400 justify-center">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Vistas
                    </span>
                  </div>
                  <span className="text-base font-black text-gray-850 dark:text-white">
                    {ad.views}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-gray-400 justify-center">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Clics
                    </span>
                  </div>
                  <span className="text-base font-black text-gray-850 dark:text-white">
                    {ad.clicks}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-gray-400 justify-center">
                    <BarChart className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      CTR
                    </span>
                  </div>
                  <span className="text-base font-black text-violet-650 dark:text-violet-400">
                    {calculateCTR(ad.clicks, ad.views)}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={() => void handleToggleStatus(ad)}
                  className="text-gray-500 hover:text-violet-650"
                  title={ad.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                >
                  {ad.status === 'ACTIVE' ? (
                    <ToggleRight className="h-8 w-8 text-violet-600" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-gray-400" />
                  )}
                </button>

                <button
                  onClick={() => handleOpenEditModal(ad)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900"
                >
                  <Edit className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={() => void handleDeleteAd(ad.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Anuncio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-zinc-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-850">
              <h3 className="text-lg font-bold text-gray-850 dark:text-white">
                {editingAd ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Título del Anuncio
                  </label>
                  <input
                    type="text"
                    required
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="Hot Sale: 50% de Descuento"
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    URL del Destino (Link)
                  </label>
                  <input
                    type="url"
                    value={adLinkUrl}
                    onChange={(e) => setAdLinkUrl(e.target.value)}
                    placeholder="https://minegocio.com/promo"
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              {/* SELECCIÓN DE IMAGEN DESDE DISPOSITIVO (PC / CELULAR) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Imagen del Anuncio
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseUrlInput(!useUrlInput)}
                    className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                  >
                    {useUrlInput
                      ? '📁 Seleccionar desde PC/Celular'
                      : '🔗 Pegar enlace de URL'}
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />

                {useUrlInput ? (
                  <input
                    type="url"
                    value={adImageUrl}
                    onChange={(e) => setAdImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-xxx (Opcional)"
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                ) : (
                  <div className="space-y-3">
                    {adImageUrl ? (
                      <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group">
                        <img
                          src={adImageUrl}
                          alt="Vista previa"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-xs font-bold shadow hover:bg-zinc-100 transition cursor-pointer"
                          >
                            Cambiar Imagen
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdImageUrl('')}
                            className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-bold shadow hover:bg-red-500 transition cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-violet-300 dark:border-violet-800/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-violet-500 bg-violet-50/40 dark:bg-violet-950/10 transition group"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center mb-2 group-hover:scale-110 transition duration-300">
                          <Upload className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-black text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                          Subir imagen desde PC o Celular
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Haz clic para explorar tus fotos o galería (JPG, PNG,
                          WEBP max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Posición
                  </label>
                  <select
                    value={adPosition}
                    onChange={(e) =>
                      setAdPosition(e.target.value as Ad['position'])
                    }
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="HOME_HERO">Hero Principal</option>
                    <option value="HOME_CAROUSEL">Carrusel Superior</option>
                    <option value="HOME_SECTION">
                      ⚡ Sección Novedades en Inicio
                    </option>
                    <option value="FLOATING_MODAL">
                      🚀 Notificación Flotante Emergente (Popup 3D)
                    </option>
                    <option value="FLOATING_BANNER">
                      🔔 Banner Flotante Fijo Inferior (Bottom Bar)
                    </option>
                    <option value="SPONSORED_LIST">Empresa Patrocinada</option>
                    <option value="SIDEBAR">Banner Lateral</option>
                    <option value="BOTTOM">Banner Inferior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Tipo
                  </label>
                  <select
                    value={adSelectedType}
                    onChange={(e) => setAdSelectedType(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="BANNER">Banner Imagen</option>
                    <option value="SPONSORED">Patrocinio Marca</option>
                    <option value="NEWS">Noticia / Novedad</option>
                    <option value="PROMO">Promoción Destacada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Empresa Patrocinadora
                  </label>
                  <select
                    value={adCompanyId}
                    onChange={(e) => setAdCompanyId(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="">Ninguna (Anuncio General)</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={adStart}
                    onChange={(e) => setAdStart(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Fecha Término
                  </label>
                  <input
                    type="date"
                    required
                    value={adEnd}
                    onChange={(e) => setAdEnd(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Descripción del Anuncio
                </label>
                <textarea
                  rows={2}
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder="Información adicional sobre la promoción o noticia..."
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-250 py-2.5 text-sm font-bold text-gray-650 hover:bg-gray-50 transition dark:border-gray-700 dark:hover:bg-zinc-800 dark:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 flex justify-center items-center rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-750 transition"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
