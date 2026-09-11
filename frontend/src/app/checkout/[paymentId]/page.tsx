'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Lock,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: string;
  currency: string;
  planType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  provider: string;
  providerTxId: string;
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.paymentId;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Campos de tarjeta EDITABLES e INTERACTIVOS
  const [cardHolder, setCardHolder] = useState('Jhosep Alexander');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [zipCode, setZipCode] = useState('06600');

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const fetchPayment = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (isMounted) {
          if (!res.ok)
            throw new Error(data.message || 'Error al cargar checkout');
          setPayment(data as Payment);
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

    void fetchPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentId, router]);

  // Formateador de número de tarjeta en bloques de 4 dígitos
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Formateador de fecha de vencimiento MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  // Detector de Marca de Tarjeta
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return { brand: 'VISA', bg: 'from-blue-600 to-indigo-800' };
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return { brand: 'MASTERCARD', bg: 'from-amber-600 to-red-700' };
    if (/^3[47]/.test(clean)) return { brand: 'AMEX', bg: 'from-emerald-600 to-teal-800' };
    return { brand: 'STRIPE CARD', bg: 'from-violet-600 via-indigo-700 to-purple-800' };
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    if (cardNumber.replace(/\s/g, '').length < 15) {
      setError('Por favor ingresa un número de tarjeta válido (16 dígitos).');
      return;
    }
    if (expiry.length < 5) {
      setError('Por favor ingresa una fecha de vencimiento válida (MM/AA).');
      return;
    }
    if (cvv.length < 3) {
      setError('Por favor ingresa un código CVC/CVV válido.');
      return;
    }

    setPaying(true);
    setError(null);
    setSuccess(null);

    try {
      // Notificar al Webhook de Stripe en el Backend
      const webhookRes = await fetch(
        `${API_URL}/payments/webhook/stripe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            providerTxId: payment.providerTxId,
            status: 'APPROVED',
          }),
        },
      );

      const webhookData = await webhookRes.json();
      if (!webhookRes.ok)
        throw new Error(webhookData.message || 'Error al notificar al webhook de Stripe');

      setSuccess('¡Pago procesado y verificado por Stripe!');
      setTimeout(() => {
        router.push('/dashboard/membership');
      }, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de procesamiento');
      setPaying(false);
    }
  };

  const getPlanNameES = (type: string) => {
    switch (type) {
      case 'MONTHLY':
        return 'Mensual';
      case 'QUARTERLY':
        return 'Trimestral';
      case 'SEMESTERLY':
        return 'Semestral';
      case 'ANNUAL':
        return 'Anual';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const cardInfo = getCardBrand(cardNumber);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-white">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Cabecera Stripe Oficial */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 px-3 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center text-xs tracking-wider shadow-lg shadow-violet-600/30 gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span>STRIPE</span>
            </div>
            <div>
              <span className="text-sm font-black tracking-wide block">
                Stripe Payments
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Conexión Encriptada SSL 256-Bit
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/membership"
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cancelar
          </Link>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/40 border border-red-800/60 p-4 text-xs text-red-300 animate-in fade-in">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 bg-emerald-950/30 border border-emerald-800/50 rounded-3xl animate-in zoom-in duration-200">
            <CheckCircle className="h-12 w-12 text-emerald-400 animate-bounce" />
            <h3 className="text-base font-black text-emerald-400 uppercase tracking-wide">
              ¡Pago con Stripe Aprobado!
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              La transacción por <strong className="text-white">${payment?.amount} MXN</strong> fue confirmada. Tu membresía{' '}
              <strong className="text-violet-400">{getPlanNameES(payment?.planType || '')}</strong> ha sido activada en tu cuenta.
            </p>
          </div>
        )}

        {!success && payment && (
          <form onSubmit={handlePay} className="space-y-6">
            {/* Visual Interactive Credit Card Banner */}
            <div className={`relative h-44 w-full rounded-2xl bg-gradient-to-r ${cardInfo.bg} p-5 shadow-2xl border border-white/20 flex flex-col justify-between overflow-hidden group transition-all duration-300`}>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-10 rounded-md bg-amber-400/90 border border-amber-300/60 flex items-center justify-center shadow-inner">
                    <div className="h-4 w-6 border-y border-amber-800/40" />
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/90 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                  {cardInfo.brand}
                </span>
              </div>

              <div className="space-y-1 relative z-10">
                <span className="text-[9px] font-black uppercase text-white/60 tracking-widest block">
                  Número de Tarjeta
                </span>
                <span className="font-mono text-lg font-black tracking-widest text-white drop-shadow">
                  {cardNumber || '•••• •••• •••• ••••'}
                </span>
              </div>

              <div className="flex justify-between items-end relative z-10 text-[10px] font-bold">
                <div>
                  <span className="text-[8px] uppercase text-white/60 block">Titular</span>
                  <span className="uppercase text-white tracking-wider font-extrabold truncate max-w-[180px] block">
                    {cardHolder || 'NOMBRE APELLIDO'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] uppercase text-white/60 block">Vence</span>
                  <span className="font-mono text-white tracking-wider block font-extrabold">
                    {expiry || 'MM/AA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumen de la Orden */}
            <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="uppercase font-extrabold text-[10px] tracking-wider text-violet-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Orden a Procesar
                </span>
                <span className="font-mono text-[10px]">Ref: {payment.providerTxId}</span>
              </div>
              <div className="flex justify-between items-baseline font-black text-white pt-1">
                <span className="text-sm">Membresía BONOW+ ({getPlanNameES(payment.planType)})</span>
                <span className="text-lg text-violet-400">${payment.amount} MXN</span>
              </div>
            </div>

            {/* Formulario de Entrada interactiva de la Tarjeta */}
            <div className="space-y-4 rounded-2xl border border-zinc-800 p-4 bg-zinc-950/60">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400">
                  Nombre del Titular en la Tarjeta
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Ej: Jhosep Alexander"
                  className="mt-1.5 block w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400">
                  Número de Tarjeta (Débito o Crédito)
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition font-mono font-bold"
                  />
                  <CreditCard className="absolute right-3 top-2.5 h-4 w-4 text-violet-400" />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/AA"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400">
                    CVC / CVV
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="06600"
                    className="mt-1.5 block w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition font-mono font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 text-[10px] text-zinc-400 items-center justify-center bg-zinc-950 py-2 px-3 rounded-xl border border-zinc-850">
              <Lock className="h-3.5 w-3.5 text-violet-400 shrink-0" />
              <span>Procesado directamente vía <strong>Stripe API Engine</strong>. Sin guardar tu tarjeta.</span>
            </div>

            <button
              type="submit"
              disabled={paying}
              className="w-full flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 py-4 text-xs font-black uppercase text-white shadow-xl shadow-violet-600/30 transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer tracking-wider"
            >
              {paying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current text-amber-300" />
                  <span>Pagar ${payment.amount} MXN con Stripe</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
