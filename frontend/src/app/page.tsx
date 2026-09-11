'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Map,
  Compass,
  Star,
  Users,
  Building,
  Heart,
  Gift,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Sparkle,
  Dumbbell,
  Film,
  HeartPulse,
  ShoppingBag,
  Plane,
  Plus,
  Mail,
  Share2,
  Globe,
  Megaphone,
  X,
  Bell,
} from 'lucide-react';

import { BonowLogo } from '@/components/layout/BonowLogo';

const CATEGORIES = [
  { name: 'Restaurantes', icon: UtensilsCrossed, count: '124 locales' },
  { name: 'Cafeterías', icon: Coffee, count: '85 locales' },
  { name: 'Hoteles', icon: Hotel, count: '42 destinos' },
  { name: 'Belleza', icon: Sparkle, count: '96 estéticas' },
  { name: 'Gimnasios', icon: Dumbbell, count: '38 centros' },
  { name: 'Entretenimiento', icon: Film, count: '29 cines' },
  { name: 'Salud', icon: HeartPulse, count: '54 clínicas' },
  { name: 'Tiendas', icon: ShoppingBag, count: '110 tiendas' },
  { name: 'Viajes', icon: Plane, count: '18 agencias' },
  { name: 'Más', icon: Plus, count: 'Y mucho más' },
];

const PARTNER_LOGOS = [
  { name: 'La Pizzeria', text: 'LA PIZZERIA' },
  { name: 'El Califa', text: 'EL CALIFA' },
  { name: 'Sanborns', text: 'Sanborns' },
  { name: 'Cinépolis', text: 'Cinépolis' },
  { name: 'Smart Fit', text: 'smart fit' },
  { name: 'Starbucks', text: 'STARBUCKS' },
  { name: 'Hilton', text: 'Hilton' },
  { name: 'Sephora', text: 'SEPHORA' },
];

const renderCategoryIcon = (iconNameOrEmoji?: any, name?: string) => {
  if (typeof iconNameOrEmoji === 'string' && iconNameOrEmoji.trim()) {
    if (/\p{Extended_Pictographic}/u.test(iconNameOrEmoji)) {
      return (
        <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
          {iconNameOrEmoji}
        </span>
      );
    }
  }
  if (typeof iconNameOrEmoji === 'function') {
    const IconComp = iconNameOrEmoji;
    return <IconComp className="h-6 w-6 text-white" />;
  }
  const lower = (name || '').toLowerCase();
  if (
    lower.includes('restauran') ||
    lower.includes('comida') ||
    lower.includes('gastronom')
  ) {
    return <UtensilsCrossed className="h-6 w-6 text-white" />;
  }
  if (lower.includes('café') || lower.includes('cafeter')) {
    return <Coffee className="h-6 w-6 text-white" />;
  }
  if (lower.includes('hotel') || lower.includes('hosped')) {
    return <Hotel className="h-6 w-6 text-white" />;
  }
  if (
    lower.includes('belleza') ||
    lower.includes('spa') ||
    lower.includes('estétic')
  ) {
    return <Sparkle className="h-6 w-6 text-white" />;
  }
  if (
    lower.includes('gimnasio') ||
    lower.includes('fitness') ||
    lower.includes('sport')
  ) {
    return <Dumbbell className="h-6 w-6 text-white" />;
  }
  if (
    lower.includes('cine') ||
    lower.includes('entretenim') ||
    lower.includes('divers')
  ) {
    return <Film className="h-6 w-6 text-white" />;
  }
  if (
    lower.includes('salud') ||
    lower.includes('médic') ||
    lower.includes('clínic')
  ) {
    return <HeartPulse className="h-6 w-6 text-white" />;
  }
  if (
    lower.includes('tienda') ||
    lower.includes('compras') ||
    lower.includes('moda')
  ) {
    return <ShoppingBag className="h-6 w-6 text-white" />;
  }
  if (
    lower.includes('viaje') ||
    lower.includes('turismo') ||
    lower.includes('vuelo')
  ) {
    return <Plane className="h-6 w-6 text-white" />;
  }
  return <Sparkles className="h-6 w-6 text-white" />;
};

interface HeroSlide {
  id: string;
  badgeText: string;
  title: string;
  subtitle: string;
  bgImageUrl: string;
  ctaText: string;
  ctaUrl: string;
  cardTitle: string;
  cardSubtitle: string;
  cardPrice: string;
  features?: string[];
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badgeText: '⚡ LO BUENO ES RECIBIR MÁS',
    title: 'TU RECOMPENSA,\nAHORA.',
    subtitle:
      'Cerca de ti siempre. Beneficios que te hacen ganar y descuentos exclusivos de manera fácil, rápida y sin complicaciones.',
    bgImageUrl: '/img/fondo1.jpg',
    ctaText: 'Explorar Descuentos',
    ctaUrl: '/coupons',
    cardTitle: 'ÚNETE A BONOW+',
    cardSubtitle: 'Tu recompensa, ahora. Beneficios exclusivos todos los días',
    cardPrice: 'Desde $99 MXN / mes',
    features: [
      'Descuentos exclusivos',
      'Cerca de ti siempre',
      'Beneficios que te hacen ganar',
      'Fácil, rápido y sin complicaciones',
    ],
  },
  {
    id: 'slide-2',
    badgeText: '🔥 OFERTAS DESTACADAS EN GASTRONOMÍA & RESTAURANTES',
    title: 'HASTA 50% OFF\nEN TUS LUGARES\nFAVORITOS.',
    subtitle:
      'Disfruta de promociones 2x1 en comida italiana, cortes finos, sushi, cafeterías y los mejores restaurantes de tu ciudad.',
    bgImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Ver Restaurantes',
    ctaUrl: '/coupons',
    cardTitle: 'GASTRONOMÍA PREMIUM',
    cardSubtitle: 'Ahorra en cada comida o cena especial',
    cardPrice: 'Beneficios ilimitados',
    features: [
      'Cupones 2x1 en platillos seleccionados',
      'Descuentos directos en la cuenta final',
      'Válido en sucursales matriz y aliadas',
      'Presenta tu tarjeta o código QR al momento',
    ],
  },
  {
    id: 'slide-3',
    badgeText: '🎬 ENTRETENIMIENTO & ESTILO DE VIDA',
    title: 'BOLETOS 2X1,\nBOUTIQUES Y\nMUCHO MÁS.',
    subtitle:
      'Consigue entradas de cine a precio especial, pases de gimnasio gratis y descuentos en viajes y spas exclusivos.',
    bgImageUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Ver Promociones',
    ctaUrl: '/coupons',
    cardTitle: 'CLUB DE BENEFICIOS',
    cardSubtitle: 'Disfruta más pagando menos con BONOW+',
    cardPrice: 'Sin compromisos',
    features: [
      'Membresía física o digital BONOW+ en tu celular',
      'Notificaciones de ofertas exclusivas',
      'Uso ilimitado durante toda la vigencia',
      'Soporte directo 24/7 para miembros',
    ],
  },
];

interface ActiveAd {
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
  company?: { name: string; logoUrl: string | null } | null;
}

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Ciudad de México');
  const [heroSlides, setHeroSlides] =
    useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [categoriesList, setCategoriesList] = useState<
    { id?: string; name: string; icon?: string | null }[]
  >([]);

  // Ads & Notifications State
  const [activeAds, setActiveAds] = useState<ActiveAd[]>([]);
  const [dismissedModalIds, setDismissedModalIds] = useState<string[]>([]);
  const [dismissedBannerIds, setDismissedBannerIds] = useState<string[]>([]);

  // Real Database Coupons, Promotions, Companies & Branches State
  const [realCoupons, setRealCoupons] = useState<any[]>([]);
  const [realPromotions, setRealPromotions] = useState<any[]>([]);
  const [realCompanies, setRealCompanies] = useState<any[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealCoupons = async () => {
      try {
        const res = await fetch('http://localhost:3001/coupons');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRealCoupons(data);
          }
        }
      } catch {
        // Silencioso
      }
    };
    void fetchRealCoupons();
  }, []);

  useEffect(() => {
    const fetchRealPromotions = async () => {
      try {
        const res = await fetch('http://localhost:3001/coupons/promotions-page');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.items)) {
            setRealPromotions(data.items);
          }
        }
      } catch {
        // Silencioso
      }
    };
    void fetchRealPromotions();
  }, []);

  useEffect(() => {
    const fetchPublicCompanies = async () => {
      try {
        const res = await fetch('http://localhost:3001/coupons/companies/public');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRealCompanies(data);
          }
        }
      } catch {
        // Silencioso
      }
    };
    void fetchPublicCompanies();
  }, []);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const res = await fetch(
          'http://localhost:3001/geolocation/nearby?radius=50',
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setNearbyPlaces(data);
          }
        }
      } catch {
        // Silencioso
      }
    };
    void fetchNearby();
  }, []);

  useEffect(() => {
    const fetchMembershipPlans = async () => {
      try {
        const res = await fetch(
          'http://localhost:3001/coupons/membership-plans',
        );
        if (res.ok) {
          const plans = await res.json();
          if (Array.isArray(plans) && plans.length > 0) {
            const monthly =
              plans.find((p: any) => p.id === 'monthly') || plans[0];
            if (monthly && monthly.price) {
              setHeroSlides((prev) =>
                prev.map((slide, idx) =>
                  idx === 0
                    ? {
                        ...slide,
                        cardPrice: `Desde $${monthly.price} MXN / mes`,
                      }
                    : slide,
                ),
              );
            }
          }
        }
      } catch {
        // Silencioso
      }
    };
    void fetchMembershipPlans();
  }, []);

  useEffect(() => {
    const fetchActiveAds = async () => {
      try {
        const res = await fetch('http://localhost:3001/advertising/active');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setActiveAds(data);
          }
        }
      } catch {
        // Silencioso
      }
    };
    void fetchActiveAds();
  }, []);

  useEffect(() => {
    const fetchRealCategories = async () => {
      try {
        const res = await fetch(
          'http://localhost:3001/coupons/categories/list',
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategoriesList(data);
          }
        }
      } catch {
        // Silencioso
      }
    };
    void fetchRealCategories();
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('http://localhost:3001/coupons/hero-slides');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHeroSlides(data);
          }
        }
      } catch {
        // Fallback a slides por defecto
      }
    };
    void fetchSlides();
  }, []);

  useEffect(() => {
    if (isHovered || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides, isHovered]);

  const activeSlide = heroSlides[currentSlideIndex] || DEFAULT_HERO_SLIDES[0];

  const navigateOrLogin = (targetUrl: string) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    if (!token) {
      router.push('/login');
    } else {
      router.push(targetUrl);
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1,
    );
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateOrLogin(`/coupons?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="w-full bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen">
      {/* HERO CAROUSEL SECTION */}
      <section
        className="relative w-full h-[540px] md:h-[600px] overflow-hidden flex items-center group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Images Slider with smooth fade & zoom */}
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
              idx === currentSlideIndex
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.bgImageUrl || '/img/fondo1.jpg'}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/75 to-zinc-900/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          </div>
        ))}

        {/* Content Container */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading, Badge, Search */}
          <div className="md:col-span-7 space-y-5 text-white text-left animate-in fade-in duration-500">
            {/* Badge Indicator */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-xs font-black text-red-400 shadow-lg backdrop-blur-md">
              <span>{activeSlide.badgeText}</span>
            </div>

            {/* Title with lines */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase drop-shadow-md">
              {activeSlide.title.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {i === 1 ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-teal-400">
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                  {i < activeSlide.title.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>

            <p className="text-sm md:text-base text-zinc-300 font-medium max-w-lg leading-relaxed">
              {activeSlide.subtitle}
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl p-1.5 gap-2 max-w-xl border border-white/20"
            >
              <div className="flex-1 flex items-center px-4 gap-2">
                <Search className="h-5 w-5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none py-3 text-sm text-zinc-800 dark:text-zinc-150 placeholder-zinc-400"
                />
              </div>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-black text-sm px-8 py-3.5 rounded-2xl transition duration-300 shrink-0 shadow-lg shadow-red-500/30 cursor-pointer"
              >
                Buscar
              </button>
            </form>

            {/* Búsquedas Populares */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-1">
              <span className="font-bold text-zinc-300">Popular:</span>
              {[
                'Restaurantes',
                'Hoteles',
                'Gimnasios',
                'Belleza',
                'Entretenimiento',
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => navigateOrLogin(`/coupons?search=${item}`)}
                  className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 transition text-white font-semibold backdrop-blur-sm cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Dynamic Floating Card */}
          <div className="md:col-span-5 hidden md:block">
            <div className="bg-[#0F1E36]/90 backdrop-blur-xl border border-zinc-700/60 rounded-3xl p-7 shadow-2xl space-y-5 text-white text-left transform transition hover:scale-[1.01] duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-3 rounded-2xl border border-red-500/40 text-red-400 shadow-md">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white tracking-wide">
                    {activeSlide.cardTitle}
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium">
                    {activeSlide.cardSubtitle}
                  </p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-zinc-200 font-medium">
                {(
                  activeSlide.features || [
                    'Descuentos exclusivos',
                    'Cerca de ti siempre',
                    'Beneficios que te hacen ganar',
                    'Fácil, rápido y sin complicaciones',
                  ]
                ).map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 shrink-0 shadow-sm shadow-red-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-zinc-700/80 pt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wider block">
                    MEMBRESÍA BONOW+
                  </span>
                  <span className="text-base font-black text-white">
                    {activeSlide.cardPrice}
                  </span>
                </div>
                <button
                  onClick={() =>
                    navigateOrLogin(activeSlide.ctaUrl || '/coupons')
                  }
                  className="bg-red-500 hover:bg-red-600 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-red-500/30 cursor-pointer"
                >
                  {activeSlide.ctaText || 'Ver planes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 text-white border border-white/10 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl cursor-pointer"
              title="Slide Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 text-white border border-white/10 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl cursor-pointer"
              title="Slide Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Carousel Pagination Dots & Progress Bar */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-5 inset-x-0 z-30 flex items-center justify-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/50'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* CUPONES DESTACADOS & MAP DIVISION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 grid md:grid-cols-12 gap-8">
        {/* Left Column: Featured Coupons */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 shadow-sm">
                🔥 LO MÁS POPULAR
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Cupones destacados del mes
              </h2>
            </div>
            <button
              onClick={() => navigateOrLogin('/coupons')}
              className="text-xs font-black text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-4 py-2 rounded-xl shadow-md shadow-rose-500/20 transition duration-300 flex items-center gap-1 cursor-pointer hover:scale-105"
            >
              <span>Ver todos</span> <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {realCoupons.length > 0 ? (
              realCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  onClick={() => navigateOrLogin('/coupons')}
                  className="group relative bg-gradient-to-br from-[#1d0b30] via-[#121630] to-[#0d1c3a] border-2 border-violet-500/30 hover:border-rose-400 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1.5 text-white"
                >
                  {/* Top Color Accent Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-teal-400" />

                  {/* Coupon Header Banner Image & Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        coupon.imageUrl ||
                        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600'
                      }
                      alt={coupon.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500 brightness-95 group-hover:brightness-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c3a] via-transparent to-transparent" />

                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase text-white px-3 py-1 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-teal-500 shadow-lg border border-white/20">
                      {coupon.discount || 'DESCUENTO'}
                    </span>
                    <span className="absolute top-3 right-3 text-[9px] font-bold uppercase text-white px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                      BONOW+
                    </span>
                  </div>

                  {/* Coupon Details & Action */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block">
                        {coupon.company?.name || 'EMPRESA ALIADA'}
                      </span>
                      <h3 className="font-extrabold text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {coupon.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-300 font-semibold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-rose-400" />
                        {coupon.branches?.[0]?.city || 'México'}
                      </span>
                      <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1">
                        <Gift className="h-3 w-3" /> Usar hoy
                      </span>
                    </div>

                    <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-teal-500 hover:from-red-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-rose-500/25 transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer">
                      <span>Obtener Cupón</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-violet-500/30 bg-gradient-to-br from-[#1d0b30] to-[#0d1c3a] p-8 text-center space-y-2 text-white shadow-xl">
                <Sparkles className="h-8 w-8 text-amber-400 mx-auto" />
                <p className="text-sm font-black uppercase">
                  No hay cupones activos actualmente
                </p>
                <p className="text-xs text-zinc-300">
                  Pronto se agregarán nuevas promociones exclusivas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Near me Map */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/20 shadow-sm">
                📍 INTERACTIVO
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Cerca de ti
              </h2>
            </div>
            <button
              onClick={() => navigateOrLogin('/dashboard/map')}
              className="text-xs font-black text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-teal-500/40 shadow-md transition duration-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver mapa</span> <ChevronRight className="h-4 w-4 text-teal-400" />
            </button>
          </div>

          {/* Modern Dark Gradient Glowing Container for Map */}
          <div className="relative bg-gradient-to-br from-slate-900 via-[#121630] to-[#0d1c3a] border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl space-y-5 text-white overflow-hidden ring-1 ring-white/10">
            {/* Background Glow Lights */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 bg-rose-500/20 rounded-full blur-2xl" />

            {/* Header info */}
            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Sucursales Activas
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30">
                En tiempo real
              </span>
            </div>

            {/* Map Preview Image with Modern Overlay */}
            <div
              onClick={() => navigateOrLogin('/dashboard/map')}
              className="group relative rounded-2xl overflow-hidden h-40 border-2 border-indigo-400/40 cursor-pointer shadow-lg transform transition duration-300 hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600"
                alt="Map snippet"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-between p-3">
                <div className="self-end bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-rose-400 flex items-center gap-1 border border-rose-500/30 shadow-md">
                  <MapPin className="h-3 w-3 animate-bounce" /> CDMX & Alrededores
                </div>
                <div className="bg-slate-900/90 backdrop-blur-md shadow-xl rounded-xl px-4 py-2.5 flex items-center justify-between border border-teal-400/40 group-hover:border-rose-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-500 p-1.5 rounded-lg text-white">
                      <Map className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-extrabold text-white">
                      Explorar en Mapa HD
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Near items list */}
            <div className="space-y-3 relative z-10">
              {nearbyPlaces.length > 0 ? (
                nearbyPlaces.slice(0, 4).map((place) => (
                  <div
                    key={place.id}
                    onClick={() => navigateOrLogin('/dashboard/map')}
                    className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/60 p-3 rounded-2xl transition duration-300 cursor-pointer shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        place.companyLogo ||
                        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={place.companyName || place.name}
                      className="h-11 w-11 rounded-xl object-cover shrink-0 border border-teal-400/30 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-white group-hover:text-teal-300 transition-colors truncate">
                        {place.companyName || place.name}
                      </h4>
                      <p className="text-[10px] text-teal-400 truncate font-bold">
                        {place.categoryName || 'Sucursal Registrada'}
                      </p>
                      <p className="text-[9px] text-zinc-400 truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-rose-400" />
                        {place.address || 'CDMX'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-amber-400/10 border border-amber-400/30 px-2 py-1 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-sm">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      4.9
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-zinc-300 font-semibold bg-white/5 rounded-2xl border border-white/10">
                  📍 Explora sucursales en el mapa interactivo
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PROMOCIONES DESTACADAS SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="space-y-1 text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
              ⭐ DESTACADAS POR ADMIN & EMPRESAS
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Promociones destacadas
            </h2>
          </div>
          <button
            onClick={() => navigateOrLogin('/coupons')}
            className="text-xs font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition duration-300 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-105"
          >
            <span>Explorar Promociones</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const featuredList = realPromotions.filter((p: any) => p.isFeatured === true);
            const promoListToUse = realPromotions.length > 0 ? featuredList : [
              {
                id: 'promo-default-1',
                title: '2x1 en Platillos Fuertes y Coctelería de Autor',
                companyName: 'Restaurante Gourmet La Casona',
                category: 'Gastronomía',
                discount: '2X1 GOURMET',
                description:
                  'Válido de lunes a domingo en consumos mínimos de $300 MXN. Presenta tu membresía digital en sucursal.',
                imageUrl:
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
              },
              {
                id: 'promo-default-2',
                title: 'Pass VIP 2x1 en Entradas y Combos Dulces',
                companyName: 'Cinépolis & Cinemex VIP',
                category: 'Entretenimiento',
                discount: '2X1 CINE',
                description:
                  'Aplica para salas tradicionales y VIP todas las funciones de lunes a viernes.',
                imageUrl:
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
              },
              {
                id: 'promo-default-3',
                title: '50% de Descuento en Circuito de Spa & Masajes',
                companyName: 'Zenith Luxury Spa',
                category: 'Belleza',
                discount: '50% OFF',
                description:
                  'Incluye masaje relajante de 60 min y circuito de hidroterapia con reserva previa.',
                imageUrl:
                  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
              },
            ];

            if (promoListToUse.length === 0) {
              return (
                <div className="col-span-full py-8 text-center text-xs text-zinc-400 font-bold bg-white/5 rounded-3xl border border-amber-500/20">
                  ⭐ No hay promociones destacadas en este momento. El administrador puede destacarlas desde la consola.
                </div>
              );
            }

            return promoListToUse
              .slice(0, 6)
              .map((promo: any) => (
                <div
                  key={promo.id}
                  onClick={() => navigateOrLogin('/coupons')}
                  className="group relative bg-gradient-to-br from-[#121630] via-[#1a0f35] to-[#0d1c3a] border-2 border-amber-500/30 hover:border-amber-400 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1.5 text-white"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500 brightness-95 group-hover:brightness-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121630] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase text-zinc-950 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg border border-amber-300/40">
                      {promo.discount || 'OFERTA'}
                    </span>
                    <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase text-amber-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> DESTACADA
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                        {promo.companyName}
                      </span>
                      <h3 className="font-extrabold text-base text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {promo.title}
                      </h3>
                      {promo.description && (
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {promo.description}
                        </p>
                      )}
                    </div>

                    <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer">
                      <span>Ver Promoción</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ));
          })()}
        </div>
      </section>

      {/* CATEGORIES SECTION (Diseño Compacto, Visual & Futurista) */}
      <section className="bg-gradient-to-b from-zinc-950 via-slate-950 to-zinc-950 border-y border-violet-900/40 py-12 md:py-16 relative overflow-hidden text-white">
        {/* Orbes de Luz Neón Flotantes */}
        <div className="pointer-events-none absolute -top-20 left-1/4 w-[400px] h-[250px] bg-violet-600/20 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 w-[400px] h-[250px] bg-fuchsia-600/20 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1 text-left">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/30 shadow-md">
                ⚡ CATEGORÍAS POPULARES
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight drop-shadow-md">
                Explora por{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  Categorías
                </span>
              </h2>
            </div>
            <button
              onClick={() => navigateOrLogin('/coupons')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-black text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-lg shadow-violet-600/30 self-start sm:self-auto hover:scale-105 cursor-pointer"
            >
              <span>Ver todas</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Grid Compacto & Elegante (Menor altura, tarjetas redondeadas y balanceadas) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {(categoriesList.length > 0 ? categoriesList : CATEGORIES).map(
              (cat: any, idx: number) => (
                <div
                  key={cat.id || cat.name || idx}
                  onClick={() =>
                    navigateOrLogin(
                      `/coupons?${cat.id ? `categoryId=${cat.id}` : `search=${cat.name}`}`,
                    )
                  }
                  className="group relative bg-gradient-to-b from-slate-900 via-[#121630] to-zinc-950 border border-violet-500/30 hover:border-fuchsia-400/80 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-violet-500/20 flex flex-col items-center justify-center space-y-2.5 overflow-hidden"
                >
                  {/* Luz ambiental */}
                  <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-violet-500/20 blur-lg group-hover:scale-150 transition-transform duration-500" />

                  {/* Icon Container */}
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-violet-600/30 group-hover:scale-110 transition-transform border border-white/20">
                    {renderCategoryIcon(cat.icon, cat.name)}
                  </div>

                  {/* Title & Badge */}
                  <div className="space-y-0.5 z-10">
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors truncate max-w-[120px]">
                      {cat.name}
                    </h3>
                    <span className="inline-block text-[9px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      HASTA 50% OFF
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN ESPECIAL: NOVEDADES & ANUNCIOS DESTACADOS (ADMIN ADS) */}
      {activeAds.filter(
        (a) => a.position === 'HOME_SECTION' || a.position === 'HOME_CAROUSEL',
      ).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Megaphone className="h-7 w-7 text-amber-500 animate-pulse" />
              <span>⚡ Novedades & Anuncios Destacados</span>
            </h2>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              BONOW ANUNCIOS
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeAds
              .filter(
                (a) =>
                  a.position === 'HOME_SECTION' ||
                  a.position === 'HOME_CAROUSEL',
              )
              .map((ad) => (
                <div
                  key={ad.id}
                  className="group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl hover:shadow-2xl hover:border-violet-500 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {ad.imageUrl && (
                      <div className="relative h-44 w-full overflow-hidden rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-amber-500 text-zinc-950 px-3 py-1 text-[10px] font-black uppercase shadow-lg">
                          ANUNCIO ESPECIAL
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      {ad.company?.name && (
                        <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block">
                          {ad.company.name}
                        </span>
                      )}
                      <h3 className="font-black text-lg text-zinc-900 dark:text-white leading-tight">
                        {ad.title}
                      </h3>
                      {ad.description && (
                        <p className="text-xs text-zinc-500 line-clamp-3">
                          {ad.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateOrLogin(ad.linkUrl || '/promotions')}
                    className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-xs font-black text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Conocer Más</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* EMPRESAS DESTACADAS REALES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 shadow-sm">
              🏢 COMERCIOS OFICIALES VERIFICADOS
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Empresas destacadas
            </h2>
          </div>
          <button
            onClick={() => navigateOrLogin('/coupons')}
            className="text-xs font-black text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todas</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(() => {
            const featuredList = realCompanies.filter((c: any) => c.isFeatured === true);
            const companiesToUse = realCompanies.length > 0
              ? featuredList
              : PARTNER_LOGOS.map((p, i) => ({
                  id: `p-${i}`,
                  name: p.name,
                  logoUrl: null,
                  category: { name: 'Comercio Aliado' },
                  couponsCount: 3,
                }));

            if (companiesToUse.length === 0) {
              return (
                <div className="col-span-full py-8 text-center text-xs text-zinc-400 font-bold bg-white/5 rounded-3xl border border-violet-500/20">
                  🏢 No hay empresas destacadas en este momento. El administrador puede destacarlas desde el panel general.
                </div>
              );
            }

            return companiesToUse.map((company: any) => (
              <div
                key={company.id || company.name}
                onClick={() =>
                  navigateOrLogin(
                    `/coupons?search=${encodeURIComponent(company.name)}`,
                  )
                }
                className="group relative bg-gradient-to-br from-[#1d0b30] via-[#121630] to-[#0d1c3a] border-2 border-violet-500/40 hover:border-rose-400 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5 text-white flex flex-col justify-between"
              >
                {/* Header Gradient Banner */}
                <div className="h-20 w-full bg-gradient-to-r from-violet-600 via-rose-500 to-teal-500 relative flex items-start justify-end p-3">
                  <span className="bg-black/60 backdrop-blur-md text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-400/30 shadow-md">
                    ✓ OFICIAL BONOW
                  </span>
                </div>

                {/* Profile Photo Avatar Circle */}
                <div className="relative -mt-10 mx-auto h-20 w-20 rounded-full border-4 border-[#121630] bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {company.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-violet-600 to-teal-600 flex items-center justify-center text-white">
                      <Building className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="p-5 text-center space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors truncate">
                      {company.name}
                    </h3>
                    <p className="text-xs font-bold text-teal-400 uppercase tracking-wide truncate">
                      {company.category?.name || 'Comercio Aliado'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 shadow-sm">
                      🔥 {company.couponsCount || 1} Ofertas Disponibles
                    </span>
                  </div>

                  <button className="w-full mt-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-rose-500 to-teal-500 hover:from-violet-500 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-violet-600/30 transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>Ver Ofertas y Cupones</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* FOOTER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="bg-gradient-to-r from-[#0F1E36] via-red-500 to-teal-600 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Únete a BONOW+ y comienza a disfrutar
            </h2>
            <p className="text-sm md:text-base text-zinc-100 font-medium">
              Lo bueno es recibir más. Descuentos exclusivos y beneficios cerca de ti siempre.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/membership')}
            className="bg-white hover:bg-zinc-50 text-[#0F1E36] font-extrabold text-sm px-8 py-3.5 rounded-2xl transition duration-300 shrink-0 shadow-lg text-center cursor-pointer"
          >
            Ver planes BONOW+
          </button>
        </div>
      </section>

      {/* MAIN FOOTER */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-850 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 text-left">
          {/* Logo and About */}
          <div className="md:col-span-4 space-y-4">
            <BonowLogo variant="light" size="lg" />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              La plataforma líder en recompensas y beneficios exclusivos en México.
              Lo bueno es recibir más. Tu recompensa, ahora.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Share2 className="h-5 w-5 text-zinc-500 hover:text-white cursor-pointer transition" />
              <Globe className="h-5 w-5 text-zinc-500 hover:text-white cursor-pointer transition" />
            </div>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Explorar
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => router.push('/coupons')}
                  className="hover:text-white"
                >
                  Todas las promociones
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/coupons')}
                  className="hover:text-white"
                >
                  Empresas asociadas
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/dashboard/map')}
                  className="hover:text-white"
                >
                  Mapa de ofertas
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/dashboard/membership')}
                  className="hover:text-white"
                >
                  Nuevas promociones
                </button>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Ayuda
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-white">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Aviso de privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Empresa
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-white">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Trabaja con nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Prensa
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Recibe ofertas
            </h4>
            <p className="text-[10px] text-zinc-550 leading-relaxed">
              Suscríbete y recibe los mejores cupones en tu correo electrónico.
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu correo"
                className="w-full bg-zinc-850 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 rounded-xl transition duration-300"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>
      </footer>

      {/* ANUNCIOS FLOTANTES EMERGENTES (FLOATING MODALS 3D) */}
      {activeAds
        .filter(
          (ad) =>
            ad.position === 'FLOATING_MODAL' &&
            !dismissedModalIds.includes(ad.id),
        )
        .slice(0, 1)
        .map((ad) => (
          <div
            key={ad.id}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 text-left overflow-hidden">
              {/* Glow background accent */}
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet-600/30 blur-2xl pointer-events-none" />

              <button
                onClick={() => setDismissedModalIds((prev) => [...prev, ad.id])}
                className="absolute top-4 right-4 z-10 rounded-full bg-zinc-100 dark:bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                title="Cerrar anuncio"
              >
                <X className="h-4 w-4" />
              </button>

              {ad.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 px-3 py-1 text-[10px] font-black uppercase shadow-lg tracking-wider">
                    ⚡ ANUNCIO DESTACADO
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {ad.company?.name && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 block">
                    {ad.company.name}
                  </span>
                )}
                <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
                  {ad.title}
                </h3>
                {ad.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {ad.description}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    setDismissedModalIds((prev) => [...prev, ad.id])
                  }
                  className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setDismissedModalIds((prev) => [...prev, ad.id]);
                    navigateOrLogin(ad.linkUrl || '/promotions');
                  }}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-xs font-black text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/30 cursor-pointer text-center"
                >
                  Aprovechar Oferta →
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* ANUNCIOS FLOTANTES FIJOS INFERIORES (FLOATING BANNERS / BOTTOM BAR) */}
      {activeAds
        .filter(
          (ad) =>
            ad.position === 'FLOATING_BANNER' &&
            !dismissedBannerIds.includes(ad.id),
        )
        .slice(0, 1)
        .map((ad) => (
          <div
            key={ad.id}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-500"
          >
            <div className="rounded-3xl bg-zinc-950/90 text-white border border-violet-500/30 p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/40">
                  <Megaphone className="h-5 w-5 animate-pulse" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">
                    ANUNCIO BONOW
                  </span>
                  <h4 className="font-black text-xs text-white truncate">
                    {ad.title}
                  </h4>
                  {ad.description && (
                    <p className="text-[10px] text-zinc-400 truncate">
                      {ad.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setDismissedBannerIds((prev) => [...prev, ad.id]);
                    navigateOrLogin(ad.linkUrl || '/promotions');
                  }}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-[11px] px-3.5 py-2 hover:from-violet-500 hover:to-purple-500 transition shadow-md shadow-violet-600/30 cursor-pointer"
                >
                  Ver
                </button>
                <button
                  onClick={() =>
                    setDismissedBannerIds((prev) => [...prev, ad.id])
                  }
                  className="rounded-xl p-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
