'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Award,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  Star,
  Loader2,
} from 'lucide-react';

interface AboutData {
  heroTag: string;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  pillars: { title: string; desc: string }[];
}

const DEFAULT_ABOUT: AboutData = {
  heroTag: 'Conoce BONOW - Tu recompensa, ahora.',
  title: 'REVOLUCIONANDO EL AHORRO Y EL ESTILO DE VIDA',
  subtitle:
    'BONOW conecta a miles de miembros en todo México con los mejores restaurantes, cafeterías, spas, gimnasios y entretenimiento a precios exclusivos y promociones ilimitadas. Lo bueno es recibir más.',
  stats: [
    { label: 'Miembros Activos', value: '+10,000' },
    { label: 'Marcas Aliadas', value: '+500' },
    { label: 'Ahorrados por la Comunidad', value: '+$2M MXN' },
    { label: 'Calificación de Clientes', value: '4.9 / 5' },
  ],
  pillars: [
    {
      title: 'Garantía de Ahorro Real',
      desc: 'Todos nuestros cupones y promociones son validados previamente directamente con la directiva de cada empresa aliada.',
    },
    {
      title: 'Alianzas Transparentes',
      desc: 'Impulsamos a comercios y negocios locales de todo México conectándolos con clientes leales sin intermediarios innecesarios.',
    },
    {
      title: 'Experiencia 100% Digital',
      desc: 'Sin necesidad de cupones impresos. Muestra tu membresía digital BONOW+ o código QR directamente en la sucursal desde tu celular.',
    },
  ],
};

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData>(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const navigateOrLogin = (targetUrl: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      router.push(targetUrl);
    }
  };

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch('http://localhost:3001/coupons/about-page');
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            setAboutData(data);
          }
        }
      } catch {
        // Silencioso
      } finally {
        setLoading(false);
      }
    };
    void fetchAboutData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/20 text-zinc-900 py-12 px-6">
      <div className="mx-auto max-w-7xl space-y-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider">
              Cargando información...
            </p>
          </div>
        ) : (
          <>
            {/* Section 1: Hero Section */}
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-5 py-2 text-xs font-black uppercase tracking-widest text-red-600 shadow-sm backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-red-500 animate-spin" />
                {aboutData.heroTag}
              </span>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                {aboutData.title}
              </h1>
              <p className="text-base md:text-lg text-zinc-600 font-medium max-w-3xl mx-auto">
                {aboutData.subtitle}
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigateOrLogin('/coupons')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-500 hover:bg-red-600 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white transition shadow-xl shadow-red-500/25 cursor-pointer"
                >
                  <span>Explorar Descuentos</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigateOrLogin('/dashboard/membership')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-8 py-3.5 text-xs font-black uppercase tracking-wider text-zinc-800 hover:bg-zinc-100 transition shadow-md cursor-pointer"
                >
                  <span>Unirme a BONOW+</span>
                </button>
              </div>
            </div>

            {/* Section 2: Estadísticas de Impacto */}
            <div className="grid gap-6 md:grid-cols-4">
              {aboutData.stats.map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-zinc-200/80 p-6 text-center space-y-2 shadow-md hover:shadow-xl transition"
                >
                  {idx === 0 && <Users className="h-8 w-8 text-red-500 mx-auto" />}
                  {idx === 1 && <Building2 className="h-8 w-8 text-teal-600 mx-auto" />}
                  {idx === 2 && <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto" />}
                  {idx === 3 && <Star className="h-8 w-8 text-amber-500 mx-auto" />}
                  <h3 className="text-3xl font-black text-zinc-900">{st.value}</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {st.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Section 3: Nuestros Pilares */}
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-wide text-zinc-900">
                  NUESTROS PILARES FUNDAMENTALES
                </h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                  Comprometidos con la calidad y la satisfacción
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {aboutData.pillars.map((pil, pIdx) => (
                  <div
                    key={pIdx}
                    className="rounded-3xl bg-white border border-zinc-200/80 p-8 space-y-4 text-left shadow-md hover:shadow-xl hover:border-red-400 transition"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
                      {pIdx === 0 && <ShieldCheck className="h-6 w-6" />}
                      {pIdx === 1 && <HeartHandshake className="h-6 w-6" />}
                      {pIdx === 2 && <Award className="h-6 w-6" />}
                    </div>
                    <h3 className="text-xl font-black uppercase text-zinc-900">
                      {pil.title}
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      {pil.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Banner CTA Final */}
            <div className="rounded-3xl bg-gradient-to-r from-[#0F1E36] via-red-500 to-teal-600 p-10 text-center space-y-6 shadow-xl text-white">
              <h2 className="text-3xl font-black uppercase tracking-wide">
                ¿LISTO PARA EMPEZAR A AHORRAR HOY?
              </h2>
              <p className="text-sm text-zinc-100 max-w-xl mx-auto font-medium">
                Únete a la membresía BONOW+ y obtén acceso inmediato a todos los descuentos.
              </p>
              <button
                onClick={() => navigateOrLogin('/dashboard/membership')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-[#0F1E36] font-black text-xs px-8 py-3.5 uppercase tracking-wider hover:bg-zinc-100 transition shadow-lg cursor-pointer"
              >
                <span>Obtener Mi Membresía BONOW+</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
