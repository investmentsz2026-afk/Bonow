'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Loader2,
  X,
  Calendar,
  Download,
  PenTool,
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
    color: 'bg-red-100 text-red-650 dark:bg-red-950/20 dark:text-red-500',
    icon: XCircle,
  },
  RENEWED: {
    label: 'Renovado',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    icon: FileText,
  },
};

export default function BusinessContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modales
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  const router = useRouter();

  const getToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return null;
    }
    return token;
  };

  const fetchMyContracts = async (isMounted: boolean) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/contracts/my-contracts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar contratos');
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

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      void fetchMyContracts(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleMockSign = (contract: Contract) => {
    // Simular firma digital futura
    setSuccess(
      `Firma digital para "${contract.title}" iniciada. El backend de firma estará disponible próximamente.`,
    );
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
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-zinc-100">
          Mis Contratos de Asociación
        </h1>
        <p className="text-sm text-gray-500">
          Consulta y gestiona los contratos y acuerdos vigentes con BONOW.
        </p>
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

      {/* Listado de Contratos */}
      {contracts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-800 bg-white dark:bg-zinc-950">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-semibold">
            No tienes contratos de asociación registrados actualmente.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {contracts.map((contract) => {
            const statusInfo = STATUS_MAP[contract.status] || STATUS_MAP.DRAFT;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={contract.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-zinc-950 space-y-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${statusInfo.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </div>
                      {contract.fileUrl && (
                        <a
                          href={contract.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 hover:bg-blue-100 transition"
                        >
                          <Download className="h-3 w-3" />
                          Descargar PDF
                        </a>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-850 dark:text-zinc-100">
                      {contract.title}
                    </h3>
                    <p className="text-sm text-gray-550 dark:text-gray-400">
                      {contract.description || 'Sin descripción adicional.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => handleMockSign(contract)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-755 transition shadow-lg shadow-violet-600/10"
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      Firma Digital
                    </button>
                    <button
                      onClick={() => void handleViewHistory(contract)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 dark:bg-zinc-900 dark:text-gray-400 transition"
                    >
                      <History className="h-3.5 w-3.5" />
                      Ver Cambios
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 dark:border-gray-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-violet-500" />
                    <span>
                      Vigencia:{' '}
                      <strong>
                        {new Date(contract.startDate).toLocaleDateString(
                          'es-MX',
                        )}
                      </strong>{' '}
                      al{' '}
                      <strong>
                        {new Date(contract.endDate).toLocaleDateString('es-MX')}
                      </strong>
                    </span>
                  </div>
                  {contract.renewalNotes && (
                    <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                      Renovación: {contract.renewalNotes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Historial */}
      {showHistoryModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                Historial de Contrato
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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
                    <p className="text-xs text-gray-550">
                      Estado:{' '}
                      {STATUS_MAP[entry.previousStatus]?.label ||
                        entry.previousStatus}{' '}
                      → {STATUS_MAP[entry.newStatus]?.label || entry.newStatus}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-xs text-gray-400 mt-1">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
