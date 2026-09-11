'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  ShieldCheck,
  User,
  Building2,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
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
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    name: string;
    corporateName: string;
  };
}

const FAQS = [
  {
    q: '¿Cómo canjeo mi cupón en un establecimiento?',
    a: 'Muestra tu código de cupón digital (o código QR) desde la sección "Mis Cupones" directamente al cajero o encargado del comercio antes de solicitar la cuenta.',
  },
  {
    q: '¿Cuándo se renueva mi membresía BONOW+?',
    a: 'Tu membresía se renueva automáticamente cada mes o año dependiendo del plan contratado. Puedes ver la fecha exacta de vencimiento en la sección "Mi Membresía".',
  },
  {
    q: '¿Cómo puedo vincular mi Tarjeta Física?',
    a: 'Dirígete a tu "Perfil de Usuario", en la tarjeta digital haz clic en "Vincular Tarjeta Física" e ingresa el código numérico grabado en tu plástico.',
  },
  {
    q: 'Soy una empresa, ¿cómo publico promociones o cupones?',
    a: 'Ingresa a tu panel de empresa en "Mis Cupones" -> "Crear Nuevo Cupón". El administrador revisará y aprobará tu publicación en menos de 24 horas.',
  },
  {
    q: '¿Qué hago si un negocio no acepta mi cupón?',
    a: 'Crea un ticket de soporte inmediatamente desde esta página seleccionando la categoría "CUPONES". Nuestro equipo contactará al negocio para validar tu beneficio.',
  },
];

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulario nuevo ticket
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [message, setMessage] = useState('');

  // Respuesta de chat
  const [replyMessage, setReplyMessage] = useState('');

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/support/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar tickets');
      const data = await res.json();
      setTickets(data);

      if (selectedTicket) {
        const updated = data.find((t: SupportTicket) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      setError('No se pudieron cargar tus tickets de soporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!subject.trim() || !message.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setCreatingTicket(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, category, message }),
      });

      if (!res.ok) throw new Error('Error enviando consulta');
      const newTicket = await res.json();

      setSuccessMsg('¡Consulta enviada! Un administrador te responderá pronto.');
      setShowModal(false);
      setSubject('');
      setCategory('GENERAL');
      setMessage('');

      await fetchTickets();
      setSelectedTicket(newTicket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando el ticket.');
    } finally {
      setCreatingTicket(false);
    }
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

      if (!res.ok) throw new Error('Error enviando mensaje');
      setReplyMessage('');
      await fetchTickets();
    } catch (err) {
      setError('Error al enviar la respuesta.');
    } finally {
      setSendingReply(false);
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

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 text-left">
      {/* Banner Principal de Soporte */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-8 md:p-12 overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />

        <div className="space-y-3 max-w-2xl z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 border border-violet-500/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-violet-300 backdrop-blur-md">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-amber-400" /> ATENCIÓN AL CLIENTE 24/7
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
            Centro de Ayuda & Soporte Técnico
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            ¿Tienes alguna consulta sobre tus cupones, pagos o cuenta? Nuestro equipo de administradores está listo para darte respuesta inmediata.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="z-10 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-violet-600 to-purple-600 hover:from-rose-600 hover:to-purple-700 px-6 py-4 text-xs font-black uppercase text-white shadow-xl shadow-violet-600/30 transition transform hover:scale-[1.03] cursor-pointer shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Crear Ticket de Soporte</span>
        </button>
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
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Contenido Principal: FAQ y Mis Tickets */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna Izquierda: FAQ Accordeon */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Preguntas Frecuentes
            </h3>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden transition"
                >
                  <button
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                    }
                    className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-slate-200 hover:bg-slate-800/40 transition"
                  >
                    <span>{faq.q}</span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="h-4 w-4 text-violet-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-3.5 pt-0 text-[11px] font-medium text-slate-400 border-t border-slate-800/40 leading-relaxed bg-slate-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tickets y Chat de Soporte */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
                  <FontAwesomeIcon icon={faComments} className="text-violet-400" />
                  Mis Mensajes y Consultas ({tickets.length})
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Historial de interacción directa con la administración.
                </p>
              </div>
              <button
                onClick={fetchTickets}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-500" />
                <p className="text-xs font-bold uppercase">Cargando tus consultas...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
                <HelpCircle className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-sm font-black uppercase text-slate-300">
                  No tienes consultas abiertas en este momento
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ¿Tienes dudas con tu cuenta o membresía? Haz clic en "Crear Ticket de Soporte" arriba para enviar tu primer mensaje.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-5">
                {/* Lista de Tickets en la izquierda del panel */}
                <div className="md:col-span-2 space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                  {tickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 rounded-2xl border text-left transition duration-200 cursor-pointer relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-violet-900/40 to-slate-900 border-violet-500 text-white shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-black text-violet-400">
                            {t.ticketNumber}
                          </span>
                          {getStatusBadge(t.status)}
                        </div>
                        <h4 className="text-xs font-extrabold text-white line-clamp-1">
                          {t.subject}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {t.messages[t.messages.length - 1]?.message || 'Sin contenido'}
                        </p>
                        <span className="text-[9px] font-bold text-slate-500 block mt-2">
                          {new Date(t.updatedAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Hilo de Chat del Ticket Seleccionado */}
                <div className="md:col-span-3 border border-slate-800 bg-slate-950 rounded-2xl p-4 flex flex-col justify-between h-[500px]">
                  {selectedTicket ? (
                    <>
                      {/* Header del Ticket */}
                      <div className="border-b border-slate-800 pb-3 mb-3 flex items-center justify-between text-left">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-violet-400">
                              {selectedTicket.ticketNumber}
                            </span>
                            {getStatusBadge(selectedTicket.status)}
                          </div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">
                            {selectedTicket.subject}
                          </h4>
                        </div>
                      </div>

                      {/* Mensajes del Chat */}
                      <div className="flex-1 overflow-y-auto space-y-3 p-2 no-scrollbar">
                        {selectedTicket.messages.map((m) => {
                          const isAdmin = m.senderRole === 'ADMIN';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${
                                isAdmin ? 'items-start' : 'items-end'
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl p-3 text-xs text-left leading-relaxed shadow-md ${
                                  isAdmin
                                    ? 'bg-violet-900/60 border border-violet-500/40 text-white rounded-tl-none'
                                    : 'bg-gradient-to-r from-rose-500 to-violet-600 text-white rounded-tr-none'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-1">
                                  <span className="text-[10px] font-black uppercase text-amber-300">
                                    {m.senderName}
                                  </span>
                                  <span className="text-[8px] opacity-75 font-bold uppercase">
                                    ({m.senderRole})
                                  </span>
                                </div>
                                <p className="font-medium whitespace-pre-wrap">{m.message}</p>
                                <span className="text-[8px] opacity-70 block text-right mt-1 font-mono">
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

                      {/* Formulario de Respuesta */}
                      <form
                        onSubmit={handleSendReply}
                        className="border-t border-slate-800 pt-3 mt-2 flex gap-2"
                      >
                        <input
                          type="text"
                          required
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Escribe tu mensaje o respuesta..."
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={sendingReply || !replyMessage.trim()}
                          className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-xs font-black uppercase transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {sendingReply ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              <span>Enviar</span>
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <MessageSquare className="h-8 w-8" />
                      <p className="text-xs font-bold uppercase">
                        Selecciona un ticket de la lista para ver el chat de soporte
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CREAR TICKET */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 text-white space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-rose-500" /> Nuevo Ticket de Soporte
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Asunto / Título de la Consulta *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej. Dudas con el canje del cupón de restaurante"
                  className="mt-1.5 block w-full rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Categoría del Problema *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 block w-full rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="GENERAL">Consulta General</option>
                  <option value="COUPONS">Cupones y Promociones</option>
                  <option value="MEMBERSHIP">Membresía BONOW+</option>
                  <option value="PAYMENTS">Pagos y Tarjetas</option>
                  <option value="BUSINESS_ACCOUNT">Cuenta de Empresa</option>
                  <option value="TECHNICAL_ISSUE">Problema Técnico / App</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mensaje Detallado *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explica detalladamente en qué podemos ayudarte..."
                  className="mt-1.5 block w-full rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 py-3 text-xs font-bold uppercase transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white py-3 text-xs font-black uppercase shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creatingTicket ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Enviar Ticket</span>
                    </>
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

export default function UserSupportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
