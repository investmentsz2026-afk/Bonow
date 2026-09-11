'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  History,
  Loader2,
  X,
  Building2,
  Calendar,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  corporateName: string;
  rfc: string;
  logoUrl: string | null;
}

interface Contract {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  startDate: string;
  endDate: string;
  status: string;
  signedByCompany: boolean;
  signedByAdmin: boolean;
  renewalNotes: string | null;
  createdAt: string;
  company: Company;
  _count: { history: number };
}

interface HistoryEntry {
  id: string;
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  notes: string | null;
  performedBy: string;
  performedAt: string;
}

const STATUS_MAP: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: 'Borrador',
    color: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300',
    icon: FileText,
  },
  PENDING_REVIEW: {
    label: 'En Revisión',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
    icon: Clock,
  },
  ACTIVE: {
    label: 'Activo',
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
    icon: CheckCircle,
  },
  EXPIRED: {
    label: 'Expirado',
    color: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-500',
    icon: XCircle,
  },
  RENEWED: {
    label: 'Renovado',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    icon: RefreshCw,
  },
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW: ['ACTIVE', 'DRAFT', 'CANCELLED'],
  ACTIVE: ['EXPIRED', 'CANCELLED', 'RENEWED'],
  EXPIRED: ['RENEWED'],
  CANCELLED: [],
  RENEWED: ['ACTIVE'],
};

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  // Formulario de nuevo contrato
  const [form, setForm] = useState({
    companyId: '',
    title: '',
    description: '',
    fileUrl: '',
    startDate: '',
    endDate: '',
  });

  const [renewDate, setRenewDate] = useState('');
  const [renewNotes, setRenewNotes] = useState('');

  const router = useRouter();

  const getToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return null;
    }
    return token;
  };

  const fetchContracts = async (isMounted: boolean) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/contracts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar');
      if (isMounted) {
        setContracts(data as Contract[]);
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

  const fetchCompanies = async (isMounted: boolean) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && isMounted) {
        setCompanies(data as Company[]);
      }
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      void fetchContracts(isMounted);
      void fetchCompanies(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    const token = getToken();
    if (!token) return;
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/contracts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear');
      setSuccess('Contrato creado exitosamente');
      setShowCreateModal(false);
      setForm({
        companyId: '',
        title: '',
        description: '',
        fileUrl: '',
        startDate: '',
        endDate: '',
      });
      void fetchContracts(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleStatusChange = async (contractId: string, newStatus: string) => {
    const token = getToken();
    if (!token) return;
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3001/contracts/${contractId}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar');
      setSuccess('Estado actualizado');
      void fetchContracts(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleViewHistory = async (contract: Contract) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:3001/contracts/${contract.id}/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setHistoryEntries(data as HistoryEntry[]);
        setSelectedContract(contract);
        setShowHistoryModal(true);
      }
    } catch {
      // Silencioso
    }
  };

  const handleRenew = async () => {
    if (!selectedContract) return;
    const token = getToken();
    if (!token) return;
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3001/contracts/${selectedContract.id}/renew`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newEndDate: renewDate,
            notes: renewNotes,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al renovar');
      setSuccess('Contrato renovado exitosamente');
      setShowRenewModal(false);
      setRenewDate('');
      setRenewNotes('');
      void fetchContracts(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const filteredContracts = filterStatus
    ? contracts.filter((c) => c.status === filterStatus)
    : contracts;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-zinc-100">
            Gestión de Contratos
          </h1>
          <p className="text-sm text-gray-500">
            Administra los contratos de las empresas asociadas a BONOW.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/10 hover:bg-violet-700 transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo Contrato
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${!filterStatus ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-900 dark:text-gray-400'}`}
        >
          Todos ({contracts.length})
        </button>
        {Object.entries(STATUS_MAP).map(([key, { label }]) => {
          const count = contracts.filter((c) => c.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filterStatus === key ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-900 dark:text-gray-400'}`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tabla de Contratos */}
      {filteredContracts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-800">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-semibold">No hay contratos registrados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const statusInfo = STATUS_MAP[contract.status] || STATUS_MAP.DRAFT;
            const StatusIcon = statusInfo.icon;
            const transitions = VALID_TRANSITIONS[contract.status] || [];

            return (
              <div
                key={contract.id}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-zinc-950"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${statusInfo.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </div>
                      {contract.fileUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          <Upload className="h-3 w-3" />
                          PDF
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                      {contract.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building2 className="h-3.5 w-3.5 text-violet-500" />
                      <span className="font-semibold">
                        {contract.company.name}
                      </span>
                      <span className="text-gray-300 dark:text-gray-700">
                        •
                      </span>
                      <span>{contract.company.rfc}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(contract.startDate).toLocaleDateString(
                          'es-MX',
                        )}{' '}
                        →{' '}
                        {new Date(contract.endDate).toLocaleDateString('es-MX')}
                      </span>
                      <span>
                        {contract._count.history} cambios en historial
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2">
                    {transitions.map((newStatus) => {
                      const target = STATUS_MAP[newStatus] || STATUS_MAP.DRAFT;
                      return (
                        <button
                          key={newStatus}
                          onClick={() =>
                            void handleStatusChange(contract.id, newStatus)
                          }
                          className="rounded-xl border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-zinc-900 transition"
                        >
                          → {target.label}
                        </button>
                      );
                    })}

                    {(contract.status === 'ACTIVE' ||
                      contract.status === 'EXPIRED') && (
                      <button
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowRenewModal(true);
                        }}
                        className="rounded-xl bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 transition"
                      >
                        <RefreshCw className="inline h-3 w-3 mr-1" />
                        Renovar
                      </button>
                    )}

                    <button
                      onClick={() => void handleViewHistory(contract)}
                      className="rounded-xl bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-200 dark:bg-zinc-900 dark:text-gray-400 transition"
                    >
                      <History className="inline h-3 w-3 mr-1" />
                      Historial
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Contrato */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                Nuevo Contrato
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Empresa
                </label>
                <select
                  value={form.companyId}
                  onChange={(e) =>
                    setForm({ ...form, companyId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="">Seleccionar empresa...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.rfc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Título del Contrato
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Ej: Contrato de Asociación 2026"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Descripción o detalles del contrato..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  URL del Archivo PDF (opcional)
                </label>
                <input
                  type="text"
                  value={form.fileUrl}
                  onChange={(e) =>
                    setForm({ ...form, fileUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="https://storage.example.com/contrato.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => void handleCreate()}
              disabled={
                !form.companyId ||
                !form.title ||
                !form.startDate ||
                !form.endDate
              }
              className="w-full rounded-2xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition disabled:opacity-40 shadow-lg shadow-violet-600/10"
            >
              Crear Contrato
            </button>
          </div>
        </div>
      )}

      {/* Modal: Historial */}
      {showHistoryModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                Historial: {selectedContract.title}
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {historyEntries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Sin registros en el historial.
              </p>
            ) : (
              <div className="space-y-3">
                {historyEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-zinc-950/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">
                        {entry.action.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(entry.performedAt).toLocaleString('es-MX')}
                      </span>
                    </div>
                    {entry.previousStatus && entry.newStatus && (
                      <p className="text-xs text-gray-500">
                        {STATUS_MAP[entry.previousStatus]?.label ||
                          entry.previousStatus}{' '}
                        →{' '}
                        {STATUS_MAP[entry.newStatus]?.label || entry.newStatus}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-gray-400 mt-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Renovar */}
      {showRenewModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                Renovar Contrato
              </h2>
              <button
                onClick={() => setShowRenewModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Renovar:{' '}
              <span className="font-bold text-gray-800 dark:text-zinc-100">
                {selectedContract.title}
              </span>
            </p>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Nueva Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Notas de Renovación
              </label>
              <textarea
                value={renewNotes}
                onChange={(e) => setRenewNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                placeholder="Observaciones de la renovación..."
              />
            </div>

            <button
              onClick={() => void handleRenew()}
              disabled={!renewDate}
              className="w-full rounded-2xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-40 shadow-lg shadow-blue-600/10"
            >
              <RefreshCw className="inline h-4 w-4 mr-1.5" />
              Confirmar Renovación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
