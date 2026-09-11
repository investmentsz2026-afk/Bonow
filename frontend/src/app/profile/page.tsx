'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Bell,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Upload,
  Camera,
  Building2,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCreditCard, faMobileAlt } from '@fortawesome/free-solid-svg-icons';

const MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Coahuila',
  'Colima',
  'Ciudad de México',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Estado de México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
];

interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  photoUrl: string | null;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

function ProfileContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Campos del perfil
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Datos de Tarjeta y Membresía del Usuario
  const [virtualCard, setVirtualCard] = useState<any>(null);
  const [userMembership, setUserMembership] = useState<any>(null);
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [linkingCard, setLinkingCard] = useState(false);

  // Perfil Empresa (si aplica)
  const [company, setCompany] = useState<any>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [updatingCompanyLogo, setUpdatingCompanyLogo] = useState(false);

  // Campos de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Notificaciones
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Refs de selección de archivos desde Celular / PC
  const userFileInputRef = useRef<HTMLInputElement>(null);
  const companyFileInputRef = useRef<HTMLInputElement>(null);
  const accountSectionRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.clear();
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al cargar perfil');

        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
        setCity(data.city || '');
        setState(data.state || '');
        setPhotoUrl(data.photoUrl || '');
        setEmailNotifications(data.emailNotifications);
        setPushNotifications(data.pushNotifications);
        setVirtualCard(data.virtualCard || null);
        setUserMembership(data.membership || null);

        // Intentar obtener datos de empresa si es usuario BUSINESS
        try {
          const resComp = await fetch(
            `${API_URL}/companies/my-company`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (resComp.ok) {
            const compData = await resComp.json();
            setCompany(compData);
            setCompanyLogoUrl(compData.logoUrl || '');
          }
        } catch {
          // No es empresa o silencioso
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al conectar');
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [router]);

  const handleLinkCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumberInput.trim()) {
      setError('Por favor ingresa el número de tarjeta.');
      return;
    }
    setLinkingCard(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_URL}/users/link-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardNumber: cardNumberInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al vincular tarjeta');

      setVirtualCard(data.card);
      setUserMembership(data.membership);
      setCardNumberInput('');
      setSuccess('¡Tarjeta vinculada con éxito! Tu membresía BONOW+ ha sido activada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al vincular tarjeta');
    } finally {
      setLinkingCard(false);
    }
  };

  // Handler para seleccionar foto desde celular / PC
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'user' | 'company',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen seleccionada supera el límite máximo de 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (target === 'user') {
        setPhotoUrl(result);
        setSuccess('Foto cargada en vista previa. Presiona "Guardar Cambios" para actualizar tu perfil.');
      } else {
        setCompanyLogoUrl(result);
        setSuccess('Logo cargado en vista previa. Presiona "Guardar Logo Empresa" para actualizar.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          city,
          state,
          photoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Error al actualizar perfil');

      setSuccess('Perfil de usuario actualizado con éxito');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as Record<string, string>;
        parsed.firstName = firstName;
        parsed.lastName = lastName;
        localStorage.setItem('user', JSON.stringify(parsed));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCompanyLogo = async () => {
    setUpdatingCompanyLogo(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('accessToken');

    try {
      const payload: any = { logoUrl: companyLogoUrl };
      if (company) {
        if (company.name) payload.name = company.name;
        if (company.corporateName) payload.corporateName = company.corporateName;
        if (company.rfc) payload.rfc = company.rfc;
        if (company.description) payload.description = company.description;
        if (company.phone) payload.phone = company.phone;
        if (company.email) payload.email = company.email;
        if (company.website) payload.website = company.website;
      }

      const res = await fetch(`${API_URL}/companies/my-company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
        throw new Error(errMsg || 'Error al actualizar logo de empresa');
      }

      setSuccess('Foto/Logo de la empresa actualizado exitosamente.');
      setCompany((prev: any) => (prev ? { ...prev, logoUrl: companyLogoUrl } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setUpdatingCompanyLogo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdating(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Error al cambiar contraseña');

      setSuccess('Contraseña modificada correctamente');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleNotificationsChange = async (
    type: 'email' | 'push',
    val: boolean,
  ) => {
    const token = localStorage.getItem('accessToken');
    const updatePayload = {
      emailNotifications: type === 'email' ? val : emailNotifications,
      pushNotifications: type === 'push' ? val : pushNotifications,
    };

    if (type === 'email') setEmailNotifications(val);
    if (type === 'push') setPushNotifications(val);

    try {
      await fetch(`${API_URL}/users/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (searchParams.get('tab') === 'account' && accountSectionRef.current) {
      accountSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams, loading]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Cabecera */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-black text-gray-800 dark:text-zinc-100">
          Mi Perfil
        </h1>
        <p className="text-sm text-gray-500">
          Actualiza tus datos personales, ubicación y configuraciones.
        </p>
      </div>

      {/* Alertas */}
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

      <div className="grid gap-8 md:grid-cols-3">
        {/* Columna Izquierda: Foto y Notificaciones */}
        <div className="space-y-6 md:col-span-1">
          {/* Avatar widget Usuario */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-zinc-950 space-y-4">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-purple-600 text-white text-3xl font-black shadow-lg overflow-hidden group">
              {photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photoUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                firstName.charAt(0).toUpperCase()
              )}
              <button
                type="button"
                onClick={() => userFileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-[10px] font-bold cursor-pointer"
              >
                <Camera className="h-5 w-5 mb-0.5" />
                <span>Cambiar</span>
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100">
                {firstName} {lastName}
              </h3>
              <p className="text-xs text-gray-400">Foto de Perfil</p>
            </div>

            {/* Hidden File Input for User */}
            <input
              type="file"
              ref={userFileInputRef}
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'user')}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => userFileInputRef.current?.click()}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 px-4 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Subir Foto (Celular / PC)</span>
            </button>
          </div>

          {/* Avatar / Logo widget Empresa (Si tiene empresa) */}
          {company && (
            <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-[#121630] to-[#0d1c3a] p-6 text-center shadow-lg text-white space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                  Foto de Empresa
                </span>
              </div>

              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-900 border-2 border-teal-400/50 shadow-md overflow-hidden p-1 group">
                {companyLogoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={companyLogoUrl}
                    alt={company.name}
                    className="h-full w-full object-contain rounded-xl"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-teal-400" />
                )}
                <button
                  type="button"
                  onClick={() => companyFileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-[10px] font-bold cursor-pointer"
                >
                  <Camera className="h-5 w-5 mb-0.5" />
                  <span>Cambiar Logo</span>
                </button>
              </div>

              <div>
                <h4 className="text-sm font-black text-white truncate">
                  {company.name}
                </h4>
                <p className="text-[10px] text-zinc-400">Logo Comercial</p>
              </div>

              {/* Hidden File Input for Company */}
              <input
                type="file"
                ref={companyFileInputRef}
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'company')}
                className="hidden"
              />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => companyFileInputRef.current?.click()}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 border border-teal-500/40 text-teal-300 font-bold text-xs py-2 px-3 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Seleccionar Logo (Celular/PC)</span>
                </button>

                <button
                  type="button"
                  disabled={updatingCompanyLogo}
                  onClick={handleSaveCompanyLogo}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-black text-xs py-2 px-3 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updatingCompanyLogo ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  <span>Guardar Logo Empresa</span>
                </button>
              </div>
            </div>
          )}

          {/* Notificaciones */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4">
              <Bell className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Notificaciones
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Alertas por Correo
                </span>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) =>
                    handleNotificationsChange('email', e.target.checked)
                  }
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Notificaciones Push
                </span>
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) =>
                    handleNotificationsChange('push', e.target.checked)
                  }
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Edición de Datos, Tarjeta y Cambio de Contraseña */}
        <div className="space-y-8 md:col-span-2">
          {/* SECCIÓN MI CUENTA & TARJETA VIRTUAL / FÍSICA */}
          <div
            ref={accountSectionRef}
            className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-zinc-950 via-[#121630] to-zinc-950 p-6 shadow-xl text-white space-y-5"
          >
            <div className="flex items-center justify-between border-b border-violet-900/40 pb-3">
              <h3 className="flex items-center gap-2 text-lg font-black uppercase tracking-wider text-white">
                <CreditCard className="h-5 w-5 text-violet-400" />
                <span>Mi Cuenta & Tarjeta BONOW+</span>
              </h3>
              <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                {userMembership?.status === 'ACTIVE' ? (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" /> MEMBRESÍA ACTIVA
                  </>
                ) : (
                  'SIN MEMBRESÍA'
                )}
              </span>
            </div>

            {virtualCard ? (
              /* Tarjeta Registrada del Usuario */
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d0b30] via-[#121630] to-[#0d1c3a] border-2 border-amber-400/50 p-6 shadow-2xl space-y-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase text-teal-400 tracking-widest block">
                        TARJETA OFICIAL BONOW+
                      </span>
                      <h4 className="text-xl font-black tracking-widest text-white mt-1">
                        {virtualCard.cardNumber}
                      </h4>
                    </div>
                    <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/40 flex items-center gap-1">
                      {virtualCard.cardType === 'PHYSICAL' ? (
                        <>
                          <FontAwesomeIcon icon={faCreditCard} className="mr-0.5" /> FÍSICA
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faMobileAlt} className="mr-0.5" /> DIGITAL
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-bold block">
                        Estado de Tarjeta
                      </span>
                      <span className="font-extrabold text-emerald-400">
                        {virtualCard.status === 'REGISTERED' ? 'Vinculada a tu cuenta' : virtualCard.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-bold block">
                        Vigencia de Membresía
                      </span>
                      <span className="font-extrabold text-amber-300">
                        {userMembership?.endDate
                          ? new Date(userMembership.endDate).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '1 Mes Activo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>¿Compraste otra tarjeta o deseas actualizarla?</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Si adquiriste una nueva tarjeta física o digital de reemplazo o renovación, puedes vincular su código único a continuación. Cada tarjeta solo puede ser vinculada una vez.
                  </p>

                  <form onSubmit={handleLinkCard} className="flex gap-2">
                    <input
                      type="text"
                      value={cardNumberInput}
                      onChange={(e) => setCardNumberInput(e.target.value)}
                      placeholder="Ej: BONOW-8812-9401"
                      className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={linkingCard}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs px-4 py-2 transition shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {linkingCard ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span>Vincular Tarjeta</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Sin Tarjeta Vinculada */
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-amber-400 uppercase text-xs">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Sin Tarjeta Registrada Actualmente</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Si te registraste sin una tarjeta o compraste tu membresía digital/física después de crear tu cuenta, introduce el número de tarjeta a continuación para validarla y activar tu membresía BONOW+.
                  </p>
                </div>

                <form onSubmit={handleLinkCard} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Número de Tarjeta (Digital o Física)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumberInput}
                      onChange={(e) => setCardNumberInput(e.target.value)}
                      placeholder="Ej: BONOW-1234-5678"
                      className="mt-1 block w-full rounded-2xl border border-zinc-700 bg-zinc-900 py-3 px-4 text-xs font-bold text-white placeholder-zinc-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={linkingCard}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {linkingCard ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-zinc-950" />
                    )}
                    <span>Comprobar y Vincular Tarjeta</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Formulario de Datos Personales */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-zinc-100 mb-4">
              <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Datos Personales y Ubicación
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none dark:border-gray-800 dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none dark:border-gray-800 dark:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 dígitos"
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none dark:border-gray-800 dark:bg-zinc-900"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Estado de México
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none dark:border-gray-800 dark:bg-zinc-900 dark:text-white"
                  >
                    <option value="">Selecciona un Estado</option>
                    {MEXICAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Ciudad / Municipio
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Guadalajara, Monterrey..."
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none dark:border-gray-800 dark:bg-zinc-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="mt-2 flex w-full justify-center rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-750 disabled:opacity-50 transition"
              >
                {updating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </form>
          </div>

          {/* Formulario de Cambio de Contraseña */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-zinc-100 mb-4">
              <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Cambiar Contraseña
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none dark:border-gray-800 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none dark:border-gray-800 dark:bg-zinc-900"
                />
              </div>
              <button
                type="submit"
                disabled={passwordUpdating}
                className="flex w-full justify-center rounded-xl bg-violet-650 py-2.5 text-sm font-bold text-white hover:bg-violet-750 disabled:opacity-50 transition"
              >
                {passwordUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Actualizar Contraseña'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
