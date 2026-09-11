'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Users,
  Building2,
  Search,
  Filter,
  RefreshCw,
  X,
  User,
  Phone,
  Mail,
  Building,
  Tag,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faTicketAlt,
  faComments,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faUserTie,
  faBuilding,
  faPaperPlane,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '@/lib/api';

interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  senderType: 'USER' | 'BUSINESS';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    phone?: string | null;
  };
  company?: {
    id: string;
    name: string;
    corporateName?: string;
    logoUrl?: string | null;
    email?: string;
    phone?: string;
  };
}

function AdminSupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtros
  const [activeTab, setActiveTab] = useState<'USER' | 'BUSINESS'>('USER');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Respuesta
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchAdminTickets();
  }, [activeTab, statusFilter]);

  const fetchAdminTickets = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/support/admin/tickets?senderType=${activeTab}`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al cargar tickets de soporte');
      const data = await res.json();
      setTickets(data);

      if (selectedTicket) {
        const updated = data.find((t: SupportTicket) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      setError('No se pudieron cargar los mensajes de soporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminTickets();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setSendingReply(true);
    try {
      const res = await fetch(
        `${API_URL}/support/tickets/${selectedTicket.id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: replyMessage }),
        },
      );

      if (!res.ok) throw new Error('Error al responder ticket');
      setReplyMessage('');
      setSuccessMsg('Respuesta enviada correctamente al usuario/empresa.');

      await fetchAdminTickets();
    } catch (err) {
      setError('No se pudo enviar la respuesta.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_URL}/support/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Error cambiando estado');
      setSuccessMsg(`Estado del ticket actualizado a ${newStatus}`);
      await fetchAdminTickets();
    } catch (err) {
      setError('Error al actualizar el estado.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400">
            <Clock className="h-3 w-3 animate-pulse" /> ABIERTO
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-violet-400">
            <RefreshCw className="h-3 w-3 animate-spin" /> EN ATENCIÓN
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> RESUELTO
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 border border-slate-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-400">
            <FontAwesomeIcon icon={faTimesCircle} className="text-xs" /> CERRADO
          </span>
        );
      default:
        return null;
    }
  };

  // Conteo rápido
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 text-left">
      {/* Banner Principal Admin */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-8 md:p-12 overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="space-y-3 max-w-2xl z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-300 backdrop-blur-md">
            <FontAwesomeIcon icon={faUserTie} className="text-amber-400" /> MÓDULO DE ADMINISTRACIÓN GENERAL
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
            Mensajes de Soporte & Atención
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            Gestiona, responde y resuelve todas las consultas y solicitudes enviadas por usuarios y empresas aliadas.
          </p>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-3 gap-3 shrink-0 z-10">
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-center min-w-[90px]">
            <span className="text-xs font-bold text-amber-300 uppercase block">Abiertos</span>
            <span className="text-xl font-black text-white font-mono">{openCount}</span>
          </div>
          <div className="rounded-2xl bg-violet-500/10 border border-violet-500/30 p-3 text-center min-w-[90px]">
            <span className="text-xs font-bold text-violet-300 uppercase block">En Proceso</span>
            <span className="text-xl font-black text-white font-mono">{inProgressCount}</span>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-center min-w-[90px]">
            <span className="text-xs font-bold text-emerald-300 uppercase block">Resueltos</span>
            <span className="text-xl font-black text-white font-mono">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-bold text-red-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Tabs de Navegación por Tipo de Remitente: Usuarios vs Empresas */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1.5 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('USER')}
            className={`flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'USER'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Soporte a Usuarios</span>
          </button>

          <button
            onClick={() => setActiveTab('BUSINESS')}
            className={`flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'BUSINESS'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Soporte a Empresas</span>
          </button>
        </div>

        {/* Filtros de Búsqueda y Estado */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ticket, nombre o correo..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="IN_PROGRESS">En Proceso</option>
            <option value="RESOLVED">Resueltos</option>
            <option value="CLOSED">Cerrados</option>
          </select>

          <button
            type="submit"
            className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Buscar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Grid Principal Admin: Lista de Tickets + Detalle Chat */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
            <p className="text-xs font-bold uppercase">Cargando tickets de soporte...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-black uppercase text-slate-300">
              No se encontraron tickets en esta categoría
            </p>
            <p className="text-xs text-slate-500">
              Intenta cambiar los filtros de estado o término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-5">
            {/* Lista de Tickets en la Izquierda */}
            <div className="md:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const senderName =
                  t.senderType === 'BUSINESS' && t.company
                    ? t.company.name
                    : `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() ||
                      t.user?.email ||
                      'Usuario';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border text-left transition duration-200 cursor-pointer relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 via-violet-900/30 to-slate-900 border-amber-400 text-white shadow-xl'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-black text-amber-400">
                        {t.ticketNumber}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>

                    <div className="flex items-center gap-2 mb-2 border-b border-slate-800/60 pb-2">
                      <div className="h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-black text-[9px] shrink-0">
                        {t.senderType === 'BUSINESS' ? (
                          <Building2 className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-black text-white truncate">{senderName}</h5>
                        <p className="text-[9px] text-slate-400 truncate">
                          {t.senderType === 'BUSINESS' ? t.company?.email || t.user?.email : t.user?.email}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-xs font-extrabold text-white line-clamp-1">
                      {t.subject}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {t.messages[t.messages.length - 1]?.message || 'Sin contenido'}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2.5 pt-1 border-t border-slate-800/40 font-mono">
                      <span>Categoría: {t.category}</span>
                      <span>
                        {new Date(t.updatedAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Panel Derecho: Chat de Respuesta y Detalles del Remitente */}
            <div className="md:col-span-3 border border-slate-800 bg-slate-950 rounded-2xl p-4 flex flex-col justify-between h-[600px]">
              {selectedTicket ? (
                <>
                  {/* Encabezado del Ticket y Datos del Remitente */}
                  <div className="border-b border-slate-800 pb-3 mb-2 text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-black text-amber-400">
                          {selectedTicket.ticketNumber}
                        </span>
                        {getStatusBadge(selectedTicket.status)}
                      </div>

                      {/* Selector de Estado rápido */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
                        <select
                          value={selectedTicket.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                        >
                          <option value="OPEN">ABIERTO</option>
                          <option value="IN_PROGRESS">EN ATENCIÓN</option>
                          <option value="RESOLVED">RESUELTO</option>
                          <option value="CLOSED">CERRADO</option>
                        </select>
                      </div>
                    </div>

                    {/* Ficha de datos del usuario/empresa */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shrink-0">
                          {selectedTicket.senderType === 'BUSINESS' ? (
                            <Building2 className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-white">
                              {selectedTicket.senderType === 'BUSINESS' && selectedTicket.company
                                ? selectedTicket.company.name
                                : `${selectedTicket.user?.firstName || ''} ${selectedTicket.user?.lastName || ''}`.trim() || 'Usuario'}
                            </h4>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {selectedTicket.senderType}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {selectedTicket.user?.email} {selectedTicket.user?.phone ? `• ${selectedTicket.user.phone}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      Asunto: {selectedTicket.subject}
                    </h3>
                  </div>

                  {/* Transcripción del Chat */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-2 no-scrollbar">
                    {selectedTicket.messages.map((m) => {
                      const isAdmin = m.senderRole === 'ADMIN';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${
                            isAdmin ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs text-left leading-relaxed shadow-md ${
                              isAdmin
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 rounded-tr-none font-bold'
                                : 'bg-slate-900 border border-slate-800 text-white rounded-tl-none'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1 border-b border-black/10 pb-1">
                              <span className={`text-[10px] font-black uppercase ${isAdmin ? 'text-slate-950' : 'text-amber-400'}`}>
                                {m.senderName}
                              </span>
                              <span className="text-[8px] opacity-75 font-bold uppercase">
                                ({m.senderRole})
                              </span>
                            </div>
                            <p className="font-medium whitespace-pre-wrap">{m.message}</p>
                            <span className="text-[8px] opacity-75 block text-right mt-1 font-mono">
                              {new Date(m.createdAt).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Formulario de Respuesta del Administrador */}
                  <form
                    onSubmit={handleSendReply}
                    className="border-t border-slate-800 pt-3 mt-2 flex gap-2"
                  >
                    <input
                      type="text"
                      required
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Responder al usuario o empresa como Administrador..."
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-5 py-2.5 text-xs font-black uppercase transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg"
                    >
                      {sendingReply ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Responder</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <MessageSquare className="h-8 w-8 text-amber-400" />
                  <p className="text-xs font-bold uppercase">
                    Selecciona un ticket de la lista para gestionar la conversación
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <AdminSupportContent />
    </Suspense>
  );
}
