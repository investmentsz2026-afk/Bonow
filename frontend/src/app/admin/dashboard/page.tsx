'use client';

import { API_URL } from '@/lib/api';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Ticket,
  Shield,
  CreditCard,
  Megaphone,
  TrendingUp,
  Settings,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Check,
  Search,
  Download,
  Trash2,
  Edit,
  X,
  UserCheck,
  UserMinus,
  Eye,
  Wifi,
  Copy,
  FileImage,
  FileText,
  Printer,
  Lock,
  Edit3,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Sparkle,
  Dumbbell,
  Film,
  HeartPulse,
  ShoppingBag,
  Plane,
  Sparkles,
  Flame,
  MapPin,
  Upload,
  Star,
  Tag,
} from 'lucide-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faBuilding,
  faBullseye,
  faTag,
  faLightbulb,
  faThumbtack,
  faCrown,
  faBolt,
  faCoins,
  faCheckCircle,
  faFlagCheckered,
  faRocket,
  faChartLine,
  faCreditCard,
  faExclamationTriangle,
  faMapMarkerAlt,
  faClock,
  faMapMarkedAlt,
  faHandPointDown,
  faTicketAlt,
  faLock,
  faStar,
  faFilm,
  faUtensils,
  faFire,
  faCheck,
  faTimes,
  faEye,
  faEdit,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalMemberships: number;
  totalPayments: number;
  totalEarningsMXN: number;
  plans: {
    monthly: number;
    quarterly: number;
    semesterly: number;
    annual: number;
  };
}

interface RecentActivity {
  text: string;
  desc: string;
  time: string;
}

interface RecentRedemption {
  id: string;
  redeemedAt: string;
  user: { firstName: string; lastName: string; email: string };
  coupon: { title: string; company: { name: string } };
}

interface UserItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  roles: { name: string }[];
}

interface CompanyItem {
  id: string;
  name: string;
  corporateName: string;
  rfc: string;
  status: string;
  isFeatured?: boolean;
  email: string | null;
  phone: string | null;
}

interface CouponItem {
  id: string;
  title: string;
  description: string;
  discount: string;
  status: string;
  rejectionReason?: string | null;
  company: { name: string };
  category: { name: string };
  code: string;
  type: string;
  startDate: string;
  endDate: string;
  conditions?: string | null;
  imageUrl?: string | null;
  usageLimit?: number | null;
  usageCount: number;
}

interface MembershipItem {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  user: { firstName: string; lastName: string; email: string };
}

interface PaymentItem {
  id: string;
  amount: string;
  currency: string;
  planType?: string;
  status: string;
  provider: string;
  providerTxId: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string | null;
  status: string;
  createdAt: string;
}

interface SettingItem {
  key: string;
  value: string;
  description: string | null;
}

interface CompanyAdItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  isFeatured?: boolean;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
}

interface VirtualCardItem {
  id: string;
  cardNumber: string;
  cardType: string;
  status: string;
  price?: string | number;
  createdAt: string;
  registeredAt?: string;
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

const renderCategoryIconAdmin = (iconNameOrEmoji?: any, name?: string) => {
  if (typeof iconNameOrEmoji === 'string' && iconNameOrEmoji.trim()) {
    if (/\p{Extended_Pictographic}/u.test(iconNameOrEmoji)) {
      return <span className="text-2xl">{iconNameOrEmoji}</span>;
    }
  }
  const lower = (name || '').toLowerCase();
  if (
    lower.includes('restauran') ||
    lower.includes('comida') ||
    lower.includes('gastronom')
  ) {
    return <UtensilsCrossed className="h-5 w-5 text-white" />;
  }
  if (lower.includes('café') || lower.includes('cafeter')) {
    return <Coffee className="h-5 w-5 text-white" />;
  }
  if (lower.includes('hotel') || lower.includes('hosped')) {
    return <Hotel className="h-5 w-5 text-white" />;
  }
  if (
    lower.includes('belleza') ||
    lower.includes('spa') ||
    lower.includes('estétic')
  ) {
    return <Sparkle className="h-5 w-5 text-white" />;
  }
  if (
    lower.includes('gimnasio') ||
    lower.includes('fitness') ||
    lower.includes('sport')
  ) {
    return <Dumbbell className="h-5 w-5 text-white" />;
  }
  if (
    lower.includes('cine') ||
    lower.includes('entretenim') ||
    lower.includes('divers')
  ) {
    return <Film className="h-5 w-5 text-white" />;
  }
  if (
    lower.includes('salud') ||
    lower.includes('médic') ||
    lower.includes('clínic')
  ) {
    return <HeartPulse className="h-5 w-5 text-white" />;
  }
  if (
    lower.includes('tienda') ||
    lower.includes('compras') ||
    lower.includes('moda')
  ) {
    return <ShoppingBag className="h-5 w-5 text-white" />;
  }
  if (
    lower.includes('viaje') ||
    lower.includes('turismo') ||
    lower.includes('vuelo')
  ) {
    return <Plane className="h-5 w-5 text-white" />;
  }
  return <Sparkles className="h-5 w-5 text-white" />;
};

const DEFAULT_HERO_SLIDES_ADMIN = [
  {
    id: 'slide-1',
    badgeText: '⚡ CLUB DE DESCUENTOS #1 DE MÉXICO',
    title: 'DESCUBRE.\nAHORRA.\nDISFRUTA.',
    subtitle:
      'Accede a descuentos exclusivos en los mejores restaurantes, tiendas, servicios y entretenimiento de México.',
    bgImageUrl: '/img/fondo1.jpg',
    ctaText: 'Explorar Descuentos',
    ctaUrl: '/coupons',
    cardTitle: 'ÚNETE A BONOW+',
    cardSubtitle: 'Accede a beneficios exclusivos todos los días',
    cardPrice: 'Desde $99 MXN / mes',
    features: [
      'Descuentos exclusivos en CDMX y todo México',
      'Nuevas promociones cargadas cada día',
      'Cancelación sin plazos forzosos cuando quieras',
      'Miles de negocios aliados participantes',
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
    cardSubtitle: 'Disfruta más pagando menos con BONOW',
    cardPrice: 'Sin compromisos',
    features: [
      'Membresía física o digital en tu celular',
      'Notificaciones de ofertas exclusivas',
      'Uso ilimitado durante toda la vigencia',
      'Soporte directo 24/7 para miembros',
    ],
  },
];

const DEFAULT_MEMBERSHIP_PLANS_ADMIN = [
  {
    id: 'monthly',
    type: 'MONTHLY',
    name: 'Plan Mensual',
    price: 149,
    period: 'MXN / mes',
    durationDays: 30,
    description: 'Perfecto para probar la experiencia BONOW+.',
    badge: '',
    popular: false,
    features: [
      'Acceso total a todos los cupones 2x1 y descuentos',
      'Tarjeta digital activa al instante',
      'Sin plazos forzosos (cancela cuando quieras)',
      'Soporte al cliente prioritario',
    ],
  },
  {
    id: 'quarterly',
    type: 'QUARTERLY',
    name: 'Plan Trimestral',
    price: 399,
    period: 'MXN / 3 meses',
    durationDays: 90,
    description: 'Ahorra más de un 10% contratando un trimestre.',
    badge: 'POPULAR',
    popular: true,
    features: [
      'Todo lo del Plan Mensual',
      'Ahorro directo en la tarifa mensual',
      'Prioridad en eventos y preventas exclusivas',
      'Acceso a cupones VIP seleccionados',
    ],
  },
  {
    id: 'semesterly',
    type: 'SEMESTERLY',
    name: 'Plan Semestral',
    price: 699,
    period: 'MXN / 6 meses',
    durationDays: 180,
    description: 'Nuestra opción recomendada a mediano plazo.',
    badge: 'RECOMENDADO',
    popular: false,
    features: [
      'Todo lo del Plan Trimestral',
      'Mayor margen de ahorro continuo',
      'Pases especiales 2x1 en cine y entretenimiento',
      'Notificaciones de ofertas relámpago',
    ],
  },
  {
    id: 'annual',
    type: 'ANNUAL',
    name: 'Plan Anual',
    price: 1199,
    period: 'MXN / año',
    durationDays: 365,
    description: 'El mejor ahorro. Beneficios premium todo el año.',
    badge: 'SÚPER AHORRO',
    popular: false,
    features: [
      'Acceso ilimitado por 365 días completos',
      'Máximo ahorro garantizado (menos de $100/mes)',
      'Incluye versión de Tarjeta Física Coleccionable',
      'Soporte VIP telefónico y WhatsApp 24/7',
    ],
  },
];

import InteractiveMapPicker from '@/components/InteractiveMapPicker';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users'
    | 'companies'
    | 'coupons'
    | 'memberships'
    | 'payments'
    | 'categories'
    | 'news'
    | 'settings'
    | 'virtualCards'
    | 'heroSlides'
    | 'aboutPage'
    | 'promotionsPage'
    | 'mapBranches'
    | 'createCoupon'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<
    RecentRedemption[]
  >([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );

  // List Data
  const [users, setUsers] = useState<UserItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [virtualCards, setVirtualCards] = useState<VirtualCardItem[]>([]);
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [settings, setSettings] = useState<SettingItem[]>([]);

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals / Generation
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showGenerateDigitalModal, setShowGenerateDigitalModal] =
    useState(false);
  const [showGeneratePhysicalModal, setShowGeneratePhysicalModal] =
    useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [previewCard, setPreviewCard] = useState<VirtualCardItem | null>(null);
  const [cardCopied, setCardCopied] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showInlineCategoryModal, setShowInlineCategoryModal] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');
  const [inlineCategoryIcon, setInlineCategoryIcon] = useState('');
  const [savingInlineCategory, setSavingInlineCategory] = useState(false);
  const [showCouponTypeInfo, setShowCouponTypeInfo] = useState(false);
  const [previewCoupon, setPreviewCoupon] = useState<CouponItem | null>(null);
  const [couponCopied, setCouponCopied] = useState(false);
  const [cardPrice, setCardPrice] = useState('90');

  // Admin Coupon Approval & Rejection State
  const [rejectingCoupon, setRejectingCoupon] = useState<CouponItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);
  const [approvingCouponId, setApprovingCouponId] = useState<string | null>(null);

  // Card Edit Price & Delete State
  const [editingCard, setEditingCard] = useState<VirtualCardItem | null>(null);
  const [editingCardPriceValue, setEditingCardPriceValue] = useState('');
  const [updatingCardPrice, setUpdatingCardPrice] = useState(false);
  const [deletingCard, setDeletingCard] = useState<VirtualCardItem | null>(
    null,
  );
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  // Hero Slide Management State
  const [adminHeroSlides, setAdminHeroSlides] = useState<any[]>(
    DEFAULT_HERO_SLIDES_ADMIN,
  );
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [heroForm, setHeroForm] = useState({
    id: '',
    badgeText: '',
    title: '',
    subtitle: '',
    bgImageUrl: '',
    ctaText: '',
    ctaUrl: '',
    cardTitle: '',
    cardSubtitle: '',
    cardPrice: '',
    feature1: '',
    feature2: '',
    feature3: '',
    feature4: '',
  });
  const [savingHeroSlides, setSavingHeroSlides] = useState(false);

  const loadHeroSlidesAdmin = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers,
      });
      if (res.ok) {
        const settingsList = await res.json();
        const heroSetting = settingsList.find(
          (s: any) => s.key === 'HERO_SLIDES',
        );
        if (heroSetting && heroSetting.value) {
          try {
            const parsed = JSON.parse(heroSetting.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAdminHeroSlides(parsed);
              return;
            }
          } catch {
            // Silencioso
          }
        }
      }
    } catch {
      // Silencioso
    }
    setAdminHeroSlides(DEFAULT_HERO_SLIDES_ADMIN);
  };

  // Membership Plans Admin State
  const [adminMembershipPlans, setAdminMembershipPlans] = useState<any[]>(
    DEFAULT_MEMBERSHIP_PLANS_ADMIN,
  );
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  // Credit Packages Admin State
  const [adminCreditPackages, setAdminCreditPackages] = useState<any[]>([
    { id: 'pack-5', name: 'Paquete Básico (5 Cupones)', credits: 5, price: 199, description: 'Ideal para pequeñas ofertas y promociones.' },
    { id: 'pack-10', name: 'Paquete Emprendedor (10 Cupones)', credits: 10, price: 349, popular: true, description: 'La opción recomendada para mantener ofertas activas.' },
    { id: 'pack-20', name: 'Paquete Empresarial (20 Cupones)', credits: 20, price: 599, description: 'Máximo valor para marcas con alto catálogo.' },
  ]);
  const [showCreditPackagesModal, setShowCreditPackagesModal] = useState(false);
  const [savingCreditPackages, setSavingCreditPackages] = useState(false);

  // Company Detail Modal State for Admin
  const [selectedAdminCompanyDetail, setSelectedAdminCompanyDetail] = useState<any | null>(null);
  const [showAdminCompanyDetailModal, setShowAdminCompanyDetailModal] = useState(false);

  const loadCreditPackagesAdmin = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/credit-packages`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAdminCreditPackages(data);
        }
      }
    } catch {
      // Silencioso
    }
  };

  const handleSaveCreditPackagesAdmin = async () => {
    const headers = getHeaders();
    if (!headers) return;
    setSavingCreditPackages(true);
    try {
      const res = await fetch(`${API_URL}/admin/credit-packages`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packages: adminCreditPackages }),
      });
      if (res.ok) {
        alert('¡Precios y paquetes de créditos para empresas guardados correctamente!');
        setShowCreditPackagesModal(false);
      } else {
        alert('Error al guardar paquetes de créditos.');
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setSavingCreditPackages(false);
    }
  };
  const [membershipForm, setMembershipForm] = useState({
    id: '',
    type: '',
    name: '',
    price: '',
    period: '',
    durationDays: 30,
    description: '',
    badge: '',
    feature1: '',
    feature2: '',
    feature3: '',
    feature4: '',
  });
  const [savingMembershipPlans, setSavingMembershipPlans] = useState(false);

  const loadMembershipPlansAdmin = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers,
      });
      if (res.ok) {
        const settingsList = await res.json();
        const planSetting = settingsList.find(
          (s: any) => s.key === 'MEMBERSHIP_PLANS',
        );
        if (planSetting && planSetting.value) {
          try {
            const parsed = JSON.parse(planSetting.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAdminMembershipPlans(parsed);
              return;
            }
          } catch {
            // Silencioso
          }
        }
      }
    } catch {
      // Silencioso
    }
    setAdminMembershipPlans(DEFAULT_MEMBERSHIP_PLANS_ADMIN);
  };

  const handleSaveMembershipPlan = async () => {
    const headers = getHeaders();
    if (!headers) return;
    setSavingMembershipPlans(true);
    setError(null);
    try {
      const features = [
        membershipForm.feature1,
        membershipForm.feature2,
        membershipForm.feature3,
        membershipForm.feature4,
      ].filter(Boolean);

      const planObj = {
        id: membershipForm.id,
        type: membershipForm.type || membershipForm.id.toUpperCase(),
        name: membershipForm.name,
        price: parseFloat(membershipForm.price) || 0,
        period: membershipForm.period,
        durationDays: parseInt(String(membershipForm.durationDays), 10) || 30,
        description: membershipForm.description,
        badge: membershipForm.badge,
        popular: membershipForm.badge.toUpperCase().includes('POPULAR'),
        features,
      };

      let updatedList = [...adminMembershipPlans];
      const existingIdx = updatedList.findIndex((p) => p.id === planObj.id);
      if (existingIdx >= 0) {
        updatedList[existingIdx] = planObj;
      } else {
        updatedList.push(planObj);
      }

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'MEMBERSHIP_PLANS',
          value: JSON.stringify(updatedList),
          description: 'Tarifas y planes de membresía para clientes',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            'Tu sesión expiró o requieres permisos de Administrador. Por favor vuelve a iniciar sesión como Admin.',
          );
        }
        throw new Error(data.message || 'Error al guardar planes de membresía');
      }

      setAdminMembershipPlans(updatedList);
      setSuccess('Plan de membresía actualizado con éxito');
      setShowMembershipModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar membresía',
      );
    } finally {
      setSavingMembershipPlans(false);
    }
  };

  // About Page Admin State
  const [aboutForm, setAboutForm] = useState({
    heroTag: 'Conoce el Club de Descuentos #1 de México',
    title: 'REVOLUCIONANDO EL AHORRO Y EL ESTILO DE VIDA',
    subtitle:
      'BONOW conecta a miles de miembros en todo México con los mejores restaurantes, cafeterías, spas, gimnasios y entretenimiento a precios exclusivos y promociones 2x1 ilimitadas.',
    stat1Label: 'Miembros Activos',
    stat1Value: '+10,000',
    stat2Label: 'Marcas Aliadas',
    stat2Value: '+500',
    stat3Label: 'Ahorrados por la Comunidad',
    stat3Value: '+$2M MXN',
    stat4Label: 'Calificación de Clientes',
    stat4Value: '4.9 / 5',
    pillar1Title: 'Garantía de Ahorro Real',
    pillar1Desc:
      'Todos nuestros cupones y promociones son validados previamente directamente con la directiva de cada empresa aliada.',
    pillar2Title: 'Alianzas Transparentes',
    pillar2Desc:
      'Impulsamos a comercios y negocios locales de todo México conectándolos con clientes leales sin intermediarios innecesarios.',
    pillar3Title: 'Experiencia 100% Digital',
    pillar3Desc:
      'Sin necesidad de cupones impresos. Muestra tu membresía digital o código QR directamente en la sucursal desde tu celular.',
  });
  const [savingAboutPage, setSavingAboutPage] = useState(false);

  const loadAboutPageAdmin = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers,
      });
      if (res.ok) {
        const settingsList = await res.json();
        const setting = settingsList.find((s: any) => s.key === 'ABOUT_PAGE');
        if (setting && setting.value) {
          try {
            const parsed = JSON.parse(setting.value);
            if (parsed && parsed.title) {
              setAboutForm({
                heroTag: parsed.heroTag || '',
                title: parsed.title || '',
                subtitle: parsed.subtitle || '',
                stat1Label: parsed.stats?.[0]?.label || 'Miembros Activos',
                stat1Value: parsed.stats?.[0]?.value || '+10,000',
                stat2Label: parsed.stats?.[1]?.label || 'Marcas Aliadas',
                stat2Value: parsed.stats?.[1]?.value || '+500',
                stat3Label:
                  parsed.stats?.[2]?.label || 'Ahorrados por la Comunidad',
                stat3Value: parsed.stats?.[2]?.value || '+$2M MXN',
                stat4Label:
                  parsed.stats?.[3]?.label || 'Calificación de Clientes',
                stat4Value: parsed.stats?.[3]?.value || '4.9 / 5',
                pillar1Title: parsed.pillars?.[0]?.title || '',
                pillar1Desc: parsed.pillars?.[0]?.desc || '',
                pillar2Title: parsed.pillars?.[1]?.title || '',
                pillar2Desc: parsed.pillars?.[1]?.desc || '',
                pillar3Title: parsed.pillars?.[2]?.title || '',
                pillar3Desc: parsed.pillars?.[2]?.desc || '',
              });
            }
          } catch {
            // Silencioso
          }
        }
      }
    } catch {
      // Silencioso
    }
  };

  const handleSaveAboutPage = async () => {
    const headers = getHeaders();
    if (!headers) return;
    setSavingAboutPage(true);
    setError(null);
    try {
      const payload = {
        heroTag: aboutForm.heroTag,
        title: aboutForm.title,
        subtitle: aboutForm.subtitle,
        stats: [
          { label: aboutForm.stat1Label, value: aboutForm.stat1Value },
          { label: aboutForm.stat2Label, value: aboutForm.stat2Value },
          { label: aboutForm.stat3Label, value: aboutForm.stat3Value },
          { label: aboutForm.stat4Label, value: aboutForm.stat4Value },
        ],
        pillars: [
          { title: aboutForm.pillar1Title, desc: aboutForm.pillar1Desc },
          { title: aboutForm.pillar2Title, desc: aboutForm.pillar2Desc },
          { title: aboutForm.pillar3Title, desc: aboutForm.pillar3Desc },
        ],
      };

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'ABOUT_PAGE',
          value: JSON.stringify(payload),
          description: 'Contenido dinámico de la página Nosotros',
        }),
      });

      if (!res.ok) throw new Error('Error al guardar página Nosotros');

      setSuccess('Contenido de la página Nosotros guardado con éxito');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar la página',
      );
    } finally {
      setSavingAboutPage(false);
    }
  };

  // Promotions Page Admin State
  const [promotionsForm, setPromotionsForm] = useState({
    heroTag: 'OFERTAS ESPECIALES 2X1 & DESCUENTOS DESTACADOS',
    title: 'PROMOCIONES DE LA SEMANA',
    subtitle:
      'Disfruta de cupones exclusivos 2x1 en gastronomía, pases VIP de entretenimiento y ofertas por tiempo limitado en México.',
    cardBadge: 'BENEFICIO EXCLUSIVO MIEMBROS',
    cardPrice: '$0 Costo Extra',
    items: [
      {
        id: 'promo-1',
        title: '2x1 en Platillos Fuertes y Coctelería de Autor',
        companyName: 'Restaurante Gourmet La Casona',
        category: 'Restaurantes',
        discount: '2X1 GOURMET',
        description:
          'Válido de lunes a domingo en consumos mínimos de $300 MXN. Presenta tu membresía digital en sucursal.',
        imageUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        isFeatured: true,
      },
      {
        id: 'promo-2',
        title: 'Pass VIP 2x1 en Entradas y Combos Dulces',
        companyName: 'Cinépolis & Cinemex VIP',
        category: 'Entretenimiento',
        discount: '2X1 ENTRADAS',
        description:
          'Aplica para salas tradicionales y VIP todas las funciones de lunes a viernes.',
        imageUrl:
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
        isFeatured: true,
      },
      {
        id: 'promo-3',
        title: '50% de Descuento en Circuito de Spa & Masajes',
        companyName: 'Zenith Luxury Spa',
        category: 'Belleza',
        discount: '50% OFF',
        description:
          'Incluye masaje relajante de 60 min y circuito de hidroterapia con reserva previa.',
        imageUrl:
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
        isFeatured: true,
      },
    ] as Array<{
      id: string;
      title: string;
      companyName: string;
      category: string;
      discount: string;
      description: string;
      imageUrl: string;
      isFeatured?: boolean;
    }>,
  });
  const [savingPromotionsPage, setSavingPromotionsPage] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoItemForm, setPromoItemForm] = useState<{
    id: string;
    title: string;
    companyName: string;
    category: string;
    discount: string;
    description: string;
    imageUrl: string;
    isFeatured?: boolean;
  }>({
    id: '',
    title: '',
    companyName: '',
    category: 'Restaurantes',
    discount: '2X1',
    description: '',
    imageUrl: '',
    isFeatured: false,
  });

  const loadPromotionsPageAdmin = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers,
      });
      if (res.ok) {
        const settingsList = await res.json();
        const setting = settingsList.find(
          (s: any) => s.key === 'PROMOTIONS_PAGE',
        );
        if (setting && setting.value) {
          try {
            const parsed = JSON.parse(setting.value);
            if (parsed && parsed.title) {
              setPromotionsForm({
                heroTag: parsed.heroTag || '',
                title: parsed.title || '',
                subtitle: parsed.subtitle || '',
                cardBadge: parsed.cardBadge || '',
                cardPrice: parsed.cardPrice || '',
                items: Array.isArray(parsed.items) ? parsed.items : [],
              });
            }
          } catch {
            // Silencioso
          }
        }
      }
    } catch {
      // Silencioso
    }
  };

  const handleSavePromotionsPage = async (updatedItems?: any[]) => {
    const headers = getHeaders();
    if (!headers) return;
    setSavingPromotionsPage(true);
    setError(null);
    try {
      const itemsToSave = updatedItems || promotionsForm.items;
      const payload = {
        heroTag: promotionsForm.heroTag,
        title: promotionsForm.title,
        subtitle: promotionsForm.subtitle,
        cardBadge: promotionsForm.cardBadge,
        cardPrice: promotionsForm.cardPrice,
        items: itemsToSave,
      };

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'PROMOTIONS_PAGE',
          value: JSON.stringify(payload),
          description: 'Contenido dinámico de la página Promociones',
        }),
      });

      if (!res.ok) throw new Error('Error al guardar página Promociones');

      setSuccess('Módulo de Promociones actualizado con éxito');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar promociones',
      );
    } finally {
      setSavingPromotionsPage(false);
    }
  };

  const handleSavePromoItem = () => {
    let newItems = [...promotionsForm.items];
    if (promoItemForm.id) {
      newItems = newItems.map((it) =>
        it.id === promoItemForm.id ? { ...promoItemForm } : it,
      );
    } else {
      const newItem = {
        ...promoItemForm,
        id: `promo-${Date.now()}`,
      };
      newItems.push(newItem);
    }
    setPromotionsForm((prev) => ({ ...prev, items: newItems }));
    setShowPromoModal(false);
    void handleSavePromotionsPage(newItems);
  };

  const [adminCompanyAds, setAdminCompanyAds] = useState<CompanyAdItem[]>([]);

  const loadCompanyAds = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/advertising`, { headers });
      const data = await res.json();
      if (res.ok && isMounted) {
        setAdminCompanyAds(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silencioso
    }
  };

  const handleApproveCompanyAdAdmin = async (adId: string) => {
    const headers = getHeaders();
    if (!headers) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${API_URL}/advertising/${adId}/status`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'ACTIVE' }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al aprobar la promoción');
      setSuccess('¡Promoción de la empresa aprobada y publicada exitosamente en la plataforma!');
      void loadCompanyAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar la promoción');
    }
  };

  const handleRejectCompanyAdAdmin = async (adId: string) => {
    const headers = getHeaders();
    if (!headers) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${API_URL}/advertising/${adId}/status`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'INACTIVE' }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al desaprobar la promoción');
      setSuccess('Promoción de empresa desaprobada/desactivada correctamente.');
      void loadCompanyAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desaprobar la promoción');
    }
  };

  const promoFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePromoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen seleccionada supera el límite de 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPromoItemForm((prev) => ({
            ...prev,
            imageUrl: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sysCouponFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSysCouponFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen seleccionada supera el límite de 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCouponForm((prev) => ({
            ...prev,
            imageUrl: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePromoItem = (id: string) => {
    const newItems = promotionsForm.items.filter((it) => it.id !== id);
    setPromotionsForm((prev) => ({ ...prev, items: newItems }));
    void handleSavePromotionsPage(newItems);
  };

  // Branch / Map Admin State
  const [adminBranches, setAdminBranches] = useState<any[]>([]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({
    id: '',
    companyId: '',
    name: '',
    address: '',
    city: 'Ciudad de México',
    state: 'CDMX',
    latitude: '19.432608',
    longitude: '-99.133209',
    schedules: 'Lun - Dom: 09:00 - 22:00',
    categoryIds: [] as string[],
  });
  const [savingBranch, setSavingBranch] = useState(false);

  const loadAdminBranches = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/branches`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setAdminBranches(data);
      }
    } catch {
      // Silencioso
    }
  };

  const handleSaveBranchAdmin = async () => {
    const headers = getHeaders();
    if (
      !headers ||
      !branchForm.companyId ||
      !branchForm.name ||
      !branchForm.address
    ) {
      setError('Por favor completa los campos obligatorios de la sucursal');
      return;
    }
    setSavingBranch(true);
    setError(null);
    try {
      const isEdit = !!branchForm.id;
      const url = isEdit
        ? `${API_URL}/admin/branches/${branchForm.id}`
        : `${API_URL}/admin/branches`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...branchForm,
          latitude: parseFloat(branchForm.latitude) || 19.432608,
          longitude: parseFloat(branchForm.longitude) || -99.133209,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar sucursal');

      setSuccess(
        isEdit
          ? 'Sucursal actualizada con éxito'
          : 'Sucursal creada y ubicada en el mapa correctamente',
      );
      setShowBranchModal(false);
      loadAdminBranches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar sucursal',
      );
    } finally {
      setSavingBranch(false);
    }
  };

  const handleDeleteAdminBranch = async (id: string) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/branches/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setSuccess('Sucursal eliminada del mapa');
        loadAdminBranches();
      }
    } catch {
      setError('Error al eliminar sucursal');
    }
  };

  const handleSaveHeroSlide = async () => {
    const headers = getHeaders();
    if (!headers) return;
    setSavingHeroSlides(true);
    setError(null);
    try {
      const features = [
        heroForm.feature1,
        heroForm.feature2,
        heroForm.feature3,
        heroForm.feature4,
      ].filter(Boolean);

      const slideObj = {
        id: heroForm.id || `slide-${Date.now()}`,
        badgeText: heroForm.badgeText,
        title: heroForm.title,
        subtitle: heroForm.subtitle,
        bgImageUrl: heroForm.bgImageUrl,
        ctaText: heroForm.ctaText,
        ctaUrl: heroForm.ctaUrl,
        cardTitle: heroForm.cardTitle,
        cardSubtitle: heroForm.cardSubtitle,
        cardPrice: heroForm.cardPrice,
        features,
      };

      let updatedList = [...adminHeroSlides];
      const existingIdx = updatedList.findIndex((s) => s.id === slideObj.id);
      if (existingIdx >= 0) {
        updatedList[existingIdx] = slideObj;
      } else {
        updatedList.push(slideObj);
      }

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'HERO_SLIDES',
          value: JSON.stringify(updatedList),
          description: 'Slides configurados para la portada principal',
        }),
      });

      if (!res.ok) throw new Error('Error al guardar slides');

      setAdminHeroSlides(updatedList);
      setSuccess('Slide de portada guardado con éxito');
      setShowHeroModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar slide');
    } finally {
      setSavingHeroSlides(false);
    }
  };

  const handleDeleteHeroSlide = async (id: string) => {
    const headers = getHeaders();
    if (!headers) return;
    const updatedList = adminHeroSlides.filter((s) => s.id !== id);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'HERO_SLIDES',
          value: JSON.stringify(updatedList),
          description: 'Slides configurados para la portada principal',
        }),
      });
      if (res.ok) {
        setAdminHeroSlides(updatedList);
        setSuccess('Slide eliminado correctamente');
      }
    } catch {
      setError('Error al eliminar slide');
    }
  };

  const handleUpdateCardPrice = async () => {
    if (!editingCard) return;
    setUpdatingCardPrice(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${API_URL}/admin/virtual-cards/${editingCard.id}/price`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ price: parseFloat(editingCardPriceValue) }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Error al actualizar precio');

      setSuccess('Precio de la tarjeta actualizado con éxito');
      setEditingCard(null);
      void loadVirtualCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setUpdatingCardPrice(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!deletingCard) return;
    setIsDeletingCard(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${API_URL}/admin/virtual-cards/${deletingCard.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar tarjeta');

      setSuccess('Tarjeta eliminada correctamente');
      setDeletingCard(null);
      void loadVirtualCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setIsDeletingCard(false);
    }
  };

  const handleExportImage = useCallback(async () => {
    if (!cardRef.current || !previewCard) return;
    setExporting('image');
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `BONOW-Tarjeta-${previewCard.cardNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      setExporting(null);
    }
  }, [previewCard]);

  const handleExportPDF = useCallback(async () => {
    if (!cardRef.current || !previewCard) return;
    setExporting('pdf');
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL('image/png');
      const cardW = 85.6; // mm (credit card standard)
      const cardH = 53.98; // mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [cardW + 20, cardH + 20],
      });
      pdf.setFillColor(15, 15, 15);
      pdf.rect(0, 0, cardW + 20, cardH + 20, 'F');
      pdf.addImage(imgData, 'PNG', 10, 10, cardW, cardH);
      pdf.save(`BONOW-Tarjeta-${previewCard.cardNumber}.pdf`);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
    } finally {
      setExporting(null);
    }
  }, [previewCard]);

  const handlePrintCard = useCallback(async () => {
    if (!cardRef.current || !previewCard) return;
    setExporting('print');
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>BONOW - Tarjeta ${previewCard.cardNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f0f0f; }
              img { max-width: 90mm; border-radius: 12px; }
              @media print {
                body { background: white; }
                img { max-width: 85.6mm; border-radius: 8px; }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Tarjeta BONOW" />
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } catch (err) {
      console.error('Error al imprimir:', err);
    } finally {
      setExporting(null);
    }
  }, [previewCard]);

  const [deletingCategory, setDeletingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    icon: '',
  });
  const [newsForm, setNewsForm] = useState({
    id: '',
    title: '',
    content: '',
    author: '',
    status: 'DRAFT',
  });
  const [settingForm, setSettingForm] = useState({
    key: '',
    value: '',
    description: '',
  });

  // Admin Coupon Creator State
  const [adminCompany, setAdminCompany] = useState<any>(null);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    title: '',
    description: '',
    discount: '',
    imageUrl: '',
    type: 'SINGLE_USE' as 'SINGLE_USE' | 'REUSABLE',
    usageLimit: '',
    startDate: '',
    endDate: '',
    conditions: '',
    categoryId: '',
    categoryIds: [] as string[],
    branchIds: [] as string[],
    redemptionScope: 'ALL' as 'ALL' | 'SELECTED' | 'SPECIFIC',
    selectedCompanyIds: [] as string[],
    targetCompanyId: '',
  });

  const router = useRouter();

  const loadAdminCompany = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/companies/my-company`, {
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        setAdminCompany(data);
        if (data.branches && data.branches.length > 0) {
          setCouponForm((prev) => ({
            ...prev,
            branchIds: [data.branches[0].id],
          }));
        }
      }
    } catch {
      // Silencioso
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = getHeaders();
    if (!headers) return;

    const effectiveCategoryIds = couponForm.categoryIds.length > 0
      ? couponForm.categoryIds
      : (couponForm.categoryId ? [couponForm.categoryId] : []);

    if (effectiveCategoryIds.length === 0) {
      setError('Por favor selecciona al menos una categoría para el cupón.');
      return;
    }

    setSubmittingCoupon(true);
    setError(null);
    setSuccess(null);

    try {
      let finalConditions = couponForm.conditions || '';
      if (couponForm.redemptionScope === 'ALL') {
        finalConditions = `[COMPANIES:ALL] ${finalConditions}`.trim();
      } else if (couponForm.redemptionScope === 'SELECTED' && couponForm.selectedCompanyIds.length > 0) {
        finalConditions = `[COMPANIES:${couponForm.selectedCompanyIds.join(',')}] ${finalConditions}`.trim();
      }

      const payload = {
        ...couponForm,
        categoryId: effectiveCategoryIds[0],
        categoryIds: effectiveCategoryIds,
        conditions: finalConditions,
        targetCompanyId: couponForm.redemptionScope === 'SPECIFIC' ? couponForm.targetCompanyId : undefined,
        allowedCompanyIds: couponForm.redemptionScope === 'ALL' ? ['ALL'] : couponForm.selectedCompanyIds,
        usageLimit: couponForm.usageLimit
          ? parseInt(couponForm.usageLimit, 10)
          : undefined,
      };

      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('¡Cupón creado con éxito!');
        setCouponForm({
          title: '',
          description: '',
          discount: '',
          imageUrl: '',
          type: 'SINGLE_USE',
          usageLimit: '',
          startDate: '',
          endDate: '',
          conditions: '',
          categoryId: '',
          categoryIds: [],
          branchIds: adminCompany?.branches
            ? [adminCompany.branches[0].id]
            : [],
          redemptionScope: 'ALL',
          selectedCompanyIds: [],
          targetCompanyId: '',
        });
        setActiveTab('coupons');
      } else {
        setError(data.message || 'Error al crear el cupón');
      }
    } catch {
      setError('Error de red al crear el cupón');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadOverview = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers,
      });
      const data = await res.json();
      if (res.ok && isMounted) {
        setStats(data.stats);
        setRecentRedemptions(data.recentRedemptions);
        setRecentActivities(data.recentActivities || []);
      }
    } catch {
      if (isMounted) setError('Error al cargar métricas');
    }
  };

  const loadUsers = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/users?search=${search}&role=${roleFilter}&status=${statusFilter}&page=${page}&limit=10`,
        { headers },
      );
      const data = await res.json();
      if (res.ok && isMounted) {
        setUsers(data.items);
        setTotalPages(data.pages);
      }
    } catch {
      // Silencioso
    }
  };

  const loadCompanies = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/companies`, { headers });
      const data = await res.json();
      if (res.ok && isMounted) {
        const compList = Array.isArray(data) ? data : (data.items || data.companies || []);
        setCompanies(compList);
      }
    } catch {
      // Silencioso
    }
  };

  const loadCoupons = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/coupons?search=${search}&status=${statusFilter}&page=${page}&limit=10`,
        { headers },
      );
      const data = await res.json();
      if (res.ok && isMounted) {
        setCoupons(data.items);
        setTotalPages(data.pages);
      }
    } catch {
      // Silencioso
    }
  };

  const handleApproveCouponAdmin = async (couponId: string) => {
    const headers = getHeaders();
    if (!headers) return;
    setApprovingCouponId(couponId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${API_URL}/admin/coupons/${couponId}/approve`,
        { method: 'PUT', headers },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al aprobar cupón');
      setSuccess('¡Cupón aprobado y publicado exitosamente en la plataforma!');
      void loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar cupón');
    } finally {
      setApprovingCouponId(null);
    }
  };

  const handleConfirmRejectCouponAdmin = async () => {
    if (!rejectingCoupon || !rejectionReasonInput.trim()) {
      setError('Por favor ingresa el motivo del rechazo.');
      return;
    }
    const headers = getHeaders();
    if (!headers) return;
    setSubmittingRejection(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${API_URL}/admin/coupons/${rejectingCoupon.id}/reject`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ reason: rejectionReasonInput.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al rechazar cupón');
      setSuccess('Cupón rechazado correctamente.');
      setRejectingCoupon(null);
      setRejectionReasonInput('');
      void loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar cupón');
    } finally {
      setSubmittingRejection(false);
    }
  };

  const loadMemberships = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/memberships?search=${search}&status=${statusFilter}&page=${page}&limit=10`,
        { headers },
      );
      const data = await res.json();
      if (res.ok && isMounted) {
        setMemberships(data.items);
        setTotalPages(data.pages);
      }
    } catch {
      // Silencioso
    }
  };

  const loadPayments = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/payments?search=${search}&status=${statusFilter}&page=${page}&limit=10`,
        { headers },
      );
      const data = await res.json();
      if (res.ok && isMounted) {
        setPayments(data.items);
        setTotalPages(data.pages);
      }
    } catch {
      // Silencioso
    }
  };

  const loadCategories = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/categories`, {
        headers,
      });
      const data = await res.json();
      if (res.ok && isMounted) {
        setCategories(data);
      }
    } catch {
      // Silencioso
    }
  };

  const loadNews = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/news`, { headers });
      const data = await res.json();
      if (res.ok && isMounted) {
        setNews(data);
      }
    } catch {
      // Silencioso
    }
  };

  const loadSettings = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers,
      });
      const data = await res.json();
      if (res.ok && isMounted) {
        setSettings(data);
      }
    } catch {
      // Silencioso
    }
  };

  const loadVirtualCards = async (isMounted = true) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/virtual-cards?search=${search}&status=${statusFilter}&cardType=${cardTypeFilter}&page=${page}&limit=10`,
        { headers },
      );
      const data = await res.json();
      if (res.ok && isMounted) {
        setVirtualCards(data.items);
        setTotalPages(data.pages);
      }
    } catch {
      // Silencioso
    }
  };

  const handleGenerateCards = async (type: 'DIGITAL' | 'PHYSICAL') => {
    const headers = getHeaders();
    if (!headers) return;
    setGeneratingCards(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${API_URL}/admin/virtual-cards/generate`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            count: generateCount,
            cardType: type,
            price: parseFloat(cardPrice) || 0.0,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSuccess(
          data.message || `Se han generado ${generateCount} tarjetas.`,
        );
        loadVirtualCards();
        setShowGenerateDigitalModal(false);
        setShowGeneratePhysicalModal(false);
      } else {
        setError(data.message || 'Error al generar tarjetas');
      }
    } catch {
      setError('Error de red al generar tarjetas');
    } finally {
      setGeneratingCards(false);
    }
  };

  const loadCurrentTab = (isMounted = true) => {
    setError(null);
    setSelectedIds(new Set());
    if (activeTab === 'overview') void loadOverview(isMounted);
    else if (activeTab === 'users') void loadUsers(isMounted);
    else if (activeTab === 'companies') void loadCompanies(isMounted);
    else if (activeTab === 'coupons') void loadCoupons(isMounted);
    else if (activeTab === 'memberships') {
      void loadMemberships(isMounted);
      void loadMembershipPlansAdmin();
      void loadCreditPackagesAdmin();
    } else if (activeTab === 'payments') void loadPayments(isMounted);
    else if (activeTab === 'categories') void loadCategories(isMounted);
    else if (activeTab === 'news') void loadNews(isMounted);
    else if (activeTab === 'settings') void loadSettings(isMounted);
    else if (activeTab === 'virtualCards') void loadVirtualCards(isMounted);
    else if (activeTab === 'heroSlides') void loadHeroSlidesAdmin();
    else if (activeTab === 'aboutPage') void loadAboutPageAdmin();
    else if (activeTab === 'promotionsPage') {
      void loadPromotionsPageAdmin();
      void loadCompanyAds(isMounted);
    }
    else if (activeTab === 'mapBranches') {
      void loadAdminBranches();
      void loadCompanies(isMounted);
    } else if (activeTab === 'createCoupon') {
      void loadAdminCompany();
      void loadCategories(isMounted);
      void loadCompanies(isMounted);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoading(true);
      loadCurrentTab(isMounted);
      void loadCompanyAds(isMounted);
      if (isMounted) setLoading(false);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, search, roleFilter, statusFilter, cardTypeFilter]);

  // Bulk Actions
  const handleToggleSelectAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkUserStatus = async (status: string) => {
    const headers = getHeaders();
    if (!headers || selectedIds.size === 0) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/bulk-status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userIds: Array.from(selectedIds), status }),
      });
      if (res.ok) {
        setSuccess('Cuentas actualizadas correctamente en bloque');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al procesar acción masiva');
    }
  };

  const handleBulkCouponStatus = async (status: string) => {
    const headers = getHeaders();
    if (!headers || selectedIds.size === 0) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/coupons/bulk-status`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ couponIds: Array.from(selectedIds), status }),
        },
      );
      if (res.ok) {
        setSuccess('Cupones actualizados correctamente en bloque');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al procesar acción masiva');
    }
  };

  // User status updates
  const handleUserStatusUpdate = async (userId: string, status: string) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/users/${userId}/status`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        setSuccess('Estado del usuario actualizado');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al actualizar usuario');
    }
  };

  // Company approval
  const handleCompanyStatus = async (companyId: string, status: string) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/companies/${companyId}/status`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        setSuccess('Estado de la empresa actualizado');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al actualizar empresa');
    }
  };

  const handleToggleCompanyFeatured = async (companyId: string) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/companies/${companyId}/toggle-featured`,
        {
          method: 'PUT',
          headers,
        },
      );
      if (res.ok) {
        setSuccess('Estado destacado de la empresa actualizado');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al destacar empresa');
    }
  };

  const handleToggleAdFeatured = async (adId: string) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/advertising/${adId}/toggle-featured`,
        {
          method: 'PUT',
          headers,
        },
      );
      if (res.ok) {
        setSuccess('Estado destacado de la promoción actualizado');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al destacar promoción');
    }
  };

  // Refund Payment
  const handleRefund = async (paymentId: string) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/payments/${paymentId}/refund`,
        {
          method: 'POST',
          headers,
        },
      );
      if (res.ok) {
        setSuccess('Pago reembolsado correctamente');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al procesar reembolso');
    }
  };

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    status: string,
  ) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(
        `${API_URL}/admin/payments/${paymentId}/status`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        setSuccess(
          status === 'APPROVED'
            ? 'Pago APROBADO. Membresía del usuario activada correctamente.'
            : 'Estado de pago actualizado.',
        );
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al actualizar estado del pago');
    }
  };

  // Categories CRUD Actions
  const handleSaveCategory = async () => {
    const headers = getHeaders();
    if (!headers) return;
    const method = categoryForm.id ? 'PUT' : 'POST';
    const url = categoryForm.id
      ? `${API_URL}/admin/categories/${categoryForm.id}`
      : `${API_URL}/admin/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(categoryForm),
      });
      if (res.ok) {
        setSuccess('Categoría guardada con éxito');
        setShowCategoryModal(false);
        setCategoryForm({ id: '', name: '', icon: '' });
        loadCurrentTab(true);
        // Also reload categories for the coupon form
        void loadCategories(true);
      }
    } catch {
      setError('Error al guardar categoría');
    }
  };

  // Inline Category Creation (from coupon form)
  const handleSaveInlineCategory = async () => {
    if (!inlineCategoryName.trim()) return;
    const headers = getHeaders();
    if (!headers) return;
    setSavingInlineCategory(true);
    try {
      const res = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: inlineCategoryName.trim(),
          icon: inlineCategoryIcon.trim() || undefined,
        }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setSuccess(`Categoría "${inlineCategoryName}" creada con éxito`);
        setShowInlineCategoryModal(false);
        setInlineCategoryName('');
        setInlineCategoryIcon('');
        // Reload categories and auto-select the new one
        await loadCategories(true);
        setCouponForm((prev) => ({ ...prev, categoryId: newCat.id }));
      } else {
        const data = await res.json();
        setError(data.message || 'Error al crear la categoría');
      }
    } catch {
      setError('Error de red al crear categoría');
    } finally {
      setSavingInlineCategory(false);
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deletingCategory) return;
    const headers = getHeaders();
    if (!headers) return;
    setIsDeletingCategory(true);
    try {
      const res = await fetch(
        `${API_URL}/admin/categories/${deletingCategory.id}`,
        {
          method: 'DELETE',
          headers,
        },
      );
      if (res.ok) {
        setSuccess(`Categoría "${deletingCategory.name}" eliminada`);
        setDeletingCategory(null);
        loadCurrentTab(true);
        void loadCategories(true);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al eliminar categoría');
      }
    } catch {
      setError('Error al eliminar categoría');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // News CRUD Actions
  const handleSaveNews = async () => {
    const headers = getHeaders();
    if (!headers) return;
    const method = newsForm.id ? 'PUT' : 'POST';
    const url = newsForm.id
      ? `${API_URL}/admin/news/${newsForm.id}`
      : `${API_URL}/admin/news`;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(newsForm),
      });
      if (res.ok) {
        setSuccess('Artículo de noticias guardado');
        setShowNewsModal(false);
        setNewsForm({
          id: '',
          title: '',
          content: '',
          author: '',
          status: 'DRAFT',
        });
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al guardar artículo');
    }
  };

  const handleDeleteNews = async (id: string) => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/news/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setSuccess('Artículo eliminado');
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al eliminar');
    }
  };

  // Settings CRUD Actions
  const handleSaveSetting = async () => {
    const headers = getHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(settingForm),
      });
      if (res.ok) {
        setSuccess('Configuración actualizada con éxito');
        setShowSettingModal(false);
        setSettingForm({ key: '', value: '', description: '' });
        loadCurrentTab(true);
      }
    } catch {
      setError('Error al guardar configuración');
    }
  };

  // Export CSV Utility
  const handleExportCSV = (
    filename: string,
    headers: string[],
    rows: string[][],
  ) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Cabecera Principal */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-150 pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-zinc-100">
            Consola de Administración General
          </h1>
          <p className="text-sm text-gray-500">
            Control de usuarios, comercios, cupones, membresías, configuraciones
            y finanzas.
          </p>
        </div>
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

      {/* Tabs Horizontales Modernos */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'overview', label: 'Resumen', icon: TrendingUp },
          { id: 'users', label: 'Usuarios', icon: Users },
          { id: 'companies', label: 'Empresas', icon: Building2 },
          { id: 'coupons', label: 'Cupones', icon: Ticket },
          { id: 'virtualCards', label: 'Tarjetas', icon: CreditCard },
          { id: 'heroSlides', label: 'Portada & Slider', icon: FileImage },
          { id: 'createCoupon', label: 'Crear Cupón', icon: Plus },
          { id: 'memberships', label: 'Membresías', icon: Shield },
          { id: 'payments', label: 'Pagos', icon: CreditCard },
          { id: 'categories', label: 'Categorías', icon: Settings },
          { id: 'aboutPage', label: 'Página Nosotros', icon: Sparkles },
          { id: 'promotionsPage', label: 'Promociones', icon: Flame },
          { id: 'mapBranches', label: 'Mapa de Sucursales', icon: MapPin },
          { id: 'news', label: 'Noticias', icon: Megaphone },
          { id: 'settings', label: 'Configuración', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setPage(1);
                setSearch('');
                setRoleFilter('');
                setStatusFilter('');
              }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold shrink-0 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border border-violet-400/40 scale-[1.02]'
                  : 'bg-slate-900/90 border border-slate-800/90 text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 hover:border-slate-700 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-violet-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'promotionsPage' &&
                adminCompanyAds.filter((a) => a.status === 'INACTIVE').length > 0 && (
                  <span className="ml-1 rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider animate-pulse shadow-md">
                    {adminCompanyAds.filter((a) => a.status === 'INACTIVE').length} PENDIENTES
                  </span>
                )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW - EXECUTIVE FINANCIAL CONTROL CENTER */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 text-left">
              {/* HERO FINANCIAL BANNER - VAMOS GANANDO ESTE MES */}
              <div className="rounded-3xl bg-gradient-to-br from-zinc-950 via-slate-900 to-violet-950 p-6 md:p-8 text-white shadow-2xl border border-violet-900/40 relative overflow-hidden space-y-6">
                <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        FINANZAS & RENDIMIENTO GLOBAL PLATAFORMA
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 border border-violet-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-300">
                        ¡VAMOS GANANDO ESTE MES! <FontAwesomeIcon icon={faRocket} className="ml-1 text-violet-300" />
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-2">
                      <span>Balance Financiero Plataforma BONOW</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 font-medium max-w-xl">
                      Métricas ejecutivas consolidadas en tiempo real: ingresos por suscripciones de clientes, venta de créditos empresariales y rentabilidad.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">
                      Ingresos Totales del Mes
                    </span>
                    <div className="text-3xl font-black text-emerald-400 mt-0.5 font-mono">
                      ${(stats.totalEarningsMXN ?? 0).toLocaleString('es-MX')} <span className="text-xs text-slate-300">MXN</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-300 flex items-center justify-end gap-1 mt-1">
                      ↑ +24.8% <span className="text-slate-400 font-medium">rendimiento vs mes anterior</span>
                    </span>
                  </div>
                </div>

                {/* Sub-grid de Previsiones y Proyecciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faChartLine} className="text-amber-400" /> Proyección de Ingresos Mes Siguiente
                    </span>
                    <div className="text-xl font-black text-white font-mono">
                      ${Math.round((stats.totalEarningsMXN ?? 0) * 1.18).toLocaleString('es-MX')} MXN
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Calculado en base a tasa actual de renovaciones y empresas activas.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-300 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCreditCard} className="text-violet-400" /> Ingresos por Membresías de Usuarios
                    </span>
                    <div className="text-xl font-black text-white font-mono">
                      ${Math.round((stats.totalEarningsMXN ?? 0) * 0.55).toLocaleString('es-MX')} MXN
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {stats.totalMemberships ?? 0} miembros suscritos con planes BONOW+.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faBuilding} className="text-emerald-400" /> Ingresos por Paquetes de Créditos Empresas
                    </span>
                    <div className="text-xl font-black text-white font-mono">
                      ${Math.round((stats.totalEarningsMXN ?? 0) * 0.45).toLocaleString('es-MX')} MXN
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {stats.totalCompanies ?? 0} empresas publicando ofertas y promociones.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5 columns stats row */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {/* Card 1: Usuarios totales */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="bg-violet-50 dark:bg-violet-950/20 p-2.5 rounded-2xl text-violet-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        Usuarios totales
                      </span>
                      <span className="text-2xl font-black text-zinc-850 dark:text-white">
                        {stats.totalUsers ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                    ↑ 18.5%{' '}
                    <span className="text-zinc-400 font-medium">
                      vs. mes anterior
                    </span>
                  </span>
                </div>

                {/* Card 2: Usuarios activos */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-50 dark:bg-sky-950/20 p-2.5 rounded-2xl text-sky-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        Usuarios activos
                      </span>
                      <span className="text-2xl font-black text-zinc-850 dark:text-white">
                        {stats.activeUsers ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                    ↑ 16.3%{' '}
                    <span className="text-zinc-400 font-medium">
                      vs. mes anterior
                    </span>
                  </span>
                </div>

                {/* Card 3: Empresas registradas */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-2xl text-emerald-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        Empresas
                      </span>
                      <span className="text-2xl font-black text-zinc-850 dark:text-white">
                        {stats.totalCompanies ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                    ↑ 12.8%{' '}
                    <span className="text-zinc-400 font-medium">
                      vs. mes anterior
                    </span>
                  </span>
                </div>

                {/* Card 4: Cupones activos */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-2xl text-amber-600">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        Cupones activos
                      </span>
                      <span className="text-2xl font-black text-zinc-850 dark:text-white">
                        {stats.activeCoupons ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                    ↑ 14.7%{' '}
                    <span className="text-zinc-400 font-medium">
                      vs. mes anterior
                    </span>
                  </span>
                </div>

                {/* Card 5: Membresías activas */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-2xl text-rose-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        Membresías
                      </span>
                      <span className="text-2xl font-black text-zinc-850 dark:text-white">
                        {stats.totalMemberships ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                    ↑ 19.2%{' '}
                    <span className="text-zinc-400 font-medium">
                      vs. mes anterior
                    </span>
                  </span>
                </div>
              </div>

              {/* Ingresos del mes + Charts grid */}
              <div className="grid md:grid-cols-12 gap-6 items-stretch">
                {/* Lado Izquierdo: Ingresos chart */}
                <div className="md:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Ingresos del mes
                      </span>
                      <h3 className="text-2xl font-black text-zinc-850 dark:text-white mt-1">
                        ${(stats.totalEarningsMXN ?? 0).toLocaleString('es-MX')}{' '}
                        MXN
                      </h3>
                      <p className="text-[10px] text-emerald-600 font-black mt-0.5">
                        ↑ 20.5%{' '}
                        <span className="text-zinc-400 font-medium">
                          vs. mes anterior
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 border border-zinc-200 dark:border-zinc-850 rounded-xl px-2.5 py-1">
                      Mensual
                    </span>
                  </div>

                  <div className="h-44 w-full flex items-end justify-between pt-6">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 500 150"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chartGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#7c3aed"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#7c3aed"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>
                      <line
                        x1="0"
                        y1="30"
                        x2="500"
                        y2="30"
                        stroke="#f4f4f5"
                        strokeDasharray="4 4"
                        className="dark:stroke-zinc-800"
                      />
                      <line
                        x1="0"
                        y1="75"
                        x2="500"
                        y2="75"
                        stroke="#f4f4f5"
                        strokeDasharray="4 4"
                        className="dark:stroke-zinc-800"
                      />
                      <line
                        x1="0"
                        y1="120"
                        x2="500"
                        y2="120"
                        stroke="#f4f4f5"
                        strokeDasharray="4 4"
                        className="dark:stroke-zinc-800"
                      />

                      <path
                        d="M 0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 40 C 350 20, 400 60, 450 30 C 475 15, 500 20, 500 20 L 500 150 L 0 150 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M 0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 40 C 350 20, 400 60, 450 30 C 475 15, 500 20, 500 20"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="150"
                        cy="90"
                        r="4"
                        fill="#ffffff"
                        stroke="#7c3aed"
                        strokeWidth="2"
                      />
                      <circle
                        cx="300"
                        cy="40"
                        r="4"
                        fill="#ffffff"
                        stroke="#7c3aed"
                        strokeWidth="2"
                      />
                      <circle
                        cx="450"
                        cy="30"
                        r="4"
                        fill="#ffffff"
                        stroke="#7c3aed"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                {/* Lado Derecho: Distribución y plan */}
                <div className="md:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider mb-4">
                    Distribución de usuarios
                  </h3>
                  <div className="h-32 flex items-center justify-center mb-4">
                    <svg className="h-full aspect-square" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f4f4f5"
                        className="dark:stroke-zinc-800"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="3.5"
                        strokeDasharray="60 40"
                        strokeDashoffset="25"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="3.5"
                        strokeDasharray="25 75"
                        strokeDashoffset="-35"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3.5"
                        strokeDasharray="15 85"
                        strokeDashoffset="-60"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="11"
                        fill="#ffffff"
                        className="dark:fill-zinc-900"
                      />
                      <text
                        x="18"
                        y="20.5"
                        textAnchor="middle"
                        className="fill-zinc-850 dark:fill-white text-[6px] font-black font-sans"
                      >
                        85.4%
                      </text>
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-zinc-400 text-center">
                    <div>
                      <span className="block text-zinc-800 dark:text-white text-xs font-black">
                        90.1%
                      </span>
                      Activos
                    </div>
                    <div>
                      <span className="block text-zinc-800 dark:text-white text-xs font-black">
                        33.0%
                      </span>
                      Nuevos
                    </div>
                    <div>
                      <span className="block text-zinc-800 dark:text-white text-xs font-black">
                        16.9%
                      </span>
                      Inactivos
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividad en tiempo real y Alertas */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Membresías por plan */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Membresías por plan
                  </h3>
                  <div className="space-y-3.5">
                    {[
                      {
                        label: 'Mensual',
                        count: stats.plans?.monthly ?? 0,
                        pct: stats.totalMemberships
                          ? `${Math.round(((stats.plans?.monthly ?? 0) / stats.totalMemberships) * 100)}%`
                          : '0%',
                        color: 'bg-violet-600',
                      },
                      {
                        label: 'Trimestral',
                        count: stats.plans?.quarterly ?? 0,
                        pct: stats.totalMemberships
                          ? `${Math.round(((stats.plans?.quarterly ?? 0) / stats.totalMemberships) * 100)}%`
                          : '0%',
                        color: 'bg-indigo-650',
                      },
                      {
                        label: 'Semestral',
                        count: stats.plans?.semesterly ?? 0,
                        pct: stats.totalMemberships
                          ? `${Math.round(((stats.plans?.semesterly ?? 0) / stats.totalMemberships) * 100)}%`
                          : '0%',
                        color: 'bg-sky-500',
                      },
                      {
                        label: 'Anual',
                        count: stats.plans?.annual ?? 0,
                        pct: stats.totalMemberships
                          ? `${Math.round(((stats.plans?.annual ?? 0) / stats.totalMemberships) * 100)}%`
                          : '0%',
                        color: 'bg-emerald-500',
                      },
                    ].map((plan) => (
                      <div
                        key={plan.label}
                        className="space-y-1.5 text-xs text-left"
                      >
                        <div className="flex justify-between font-bold">
                          <span className="text-zinc-700 dark:text-zinc-350">
                            {plan.label}
                          </span>
                          <span className="text-zinc-550">
                            {plan.count} ({plan.pct})
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${plan.color}`}
                            style={{ width: plan.pct }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actividad en tiempo real */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Actividad en tiempo real
                  </h3>
                  <div className="space-y-3 text-xs">
                    {recentActivities.length === 0 ? (
                      <p className="text-zinc-400 text-center py-4">
                        No hay actividad reciente.
                      </p>
                    ) : (
                      recentActivities.map((act, i) => (
                        <div
                          key={i}
                          className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2 last:border-0 last:pb-0 text-left animate-in fade-in"
                        >
                          <div>
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">
                              {act.text}
                            </p>
                            <span className="text-[10px] text-zinc-400">
                              {act.desc}
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-450 shrink-0 self-start">
                            {new Date(act.time).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Alertas del sistema */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Alertas del sistema
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-950/20 rounded-2xl text-left">
                      <h4 className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase">
                        Membresías por vencer
                      </h4>
                      <p className="text-[9px] text-zinc-550 dark:text-zinc-450 mt-0.5">
                        125 membresías vencen en los próximos 7 días.
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-950/20 rounded-2xl text-left">
                      <h4 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase">
                        Empresas pendientes
                      </h4>
                      <p className="text-[9px] text-zinc-550 dark:text-zinc-450 mt-0.5">
                        8 empresas en espera de aprobación de contratos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas y Estadísticas Rápidas */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Últimas Redenciones
                  </h3>
                  <div className="space-y-3.5">
                    {recentRedemptions.slice(0, 4).map((red) => (
                      <div
                        key={red.id}
                        className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-850 pb-2.5 last:border-0 last:pb-0 text-left"
                      >
                        <div>
                          <p className="font-bold text-zinc-800 dark:text-zinc-250">
                            {red.user.firstName} {red.user.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {red.coupon.title} —{' '}
                            <span className="font-bold text-violet-650">
                              {red.coupon.company.name}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-450">
                          {new Date(red.redeemedAt).toLocaleDateString(
                            'es-MX',
                            {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Acciones rápidas */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                    <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                      Acciones rápidas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('coupons');
                        }}
                        className="py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-[10px] font-black uppercase text-zinc-850 dark:text-zinc-250 hover:bg-zinc-100 transition"
                      >
                        + Nuevo cupón
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('companies');
                        }}
                        className="py-3.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-[10px] font-black uppercase text-zinc-850 dark:text-zinc-250 hover:bg-zinc-100 transition"
                      >
                        + Nueva empresa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USUARIOS */}
          {activeTab === 'users' && (
            <div className="space-y-6 text-left">
              {/* Controles de Búsqueda y Filtros */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-indigo-950/70 p-5 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
                <div className="flex flex-1 gap-3 max-w-lg">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-violet-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o correo..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-2xl border border-slate-700/60 bg-slate-950/80 py-2.5 px-4 text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
                  >
                    <option value="" className="bg-slate-900 text-slate-300">Todos los Roles</option>
                    <option value="USER" className="bg-slate-900 text-slate-300">Usuario (USER)</option>
                    <option value="BUSINESS" className="bg-slate-900 text-slate-300">Comercio (BUSINESS)</option>
                    <option value="ADMIN" className="bg-slate-900 text-slate-300">Administrador (ADMIN)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const headers = [
                        'ID',
                        'Email',
                        'Nombre',
                        'Estado',
                        'Ciudad',
                        'Creado',
                      ];
                      const rows = users.map((u) => [
                        u.id,
                        u.email,
                        `${u.firstName} ${u.lastName}`,
                        u.status,
                        u.city || '',
                        new Date(u.createdAt).toLocaleDateString(),
                      ]);
                      handleExportCSV('usuarios_bonow', headers, rows);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-violet-400/30 px-4 py-2.5 text-xs font-bold shadow-md shadow-violet-950/50 hover:shadow-violet-600/30 transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4 text-violet-200" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Acciones Masivas */}
              {selectedIds.size > 0 && (
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-950/60 via-indigo-950/50 to-purple-950/60 p-4 border border-violet-800/50 shadow-lg backdrop-blur-md">
                  <span className="text-xs font-bold text-violet-300 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
                    {selectedIds.size} usuario(s) seleccionado(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void handleBulkUserStatus('ACTIVE')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Activar en Bloque
                    </button>
                    <button
                      onClick={() => void handleBulkUserStatus('SUSPENDED')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      Suspender en Bloque
                    </button>
                  </div>
                </div>
              )}

              {/* Tabla de Usuarios Rediseñada */}
              <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-2xl backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/80 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left w-12">
                          <input
                            type="checkbox"
                            checked={
                              users.length > 0 &&
                              users.every((u) => selectedIds.has(u.id))
                            }
                            onChange={() =>
                              handleToggleSelectAll(users.map((u) => u.id))
                            }
                            className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-950"
                          />
                        </th>
                        <th className="px-6 py-4 text-left">Usuario</th>
                        <th className="px-6 py-4 text-left">Roles</th>
                        <th className="px-6 py-4 text-left">Estado</th>
                        <th className="px-6 py-4 text-left">Ubicación</th>
                        <th className="px-6 py-4 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {users.map((u) => {
                        const initials = `${u.firstName?.charAt(0) || ''}${u.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
                        const isAdmin = u.roles.some((r) => r.name === 'ADMIN');
                        const isBusiness = u.roles.some((r) => r.name === 'BUSINESS');

                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-slate-900/70 transition-all duration-150 group"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(u.id)}
                                onChange={() => handleToggleSelect(u.id)}
                                className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-950"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md border border-violet-400/30 shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                                    {u.firstName} {u.lastName}
                                  </p>
                                  <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {u.roles.map((r) => {
                                  const roleName = r.name;
                                  let badgeClass = 'bg-violet-500/15 border-violet-500/30 text-violet-300';
                                  if (roleName === 'ADMIN') {
                                    badgeClass = 'bg-amber-500/15 border-amber-500/30 text-amber-300';
                                  } else if (roleName === 'BUSINESS') {
                                    badgeClass = 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300';
                                  }

                                  return (
                                    <span
                                      key={r.name}
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border shadow-xs ${badgeClass}`}
                                    >
                                      {r.name}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xs ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    u.status === 'ACTIVE'
                                      ? 'bg-emerald-400 animate-pulse'
                                      : 'bg-rose-400'
                                  }`}
                                />
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                              {u.city || u.state ? `${u.city || ''}${u.city && u.state ? ', ' : ''}${u.state || ''}` : 'No especificada'}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  void handleUserStatusUpdate(
                                    u.id,
                                    u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                                  )
                                }
                                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border ${
                                  u.status === 'ACTIVE'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-600 hover:text-white'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                                }`}
                              >
                                {u.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">
                    Mostrando página <strong className="text-white">{page}</strong> de <strong className="text-white">{totalPages}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="rounded-xl border border-slate-700/80 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-violet-600 hover:border-violet-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:text-slate-200 disabled:hover:border-slate-700/80"
                    >
                      Anterior
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="rounded-xl border border-slate-700/80 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-violet-600 hover:border-violet-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:text-slate-200 disabled:hover:border-slate-700/80"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EMPRESAS */}
          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-zinc-950">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Empresa</th>
                      <th className="px-6 py-4 text-left">RFC / Razón</th>
                      <th className="px-6 py-4 text-left">Contacto</th>
                      <th className="px-6 py-4 text-left">Estado</th>
                      <th className="px-6 py-4 text-left">Inicio</th>
                      <th className="px-6 py-4 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850">
                    {companies
                      .filter(
                        (c) =>
                          c.name.toUpperCase() !== 'BONOW' &&
                          c.name.toUpperCase() !== 'WYNNI' &&
                          !c.corporateName?.toUpperCase().includes('BONOW'),
                      )
                      .map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-zinc-200">
                          <div className="flex items-center gap-2">
                            <span>{c.name}</span>
                            {c.isFeatured && (
                              <span className="bg-amber-400/20 text-amber-500 border border-amber-400/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 fill-amber-500" /> DESTACADA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-550 dark:text-gray-400">
                          <p>{c.rfc}</p>
                          <p className="text-[10px] text-gray-400">
                            {c.corporateName}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <p>{c.email}</p>
                          <p>{c.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              c.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : c.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              void handleToggleCompanyFeatured(c.id)
                            }
                            className={`rounded-xl px-3 py-1.5 font-black text-xs transition flex items-center gap-1.5 cursor-pointer ${
                              c.isFeatured
                                ? 'bg-amber-400 text-zinc-950 shadow-md hover:bg-amber-500'
                                : 'bg-zinc-800 text-amber-400 border border-amber-500/40 hover:bg-zinc-700'
                            }`}
                            title={c.isFeatured ? 'Quitar de Empresas Destacadas en Inicio' : 'Mostrar en Empresas Destacadas en Inicio'}
                          >
                            <Star className={`h-3.5 w-3.5 ${c.isFeatured ? 'fill-zinc-950' : ''}`} />
                            <span>{c.isFeatured ? '★ Destacada' : '☆ Destacar'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAdminCompanyDetail(c);
                              setShowAdminCompanyDetailModal(true);
                            }}
                            className="rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 hover:bg-violet-200 px-3 py-1.5 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Ver expedientes y datos completos de la empresa"
                          >
                            <Eye className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            <span>Ver Info</span>
                          </button>
                          {c.status === 'PENDING' && (
                            <button
                              onClick={() =>
                                void handleCompanyStatus(c.id, 'APPROVED')
                              }
                              className="rounded-xl bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 font-bold cursor-pointer"
                            >
                              Aprobar
                            </button>
                          )}
                          {c.status === 'APPROVED' && (
                            <button
                              onClick={() =>
                                void handleCompanyStatus(c.id, 'SUSPENDED')
                              }
                              className="rounded-xl bg-red-50 text-red-650 hover:bg-red-100 px-3 py-1.5 font-bold cursor-pointer"
                            >
                              Suspender
                            </button>
                          )}
                          {c.status === 'SUSPENDED' && (
                            <button
                              onClick={() =>
                                void handleCompanyStatus(c.id, 'APPROVED')
                              }
                              className="rounded-xl bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 font-bold cursor-pointer"
                            >
                              Habilitar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUPONES */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              {/* Filtros de Estado de Cupones */}
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-gray-200 dark:border-gray-800">
                <span className="text-xs font-black uppercase text-gray-400 mr-2">
                  Filtrar por Estado:
                </span>
                {[
                  { key: '', label: 'Todos' },
                  { key: 'PENDING', label: '⏳ Pendientes de Aprobación' },
                  { key: 'ACTIVE', label: '✓ Aprobados / Activos' },
                  { key: 'REJECTED', label: '✕ Rechazados' },
                  { key: 'INACTIVE', label: '⚪ Inactivos' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => {
                      setStatusFilter(st.key);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      statusFilter === st.key
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                        : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Acciones Masivas */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2.5 rounded-2xl bg-violet-50 p-4 dark:bg-violet-950/20">
                  <span className="text-xs font-bold text-violet-700 dark:text-violet-400">
                    {selectedIds.size} seleccionados:
                  </span>
                  <button
                    onClick={() => void handleBulkCouponStatus('ACTIVE')}
                    className="inline-flex items-center gap-1 rounded-xl bg-green-100 px-3 py-1.5 text-[10px] font-bold text-green-700 hover:bg-green-200 transition"
                  >
                    Activar en Bloque
                  </button>
                  <button
                    onClick={() => void handleBulkCouponStatus('INACTIVE')}
                    className="inline-flex items-center gap-1 rounded-xl bg-red-100 px-3 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-200 transition"
                  >
                    Desactivar en Bloque
                  </button>
                </div>
              )}

              {/* Tabla de Cupones con Aprobación/Rechazo */}
              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-zinc-950">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            coupons.length > 0 &&
                            coupons.every((c) => selectedIds.has(c.id))
                          }
                          onChange={() =>
                            handleToggleSelectAll(coupons.map((c) => c.id))
                          }
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-4 text-left">Cupón</th>
                      <th className="px-6 py-4 text-left">Empresa</th>
                      <th className="px-6 py-4 text-left">Categoría</th>
                      <th className="px-6 py-4 text-left">Estado</th>
                      <th className="px-6 py-4 text-center">Acciones / Aprobación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No se encontraron cupones con el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      coupons.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/60 transition">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(c.id)}
                              onChange={() => handleToggleSelect(c.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-6 py-4 space-y-0.5">
                            <p className="font-bold text-gray-800 dark:text-zinc-200 text-xs">
                              {c.title}
                            </p>
                            <p className="text-violet-600 font-bold text-[11px]">
                              {c.discount}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold">
                            {c.company?.name || 'Comercio'}
                          </td>
                          <td className="px-6 py-4 text-gray-400">
                            {c.category?.name || 'Categoría'}
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            {c.status === 'PENDING' && (
                              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-1 text-[10px] font-black uppercase inline-block border border-amber-300/40">
                                ⏳ Pendiente
                              </span>
                            )}
                            {c.status === 'ACTIVE' && (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-black uppercase inline-block border border-emerald-300/40">
                                ✓ Aprobado
                              </span>
                            )}
                            {c.status === 'REJECTED' && (
                              <div>
                                <span className="rounded-full bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 text-[10px] font-black uppercase inline-block border border-red-300/40">
                                  ✕ Rechazado
                                </span>
                                {c.rejectionReason && (
                                  <p className="text-[10px] text-red-600 dark:text-red-400 italic mt-0.5 max-w-xs line-clamp-2">
                                    "{c.rejectionReason}"
                                  </p>
                                )}
                              </div>
                            )}
                            {c.status === 'INACTIVE' && (
                              <span className="rounded-full bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 text-[10px] font-black uppercase inline-block">
                                Inactivo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Botón APROBAR */}
                              {c.status !== 'ACTIVE' && (
                                <button
                                  disabled={approvingCouponId === c.id}
                                  onClick={() => void handleApproveCouponAdmin(c.id)}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[10px] font-black uppercase transition shadow-sm cursor-pointer disabled:opacity-50"
                                  title="Aprobar y Publicar Cupón"
                                >
                                  {approvingCouponId === c.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  )}
                                  <span>Aprobar</span>
                                </button>
                              )}

                              {/* Botón RECHAZAR */}
                              {c.status !== 'REJECTED' && (
                                <button
                                  onClick={() => {
                                    setRejectingCoupon(c);
                                    setRejectionReasonInput('');
                                  }}
                                  className="inline-flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[10px] font-black uppercase transition shadow-sm cursor-pointer"
                                  title="Rechazar Cupón e ingresar motivo"
                                >
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  <span>Rechazar</span>
                                </button>
                              )}

                              {/* Botón VISTA */}
                              <button
                                onClick={() => setPreviewCoupon(c)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition cursor-pointer"
                                title="Ver detalles del cupón"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MEMBRESÍAS */}
          {activeTab === 'memberships' && (
            <div className="space-y-8 text-left">
              {/* Sección 1: Configuración de Tarifas y Planes Comerciales */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-600 animate-pulse" />
                      Gestión de Tarifas & Planes Comerciales (
                      {adminMembershipPlans.length})
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Edita los precios, títulos, descripciones y beneficios que
                      ven los clientes al contratar o renovar su membresía.
                    </p>
                  </div>
                </div>

                {/* Grid 3D de Tarjetas de Planes */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {adminMembershipPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="group relative bg-gradient-to-b from-white via-violet-50/20 to-fuchsia-50/20 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 border border-violet-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300 flex flex-col justify-between space-y-5"
                    >
                      {plan.badge && (
                        <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-[9px] font-black uppercase text-white shadow-md shadow-violet-600/20">
                          {plan.badge}
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                            {plan.name}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[32px]">
                            {plan.description}
                          </p>
                        </div>

                        <div className="border-t border-zinc-150/80 dark:border-zinc-850 pt-3">
                          <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                            ${plan.price}
                          </span>
                          <span className="text-xs font-bold text-zinc-400 ml-1.5">
                            {plan.period}
                          </span>
                        </div>

                        {/* Beneficios */}
                        {plan.features && plan.features.length > 0 && (
                          <ul className="space-y-1.5 pt-2 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
                            {plan.features
                              .slice(0, 4)
                              .map((feat: string, fIdx: number) => (
                                <li
                                  key={fIdx}
                                  className="flex items-center gap-1.5"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                                  <span className="line-clamp-1">{feat}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setMembershipForm({
                            id: plan.id,
                            type: plan.type || plan.id.toUpperCase(),
                            name: plan.name,
                            price: String(plan.price),
                            period: plan.period,
                            durationDays: plan.durationDays || 30,
                            description: plan.description || '',
                            badge: plan.badge || '',
                            feature1: plan.features?.[0] || '',
                            feature2: plan.features?.[1] || '',
                            feature3: plan.features?.[2] || '',
                            feature4: plan.features?.[3] || '',
                          });
                          setShowMembershipModal(true);
                        }}
                        className="w-full inline-flex justify-center items-center gap-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 px-4 text-xs font-black text-white hover:from-violet-500 hover:to-fuchsia-500 transition shadow-md shadow-violet-600/20 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar Plan & Tarifa</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 1.5: Configuración de Paquetes de Créditos para Empresas (Sin Membresía) */}
              <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-rose-500" />
                      Precios de Créditos de Cupones (Empresas Sin Membresía)
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Configura el precio de los paquetes de 5, 10 y 20 cupones para empresas sin membresía pagada.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      void loadCreditPackagesAdmin();
                      setShowCreditPackagesModal(true);
                    }}
                    className="shrink-0 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-2.5 text-xs font-black text-white hover:opacity-95 transition shadow-lg shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Precios de Créditos
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {adminCreditPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-3 shadow-sm hover:shadow-md transition text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                          {pkg.credits} Cupones
                        </span>
                        {pkg.popular && (
                          <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-black text-zinc-900 dark:text-white">
                        {pkg.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {pkg.description}
                      </p>
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                          ${pkg.price}
                        </span>
                        <span className="text-xs font-bold text-zinc-500">MXN</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 2: Historial de Membresías Activas de Usuarios */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                  Membresías Asignadas a Usuarios ({memberships.length})
                </h3>
                <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-zinc-950">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold">
                      <tr>
                        <th className="px-6 py-4 text-left">Usuario</th>
                        <th className="px-6 py-4 text-left">Tipo de Plan</th>
                        <th className="px-6 py-4 text-left">Vigencia</th>
                        <th className="px-6 py-4 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-gray-850">
                      {memberships.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-gray-800 dark:text-zinc-200">
                            {m.user.firstName} {m.user.lastName} ({m.user.email}
                            )
                          </td>
                          <td className="px-6 py-4 text-violet-700 dark:text-violet-400 font-bold">
                            {m.type}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(m.startDate).toLocaleDateString()} al{' '}
                            {new Date(m.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                m.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PAGOS */}
          {activeTab === 'payments' && (
            <div className="space-y-6 text-left">
              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-zinc-950">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">ID Transacción</th>
                      <th className="px-6 py-4 text-left">Usuario</th>
                      <th className="px-6 py-4 text-left">Concepto / Plan</th>
                      <th className="px-6 py-4 text-left">Monto</th>
                      <th className="px-6 py-4 text-left">Proveedor</th>
                      <th className="px-6 py-4 text-left">Estado</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono font-bold text-gray-600 dark:text-zinc-300">
                          {p.providerTxId || p.id}
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-zinc-200">
                          <span className="font-bold block">
                            {p.user.firstName} {p.user.lastName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {p.user.email}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            💳 Membresía {p.planType || 'SUSCRIPCIÓN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-zinc-100 font-black">
                          ${parseFloat(p.amount).toFixed(2)}{' '}
                          {p.currency || 'MXN'}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-medium">
                          {p.provider}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              p.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                : p.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {p.status === 'PENDING' && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  void handleUpdatePaymentStatus(
                                    p.id,
                                    'APPROVED',
                                  )
                                }
                                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 font-bold text-[10px] transition shadow-md shadow-emerald-600/20 cursor-pointer"
                                title="Aprobar pago y activar membresía"
                              >
                                ✓ Aprobar
                              </button>
                              <button
                                onClick={() =>
                                  void handleUpdatePaymentStatus(
                                    p.id,
                                    'REJECTED',
                                  )
                                }
                                className="rounded-xl bg-zinc-100 text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 px-2.5 py-1.5 font-bold text-[10px] transition cursor-pointer"
                                title="Rechazar pago"
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                          {p.status === 'APPROVED' && (
                            <button
                              onClick={() => void handleRefund(p.id)}
                              className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 font-bold text-[10px] transition cursor-pointer"
                            >
                              Reembolso
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: CATEGORÍAS */}
          {activeTab === 'categories' && (
            <div className="space-y-6 text-left">
              {/* Header de Gestión de Categorías */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-600 animate-pulse" />
                    Catálogo Oficial de Categorías ({categories.length})
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Administra las categorías de ofertas disponibles para los
                    usuarios en la plataforma.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCategoryForm({ id: '', name: '', icon: '' });
                    setShowCategoryModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-2.5 text-xs font-black text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-lg shadow-violet-600/25 shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Nueva Categoría</span>
                </button>
              </div>

              {/* Grid de Tarjetas de Categorías Modernas 3D */}
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="group bg-gradient-to-b from-white via-violet-50/20 to-fuchsia-50/20 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 border border-violet-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 shrink-0 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/20">
                        {renderCategoryIconAdmin(cat.icon, cat.name)}
                      </div>
                      <span className="rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-2.5 py-0.5 text-[9px] font-mono font-bold">
                        {cat.slug}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-base text-zinc-900 dark:text-white uppercase tracking-wide">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Categoría Activa
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-zinc-150/80 dark:border-zinc-850">
                      <button
                        onClick={() => {
                          setCategoryForm({
                            id: cat.id,
                            name: cat.name,
                            icon: cat.icon || '',
                          });
                          setShowCategoryModal(true);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400 py-2 text-xs font-bold transition"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="inline-flex justify-center items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-3 py-2 text-xs font-bold transition"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: NOTICIAS */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setNewsForm({
                      id: '',
                      title: '',
                      content: '',
                      author: '',
                      status: 'DRAFT',
                    });
                    setShowNewsModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-755 transition shadow-lg shadow-violet-600/10"
                >
                  <Plus className="h-4 w-4" />
                  Publicar Novedad
                </button>
              </div>

              <div className="space-y-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            item.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Por {item.author || 'BONOW'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 dark:text-zinc-150">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setNewsForm({
                            id: item.id,
                            title: item.title,
                            content: item.content,
                            author: item.author || '',
                            status: item.status,
                          });
                          setShowNewsModal(true);
                        }}
                        className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-55 dark:border-gray-850"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDeleteNews(item.id)}
                        className="rounded-xl bg-red-50 p-2 text-red-650 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: CONFIGURACIÓN */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSettingForm({ key: '', value: '', description: '' });
                    setShowSettingModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-755 transition shadow-lg shadow-violet-600/10"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Configuración
                </button>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-zinc-950">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Clave (Key)</th>
                      <th className="px-6 py-4 text-left">Valor</th>
                      <th className="px-6 py-4 text-left">Descripción</th>
                      <th className="px-6 py-4 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-gray-850">
                    {settings.map((set) => (
                      <tr key={set.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono font-bold text-violet-700 dark:text-violet-400">
                          {set.key}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-zinc-150">
                          {set.value}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {set.description}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSettingForm({
                                key: set.key,
                                value: set.value,
                                description: set.description || '',
                              });
                              setShowSettingModal(true);
                            }}
                            className="text-gray-500 hover:text-violet-650"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: TARJETAS VIRTUALES */}
          {activeTab === 'virtualCards' && (
            <div className="space-y-6 text-left">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Administración de Tarjetas del Sistema
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450">
                    Pre-genera y administra los códigos para tarjetas 100%
                    digitales o tarjetas físicas impresas.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                  <button
                    onClick={() => {
                      setGenerateCount(10);
                      setShowGenerateDigitalModal(true);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-violet-600/10 transition"
                  >
                    <FontAwesomeIcon icon={faGlobe} className="text-white" />
                    <span>Crear Digitales</span>
                  </button>
                  <button
                    onClick={() => {
                      setGenerateCount(10);
                      setShowGeneratePhysicalModal(true);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-amber-600/10 transition"
                  >
                    <FontAwesomeIcon icon={faCreditCard} className="text-white" />
                    <span>Crear Físicas</span>
                  </button>
                </div>
              </div>

              {/* Buscador de tarjetas */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-zinc-450" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por número de tarjeta o correo del usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-2xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={cardTypeFilter}
                    onChange={(e) => setCardTypeFilter(e.target.value)}
                    className="rounded-2xl border border-zinc-200 bg-white py-2 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="DIGITAL">Solo Digitales</option>
                    <option value="PHYSICAL">Solo Físicas</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-2xl border border-zinc-200 bg-white py-2 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none"
                  >
                    <option value="">Todos los estados</option>
                    <option value="AVAILABLE">Disponibles (AVAILABLE)</option>
                    <option value="REGISTERED">Registradas (REGISTERED)</option>
                  </select>
                </div>
              </div>

              {/* Listado de tarjetas (Diseño Moderno & Vibrante) */}
              <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-md">
                <table className="min-w-full text-xs">
                  <thead className="bg-gradient-to-r from-violet-900/10 via-indigo-900/5 to-purple-900/10 dark:from-zinc-900 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Número de Tarjeta</th>
                      <th className="px-6 py-4 text-left">Tipo & Precio</th>
                      <th className="px-6 py-4 text-left">Estado</th>
                      <th className="px-6 py-4 text-left">
                        Propietario / Registro
                      </th>
                      <th className="px-6 py-4 text-left">Fecha Creación</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                    {virtualCards.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-zinc-450 font-medium"
                        >
                          No se encontraron tarjetas.
                        </td>
                      </tr>
                    ) : (
                      virtualCards.map((card) => (
                        <tr
                          key={card.id}
                          className="hover:bg-violet-50/30 dark:hover:bg-zinc-900/60 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-violet-900 dark:text-violet-300">
                            {card.cardNumber}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                  card.cardType === 'PHYSICAL'
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-400/30'
                                    : 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-400/30'
                                }`}
                              >
                                {card.cardType === 'PHYSICAL' ? (
                                  <>
                                    <FontAwesomeIcon icon={faCreditCard} className="mr-0.5" /> FÍSICA
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faGlobe} className="mr-0.5" /> DIGITAL
                                  </>
                                )}
                              </span>
                              {card.price !== undefined && (
                                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                                  ${Number(card.price).toFixed(2)} MXN
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                                card.status === 'REGISTERED'
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30 shadow-sm'
                                  : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30'
                              }`}
                            >
                              ●{' '}
                              {card.status === 'REGISTERED'
                                ? 'VENDIDA / REGISTRADA'
                                : 'DISPONIBLE'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {card.user ? (
                              <div className="space-y-0.5">
                                <p className="font-bold text-zinc-800 dark:text-zinc-200">
                                  {card.user.firstName} {card.user.lastName}
                                </p>
                                <p className="text-[10px] text-zinc-450 font-mono">
                                  {card.user.email}
                                </p>
                                {card.registeredAt && (
                                  <p className="text-[9px] text-zinc-400">
                                    Registrada:{' '}
                                    {new Date(
                                      card.registeredAt,
                                    ).toLocaleDateString('es-MX')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-400 font-medium text-[11px]">
                                Sin usuario asignado
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-zinc-450">
                            {new Date(card.createdAt).toLocaleDateString(
                              'es-MX',
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Botón Ver Tarjeta 👁️ */}
                              <button
                                onClick={() => setPreviewCard(card)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:hover:bg-violet-900/60 transition-all duration-200 hover:scale-105"
                                title="Ver tarjeta"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {/* Botón Editar Precio ✏️ */}
                              {card.status === 'AVAILABLE' ? (
                                <button
                                  onClick={() => {
                                    setEditingCard(card);
                                    setEditingCardPriceValue(
                                      card.price !== undefined
                                        ? card.price.toString()
                                        : '90',
                                    );
                                  }}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 transition-all duration-200 hover:scale-105"
                                  title="Editar precio de la tarjeta"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed"
                                  title="Tarjeta vendida / registrada (No se puede editar el precio)"
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Botón Eliminar Tarjeta 🗑️ */}
                              {card.status === 'AVAILABLE' ? (
                                <button
                                  onClick={() => setDeletingCard(card)}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-all duration-200 hover:scale-105"
                                  title="Eliminar tarjeta"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed"
                                  title="Tarjeta vendida / registrada (No se puede eliminar)"
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación simple */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-zinc-500">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 13: PÁGINA NOSOTROS */}
          {activeTab === 'aboutPage' && (
            <div className="space-y-6 text-left">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-600 animate-pulse" />
                    Gestor de Contenido: Página "Nosotros"
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Edita el texto, subtítulo, cifras de impacto y pilares
                    informativos que visualizan todos los usuarios en la página
                    pública de Nosotros.
                  </p>
                </div>

                <button
                  onClick={() => void handleSaveAboutPage()}
                  disabled={savingAboutPage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-xs font-black uppercase text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingAboutPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Guardar Cambios</span>
                </button>
              </div>

              {/* Formulario de Contenido */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Sección 1: Encabezado Hero */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    1. Encabezado Hero & Misión
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">
                      Badge / Insignia Superior
                    </label>
                    <input
                      type="text"
                      value={aboutForm.heroTag}
                      onChange={(e) =>
                        setAboutForm({ ...aboutForm, heroTag: e.target.value })
                      }
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">
                      Título Principal (H1)
                    </label>
                    <input
                      type="text"
                      value={aboutForm.title}
                      onChange={(e) =>
                        setAboutForm({ ...aboutForm, title: e.target.value })
                      }
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-bold outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">
                      Subtítulo / Misión Institucional
                    </label>
                    <textarea
                      rows={4}
                      value={aboutForm.subtitle}
                      onChange={(e) =>
                        setAboutForm({ ...aboutForm, subtitle: e.target.value })
                      }
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-violet-500 resize-none"
                    />
                  </div>
                </div>

                {/* Sección 2: Cifras de Impacto */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    2. Cifras & Estadísticas de Impacto
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">
                        Stat 1 (Valor & Etiqueta)
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat1Value}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat1Value: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs font-black"
                      />
                      <input
                        type="text"
                        value={aboutForm.stat1Label}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat1Label: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-[10px] text-zinc-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">
                        Stat 2 (Valor & Etiqueta)
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat2Value}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat2Value: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs font-black"
                      />
                      <input
                        type="text"
                        value={aboutForm.stat2Label}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat2Label: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-[10px] text-zinc-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">
                        Stat 3 (Valor & Etiqueta)
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat3Value}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat3Value: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs font-black"
                      />
                      <input
                        type="text"
                        value={aboutForm.stat3Label}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat3Label: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-[10px] text-zinc-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">
                        Stat 4 (Valor & Etiqueta)
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat4Value}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat4Value: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs font-black"
                      />
                      <input
                        type="text"
                        value={aboutForm.stat4Label}
                        onChange={(e) =>
                          setAboutForm({
                            ...aboutForm,
                            stat4Label: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-[10px] text-zinc-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Pilares Informativos */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  3. Pilares Institucionales de la Empresa
                </h4>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <label className="text-[10px] font-bold text-violet-600 uppercase block">
                      Pilar 1
                    </label>
                    <input
                      type="text"
                      value={aboutForm.pillar1Title}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          pillar1Title: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-bold"
                    />
                    <textarea
                      rows={3}
                      value={aboutForm.pillar1Desc}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          pillar1Desc: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-600 dark:text-zinc-400 resize-none"
                    />
                  </div>

                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <label className="text-[10px] font-bold text-violet-600 uppercase block">
                      Pilar 2
                    </label>
                    <input
                      type="text"
                      value={aboutForm.pillar2Title}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          pillar2Title: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-bold"
                    />
                    <textarea
                      rows={3}
                      value={aboutForm.pillar2Desc}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          pillar2Desc: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-600 dark:text-zinc-400 resize-none"
                    />
                  </div>

                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <label className="text-[10px] font-bold text-violet-600 uppercase block">
                      Pilar 3
                    </label>
                    <input
                      type="text"
                      value={aboutForm.pillar3Title}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          pillar3Title: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-bold"
                    />
                    <textarea
                      rows={3}
                      value={aboutForm.pillar3Desc}
                      onChange={(e) =>
                        setAboutForm({
                          ...aboutForm,
                          pillar3Desc: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-600 dark:text-zinc-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: PROMOCIONES */}
          {activeTab === 'promotionsPage' && (
            <div className="space-y-8 text-left">
              {/* SECCIÓN DE APROBACIÓN DE PROMOCIONES DE EMPRESAS */}
              <div className="space-y-4 bg-gradient-to-r from-[#0F1E36] to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                      <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
                      Promociones de Empresas Enviadas a Revisión ({adminCompanyAds.filter((a) => a.status === 'INACTIVE').length} Pendientes)
                    </h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      Revisa y aprueba las promociones enviadas por empresas registradas para que se publiquen en la app.
                    </p>
                  </div>

                  {adminCompanyAds.filter((a) => a.status === 'INACTIVE').length > 0 && (
                    <span className="self-start md:self-auto rounded-full bg-amber-400 text-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-slate-950" /> Requieren tu Aprobación
                    </span>
                  )}
                </div>

                {adminCompanyAds.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-slate-400 text-xs font-semibold">
                    No se han registrado solicitudes de promociones de empresa aún.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {adminCompanyAds.map((ad) => (
                      <div
                        key={ad.id}
                        className={`bg-white dark:bg-zinc-900 border-2 ${
                          ad.status === 'INACTIVE'
                            ? 'border-amber-400/80 shadow-amber-500/10'
                            : 'border-emerald-500/80'
                        } rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between text-slate-900 dark:text-white`}
                      >
                        <div className="space-y-3">
                          {ad.imageUrl && (
                            <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-zinc-950">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ad.imageUrl}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2">
                                {ad.status === 'ACTIVE' ? (
                                  <span className="rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[9px] font-black uppercase shadow-md flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Publicado y Activo
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[9px] font-black uppercase shadow-md flex items-center gap-1">
                                    ⏳ Pendiente Aprobación
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                              {ad.company?.logoUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={ad.company.logoUrl}
                                  alt={ad.company?.name || 'Empresa'}
                                  className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-[9px] shrink-0">
                                  {ad.company?.name?.substring(0, 2).toUpperCase() || 'EM'}
                                </div>
                              )}
                              <span className="text-[11px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider truncate">
                                {ad.company?.name || 'Empresa Aliada'}
                              </span>
                            </div>

                            <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase leading-snug pt-1">
                              {ad.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium">
                              {ad.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>Enviado: {ad.createdAt?.substring(0, 10)}</span>
                            {ad.isFeatured && (
                              <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-black">
                                ★ Destacada en Inicio
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => void handleToggleAdFeatured(ad.id)}
                              className={`w-full inline-flex items-center justify-center gap-1.5 rounded-2xl py-2 text-xs font-black uppercase transition shadow-md cursor-pointer ${
                                ad.isFeatured
                                  ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              <Star className={`h-4 w-4 ${ad.isFeatured ? 'fill-zinc-950' : 'text-amber-400'}`} />
                              <span>{ad.isFeatured ? '★ Destacada en Inicio' : '☆ Destacar en Inicio'}</span>
                            </button>

                            <div className="flex gap-2">
                              {ad.status !== 'ACTIVE' ? (
                                <button
                                  onClick={() => void handleApproveCompanyAdAdmin(ad.id)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-black uppercase transition shadow-md cursor-pointer"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Aprobar</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => void handleRejectCompanyAdAdmin(ad.id)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white py-2 text-xs font-black uppercase transition shadow-md cursor-pointer"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Desactivar</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                    Gestor de Contenido: Módulo "Promociones"
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Crea y administra los banners y la lista de promociones
                    exclusivas 2x1 que ven todos los usuarios en la sección
                    Promociones.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setPromoItemForm({
                        id: '',
                        title: '',
                        companyName: '',
                        category: 'Restaurantes',
                        discount: '2X1',
                        description: '',
                        imageUrl: '',
                      });
                      setShowPromoModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 text-zinc-950 px-5 py-3 text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Nueva Promoción</span>
                  </button>

                  <button
                    onClick={() => void handleSavePromotionsPage()}
                    disabled={savingPromotionsPage}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-xs font-black uppercase text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {savingPromotionsPage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>Guardar Banner</span>
                  </button>
                </div>
              </div>

              {/* Banner Hero Config */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">
                  Configuración del Banner Superior Promociones
                </h4>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">
                      Insignia Superior (Tag)
                    </label>
                    <input
                      type="text"
                      value={promotionsForm.heroTag}
                      onChange={(e) =>
                        setPromotionsForm({
                          ...promotionsForm,
                          heroTag: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">
                      Título Principal del Banner
                    </label>
                    <input
                      type="text"
                      value={promotionsForm.title}
                      onChange={(e) =>
                        setPromotionsForm({
                          ...promotionsForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">
                      Insignia de la Tarjeta Derecha
                    </label>
                    <input
                      type="text"
                      value={promotionsForm.cardBadge}
                      onChange={(e) =>
                        setPromotionsForm({
                          ...promotionsForm,
                          cardBadge: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">
                    Descripción Larga del Banner
                  </label>
                  <input
                    type="text"
                    value={promotionsForm.subtitle}
                    onChange={(e) =>
                      setPromotionsForm({
                        ...promotionsForm,
                        subtitle: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Lista de Promociones Creadas por Admin */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Promociones Activas en Plataforma (
                  {promotionsForm.items.length})
                </h4>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {promotionsForm.items.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[9px] font-black uppercase">
                            {p.discount}
                          </span>
                          <span className="rounded-full bg-violet-50 text-violet-700 px-2.5 py-0.5 text-[9px] font-bold uppercase">
                            {p.category}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase block">
                            {p.companyName}
                          </span>
                          <h5 className="font-bold text-sm text-zinc-900 dark:text-white">
                            {p.title}
                          </h5>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => {
                            const updated = promotionsForm.items.map((item) =>
                              item.id === p.id ? { ...item, isFeatured: !item.isFeatured } : item,
                            );
                            setPromotionsForm((prev) => ({ ...prev, items: updated }));
                            void handleSavePromotionsPage(updated);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase inline-flex items-center gap-1 transition cursor-pointer ${
                            p.isFeatured
                              ? 'bg-amber-500 text-zinc-950 hover:bg-amber-600'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${p.isFeatured ? 'fill-zinc-950 text-zinc-950' : 'text-amber-500'}`} />
                          <span>{p.isFeatured ? '★ Destacada' : '☆ Destacar'}</span>
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPromoItemForm({ ...p });
                              setShowPromoModal(true);
                            }}
                            className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePromoItem(p.id)}
                            className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 15: MAPA DE SUCURSALES */}
          {activeTab === 'mapBranches' && (
            <div className="space-y-6 text-left">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-violet-600 animate-pulse" />
                    Gestor de Sucursales & Geolocalización (
                    {adminBranches.length})
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Registra y posiciona en Google Maps las direcciones de las
                    sucursales aliadas para que los clientes las encuentren en
                    su mapa.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const defaultComp = companies[0]?.id || '';
                    setBranchForm({
                      id: '',
                      companyId: defaultComp,
                      name: '',
                      address: '',
                      city: 'Ciudad de México',
                      state: 'CDMX',
                      latitude: '19.432608',
                      longitude: '-99.133209',
                      schedules: 'Lun - Dom: 09:00 - 22:00',
                      categoryIds: [],
                    });
                    setShowBranchModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-xs font-black uppercase text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Agregar Sucursal al Mapa</span>
                </button>
              </div>

              {/* Tabla / Tarjetas de Sucursales */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {adminBranches.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-violet-400 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 px-2.5 py-0.5 text-[10px] font-black uppercase flex items-center gap-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-violet-500" /> {b.city || 'CDMX'}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-400">
                          {b.latitude?.toFixed(4)}, {b.longitude?.toFixed(4)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-violet-600 uppercase block">
                          {b.company?.name || 'Comercio Aliado'}
                        </span>
                        <h4 className="font-black text-sm text-zinc-900 dark:text-white">
                          {b.name}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          {b.address}
                        </p>
                      </div>

                      {b.schedules && (
                        <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                          <FontAwesomeIcon icon={faClock} className="text-zinc-400" /> {b.schedules}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faMapMarkedAlt} /> Ver en Google Maps ↗
                      </a>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBranchForm({
                              id: b.id,
                              companyId: b.companyId,
                              name: b.name,
                              address: b.address,
                              city: b.city || 'Ciudad de México',
                              state: b.state || 'CDMX',
                              latitude: b.latitude
                                ? b.latitude.toString()
                                : '19.432608',
                              longitude: b.longitude
                                ? b.longitude.toString()
                                : '-99.133209',
                              schedules:
                                b.schedules || 'Lun - Dom: 09:00 - 22:00',
                              categoryIds: b.categories
                                ? b.categories.map((c: any) => c.id)
                                : [],
                            });
                            setShowBranchModal(true);
                          }}
                          className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleDeleteAdminBranch(b.id)}
                          className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: PORTADA & CAROUSEL */}
          {activeTab === 'heroSlides' && (
            <div className="space-y-6 text-left">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Gestión de Portada & Carousel Hero
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450">
                    Administra los banners y slides dinámicos que se muestran en
                    el carrusel de la página de inicio.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setHeroForm({
                      id: '',
                      badgeText: '⚡ CLUB DE DESCUENTOS #1 DE MÉXICO',
                      title: 'DESCUBRE.\nAHORRA.\nDISFRUTA.',
                      subtitle:
                        'Accede a descuentos exclusivos en los mejores restaurantes, tiendas, servicios y entretenimiento de México.',
                      bgImageUrl: '/img/fondo1.jpg',
                      ctaText: 'Explorar Descuentos',
                      ctaUrl: '/coupons',
                      cardTitle: 'ÚNETE A BONOW+',
                      cardSubtitle:
                        'Accede a beneficios exclusivos todos los días',
                      cardPrice: 'Desde $99 MXN / mes',
                      feature1: 'Descuentos exclusivos en CDMX y todo México',
                      feature2: 'Nuevas promociones cargadas cada día',
                      feature3:
                        'Cancelación sin plazos forzosos cuando quieras',
                      feature4: 'Miles de negocios aliados participantes',
                    });
                    setShowHeroModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 px-5 text-xs font-black text-white hover:from-violet-500 hover:to-fuchsia-500 transition shadow-lg shadow-violet-600/20 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Agregar Slide / Imagen de Portada</span>
                </button>
              </div>

              {/* Grid de slides actuales */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {adminHeroSlides.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <p className="font-bold text-sm">
                      No hay slides personalizados guardados aún.
                    </p>
                    <p className="text-xs mt-1 text-zinc-500">
                      Se muestran las portadas por defecto. Haz clic en "+
                      Agregar Slide" para personalizar.
                    </p>
                  </div>
                ) : (
                  adminHeroSlides.map((slide, idx) => (
                    <div
                      key={slide.id || idx}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col justify-between"
                    >
                      <div className="relative h-40 overflow-hidden bg-zinc-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.bgImageUrl || '/img/fondo1.jpg'}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-4 flex flex-col justify-between text-white">
                          <span className="self-start rounded-full bg-violet-600/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
                            Slide #{idx + 1}
                          </span>
                          <div>
                            <span className="text-[10px] text-amber-300 font-black block">
                              {slide.badgeText}
                            </span>
                            <h4 className="text-sm font-black uppercase line-clamp-1">
                              {slide.title.replace(/\n/g, ' ')}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                          {slide.subtitle}
                        </p>

                        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-1">
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">
                            Tarjeta Derecha:{' '}
                            <span className="text-zinc-800 dark:text-zinc-200 font-black">
                              {slide.cardTitle}
                            </span>
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                            {slide.cardPrice}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-zinc-150 dark:border-zinc-850">
                          <button
                            onClick={() => {
                              setHeroForm({
                                id: slide.id,
                                badgeText: slide.badgeText || '',
                                title: slide.title || '',
                                subtitle: slide.subtitle || '',
                                bgImageUrl: slide.bgImageUrl || '',
                                ctaText: slide.ctaText || '',
                                ctaUrl: slide.ctaUrl || '',
                                cardTitle: slide.cardTitle || '',
                                cardSubtitle: slide.cardSubtitle || '',
                                cardPrice: slide.cardPrice || '',
                                feature1: slide.features?.[0] || '',
                                feature2: slide.features?.[1] || '',
                                feature3: slide.features?.[2] || '',
                                feature4: slide.features?.[3] || '',
                              });
                              setShowHeroModal(true);
                            }}
                            className="flex-1 inline-flex justify-center items-center gap-1 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400 py-2 text-xs font-bold transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => void handleDeleteHeroSlide(slide.id)}
                            className="inline-flex justify-center items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-3 py-2 text-xs font-bold transition"
                            title="Eliminar slide"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 12: CREAR CUPÓN (ADMIN) */}
          {activeTab === 'createCoupon' && (
            <div className="space-y-6 text-left max-w-4xl mx-auto animate-in fade-in duration-200">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
                  <h3 className="text-lg font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Crear Nuevo Cupón del Sistema (BONOW)
                  </h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550 mt-1">
                    Crea una oferta o descuento centralizado. Este cupón se
                    vinculará a la empresa matriz de la plataforma.
                  </p>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                          Título del Cupón
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.title}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="Ej: 20% de descuento en toda la tienda"
                          className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                          Descripción
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={couponForm.description}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe qué incluye la oferta, restricciones generales, etc."
                          className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                          Valor de Descuento
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.discount}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              discount: e.target.value,
                            })
                          }
                          placeholder="Ej: 20% OFF o $100 de Descuento"
                          className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                          Imagen del Cupón (Opcional)
                        </label>
                        <input
                          type="file"
                          ref={sysCouponFileInputRef}
                          accept="image/*"
                          onChange={handleSysCouponFileSelect}
                          className="hidden"
                        />

                        {couponForm.imageUrl ? (
                          <div className="relative mt-2 h-36 w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group">
                            <img
                              src={couponForm.imageUrl}
                              alt="Portada Cupón"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  sysCouponFileInputRef.current?.click()
                                }
                                className="rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-xs font-bold shadow hover:bg-zinc-100 transition cursor-pointer"
                              >
                                Cambiar Imagen
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCouponForm((prev) => ({
                                    ...prev,
                                    imageUrl: '',
                                  }))
                                }
                                className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-bold shadow hover:bg-red-500 transition cursor-pointer"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              sysCouponFileInputRef.current?.click()
                            }
                            className="mt-2 border-2 border-dashed border-violet-300 dark:border-violet-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-violet-500 bg-violet-50/30 dark:bg-violet-950/10 transition group"
                          >
                            <div className="h-10 w-10 rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center mb-1 group-hover:scale-110 transition duration-300">
                              <Upload className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                              Subir Imagen desde PC / Celular
                            </span>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              Haz clic para seleccionar fotos de tu galería o
                              archivos
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                          Condiciones y Términos (opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={couponForm.conditions}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              conditions: e.target.value,
                            })
                          }
                          placeholder="Ej: No aplica con otras promociones. Válido un uso por usuario."
                          className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                              Tipo de Cupón
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setShowCouponTypeInfo(!showCouponTypeInfo)
                              }
                              className="text-[9px] font-bold text-violet-500 hover:text-violet-700 transition"
                            >
                              ¿Qué es esto?
                            </button>
                          </div>
                          {showCouponTypeInfo && (
                            <div className="mt-1 mb-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/30 text-[10px] text-violet-700 dark:text-violet-300 space-y-1">
                              <p className="font-bold">
                                📌 Tipos de Cupón disponibles:
                              </p>
                              <p>
                                • <strong>Un solo uso (SINGLE_USE)</strong> — El
                                usuario puede canjearlo una sola vez. Ideal para
                                ofertas exclusivas.
                              </p>
                              <p>
                                • <strong>Reutilizable (REUSABLE)</strong> — El
                                usuario puede canjearlo múltiples veces hasta
                                que expire o alcance el límite.
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowCouponTypeInfo(false)}
                                className="text-[9px] font-bold text-violet-500 hover:underline mt-1"
                              >
                                Cerrar
                              </button>
                            </div>
                          )}
                          <select
                            value={couponForm.type}
                            onChange={(e) =>
                              setCouponForm({
                                ...couponForm,
                                type: e.target.value as any,
                              })
                            }
                            className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3 text-xs dark:border-zinc-850 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                          >
                            <option value="SINGLE_USE">
                              Un solo uso (SINGLE_USE)
                            </option>
                            <option value="REUSABLE">
                              Reutilizable (REUSABLE)
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                            Límite de Usos (opcional)
                          </label>
                          <input
                            type="number"
                            value={couponForm.usageLimit}
                            onChange={(e) =>
                              setCouponForm({
                                ...couponForm,
                                usageLimit: e.target.value,
                              })
                            }
                            placeholder="Ej: 100"
                            className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                            Fecha de Inicio
                          </label>
                          <input
                            type="date"
                            required
                            value={couponForm.startDate}
                            onChange={(e) =>
                              setCouponForm({
                                ...couponForm,
                                startDate: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450">
                            Fecha de Vencimiento
                          </label>
                          <input
                            type="date"
                            required
                            value={couponForm.endDate}
                            onChange={(e) =>
                              setCouponForm({
                                ...couponForm,
                                endDate: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450 flex items-center gap-1">
                            <Tag className="h-3 w-3 text-violet-500" />
                            <span>Categorías del Cupón (Selecciona 1 o más)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowInlineCategoryModal(true)}
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-500 hover:text-violet-700 transition"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Nueva Categoría</span>
                          </button>
                        </div>

                        {/* Badges de Categorías Seleccionadas */}
                        <div className="mt-1.5 flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40">
                          {couponForm.categoryIds.length === 0 ? (
                            <span className="text-[11px] text-zinc-400 self-center px-1 font-medium italic">
                              -- Ninguna categoría seleccionada. Selecciona una abajo --
                            </span>
                          ) : (
                            couponForm.categoryIds.map((catId) => {
                              const catObj = categories.find((c) => c.id === catId);
                              return (
                                <span
                                  key={catId}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-bold shadow-sm animate-in fade-in zoom-in duration-150"
                                >
                                  <span><FontAwesomeIcon icon={faTag} className="mr-1 text-violet-200" /> {catObj ? catObj.name : catId}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextIds = couponForm.categoryIds.filter((id) => id !== catId);
                                      setCouponForm({
                                        ...couponForm,
                                        categoryIds: nextIds,
                                        categoryId: nextIds[0] || '',
                                      });
                                    }}
                                    className="hover:bg-violet-700 p-0.5 rounded-full transition cursor-pointer"
                                  >
                                    <X className="h-3 w-3 text-violet-200 hover:text-white" />
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>

                        {/* Selector para añadir más categorías */}
                        <div className="mt-2">
                          <select
                            value=""
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              if (selectedId && !couponForm.categoryIds.includes(selectedId)) {
                                const nextIds = [...couponForm.categoryIds, selectedId];
                                setCouponForm({
                                  ...couponForm,
                                  categoryIds: nextIds,
                                  categoryId: nextIds[0],
                                });
                              }
                            }}
                            className="block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs dark:border-zinc-850 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                          >
                            <option value="">+ Selecciona para agregar una categoría...</option>
                            {categories
                              .filter((cat) => !couponForm.categoryIds.includes(cat.id))
                              .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                          <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                            <FontAwesomeIcon icon={faLightbulb} className="text-amber-400" /> Puedes seleccionar múltiples categorías. El cupón aparecerá en todas las categorías elegidas.
                          </p>
                        </div>
                      </div>

                      {/* SELECTOR DE EMPRESAS AUTORIZADAS PARA CANJEAR */}
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-violet-500" />
                            <span>¿En qué empresas se puede canjear este cupón?</span>
                          </label>
                        </div>

                        <div className="space-y-2 text-xs">
                          <label className="flex items-center gap-2.5 font-bold cursor-pointer text-zinc-800 dark:text-zinc-200">
                            <input
                              type="radio"
                              name="redemptionScope"
                              value="ALL"
                              checked={couponForm.redemptionScope === 'ALL'}
                              onChange={() =>
                                setCouponForm({
                                  ...couponForm,
                                  redemptionScope: 'ALL',
                                })
                              }
                              className="accent-violet-600"
                            />
                            <span><FontAwesomeIcon icon={faGlobe} className="mr-1 text-sky-400" /> Válido en TODAS las Empresas Registradas de la Plataforma</span>
                          </label>

                          <label className="flex items-center gap-2.5 font-bold cursor-pointer text-zinc-800 dark:text-zinc-200">
                            <input
                              type="radio"
                              name="redemptionScope"
                              value="SELECTED"
                              checked={couponForm.redemptionScope === 'SELECTED'}
                              onChange={() => {
                                setCouponForm({
                                  ...couponForm,
                                  redemptionScope: 'SELECTED',
                                });
                                if (companies.length === 0) loadCompanies();
                              }}
                              className="accent-violet-600"
                            />
                            <span><FontAwesomeIcon icon={faBuilding} className="mr-1 text-indigo-400" /> Válido en Empresas Seleccionadas (Marcar lista)</span>
                          </label>

                          <label className="flex items-center gap-2.5 font-bold cursor-pointer text-zinc-800 dark:text-zinc-200">
                            <input
                              type="radio"
                              name="redemptionScope"
                              value="SPECIFIC"
                              checked={couponForm.redemptionScope === 'SPECIFIC'}
                              onChange={() => {
                                setCouponForm({
                                  ...couponForm,
                                  redemptionScope: 'SPECIFIC',
                                });
                                if (companies.length === 0) loadCompanies();
                              }}
                              className="accent-violet-600"
                            />
                            <span><FontAwesomeIcon icon={faBullseye} className="mr-1 text-rose-400" /> Publicar a nombre de una Empresa Específica</span>
                          </label>
                        </div>

                        {/* Si se elige Empresas Seleccionadas */}
                        {couponForm.redemptionScope === 'SELECTED' && (
                          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 max-h-48 overflow-y-auto">
                            <span className="text-[10px] font-black uppercase text-zinc-400 block">
                              Selecciona las empresas autorizadas:
                            </span>
                            {companies.length === 0 ? (
                              <p className="text-xs text-zinc-400">No hay empresas registradas.</p>
                            ) : (
                              companies.map((comp) => {
                                const isChecked = couponForm.selectedCompanyIds.includes(
                                  comp.id,
                                );
                                return (
                                  <label
                                    key={comp.id}
                                    className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setCouponForm({
                                            ...couponForm,
                                            selectedCompanyIds: [
                                              ...couponForm.selectedCompanyIds,
                                              comp.id,
                                            ],
                                          });
                                        } else {
                                          setCouponForm({
                                            ...couponForm,
                                            selectedCompanyIds:
                                              couponForm.selectedCompanyIds.filter(
                                                (id) => id !== comp.id,
                                              ),
                                          });
                                        }
                                      }}
                                      className="accent-violet-600 rounded"
                                    />
                                    <span>
                                      {comp.name}{' '}
                                      {comp.corporateName
                                        ? `(${comp.corporateName})`
                                        : ''}
                                    </span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        )}

                        {/* Si se elige Empresa Específica */}
                        {couponForm.redemptionScope === 'SPECIFIC' && (
                          <div className="mt-3 space-y-1">
                            <span className="text-[10px] font-black uppercase text-zinc-400 block">
                              Selecciona la Empresa Emisora:
                            </span>
                            <select
                              value={couponForm.targetCompanyId}
                              onChange={(e) =>
                                setCouponForm({
                                  ...couponForm,
                                  targetCompanyId: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs dark:border-zinc-850 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500 font-bold"
                            >
                              <option value="">-- Selecciona la Empresa --</option>
                              {companies.map((comp) => (
                                <option key={comp.id} value={comp.id}>
                                  {comp.name}{' '}
                                  {comp.corporateName
                                    ? `(${comp.corporateName})`
                                    : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('coupons')}
                      className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 py-2.5 px-5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCoupon}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-violet-600/10 transition disabled:opacity-50"
                    >
                      {submittingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>
                        {submittingCoupon ? 'Creando...' : 'Crear Cupón'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Categorías */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                {categoryForm.id ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nombre
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Ej: Entretenimiento"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Icono (Clave Lucide)
                </label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, icon: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Ej: Film"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSaveCategory()}
                disabled={!categoryForm.name}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-3 text-xs font-black text-white hover:from-violet-500 hover:to-fuchsia-500 transition shadow-lg shadow-violet-600/30 disabled:opacity-40 cursor-pointer"
              >
                Guardar Categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Noticias */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                {newsForm.id ? 'Editar Noticia' : 'Nueva Noticia'}
              </h3>
              <button
                onClick={() => setShowNewsModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Título
                </label>
                <input
                  type="text"
                  value={newsForm.title}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Contenido
                </label>
                <textarea
                  value={newsForm.content}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, content: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={newsForm.author}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, author: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Estado
                  </label>
                  <select
                    value={newsForm.status}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, status: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-955"
                  >
                    <option value="DRAFT">Borrador (DRAFT)</option>
                    <option value="PUBLISHED">Publicado (PUBLISHED)</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() => void handleSaveNews()}
              disabled={!newsForm.title || !newsForm.content}
              className="w-full rounded-2xl bg-violet-650 py-2.5 text-xs font-bold text-white hover:bg-violet-750 transition"
            >
              Guardar Artículo
            </button>
          </div>
        </div>
      )}

      {/* Modal: Configuración */}
      {showSettingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100">
                Configuración
              </h3>
              <button
                onClick={() => setShowSettingModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Clave (Key)
                </label>
                <input
                  type="text"
                  value={settingForm.key}
                  disabled={!!settingForm.key}
                  onChange={(e) =>
                    setSettingForm({ ...settingForm, key: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white disabled:opacity-50"
                  placeholder="Ej: MEMBERSHIP_PRICE_MXN"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Valor
                </label>
                <input
                  type="text"
                  value={settingForm.value}
                  onChange={(e) =>
                    setSettingForm({ ...settingForm, value: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Ej: 149.00"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descripción
                </label>
                <input
                  type="text"
                  value={settingForm.description}
                  onChange={(e) =>
                    setSettingForm({
                      ...settingForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs dark:border-gray-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Ej: Costo mensual de la suscripción digital"
                />
              </div>
            </div>
            <button
              onClick={() => void handleSaveSetting()}
              disabled={!settingForm.key || !settingForm.value}
              className="w-full rounded-2xl bg-violet-650 py-2.5 text-xs font-bold text-white hover:bg-violet-755 transition"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* Modal: Generar Tarjetas Digitales */}
      {showGenerateDigitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-850 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <h3 className="text-base font-black text-zinc-850 dark:text-zinc-100 uppercase tracking-wider">
                  Generar Tarjetas Digitales
                </h3>
              </div>
              <button
                onClick={() => setShowGenerateDigitalModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 text-left">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Estas tarjetas se generarán directamente en el sistema y tendrán
                el prefijo oficial{' '}
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                  BONOW-DIG-
                </span>
                .
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Cantidad a Generar
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={generateCount}
                    onChange={(e) =>
                      setGenerateCount(
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Precio Mensual ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cardPrice}
                    onChange={(e) => setCardPrice(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => void handleGenerateCards('DIGITAL')}
              disabled={generatingCards}
              className="w-full rounded-2xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/15"
            >
              {generatingCards ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span>Generar Tarjetas Digitales</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Generar Tarjetas Físicas */}
      {showGeneratePhysicalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-850 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <h3 className="text-base font-black text-zinc-850 dark:text-zinc-100 uppercase tracking-wider">
                  Generar Tarjetas Físicas
                </h3>
              </div>
              <button
                onClick={() => setShowGeneratePhysicalModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 text-left">
              <p className="text-xs text-zinc-550 dark:text-zinc-400">
                Estas tarjetas están destinadas a ser impresas físicamente por
                un proveedor de credenciales. Se generarán en el sistema con el
                prefijo especial{' '}
                <span className="font-mono font-bold text-amber-600 dark:text-amber-450">
                  BONOW-PHY-
                </span>{' '}
                para su fácil reconocimiento.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Cantidad a Generar
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={generateCount}
                    onChange={(e) =>
                      setGenerateCount(
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Precio Mensual ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cardPrice}
                    onChange={(e) => setCardPrice(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => void handleGenerateCards('PHYSICAL')}
              disabled={generatingCards}
              className="w-full rounded-2xl bg-amber-650 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/15"
            >
              {generatingCards ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span>Generar Tarjetas Físicas</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Vista Previa de Tarjeta Premium */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="w-full max-w-lg animate-in zoom-in-95 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setPreviewCard(null)}
                className="rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* La Tarjeta */}
            <div
              ref={cardRef}
              className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl ${
                previewCard.cardType === 'PHYSICAL'
                  ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600'
                  : 'bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800'
              }`}
              style={{ aspectRatio: '1.586/1' }}
            >
              {/* Patrón decorativo de fondo */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
              </div>
              {/* Líneas holográficas */}
              <div className="absolute inset-0 opacity-[0.07]">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
                    style={{
                      top: `${12 + i * 12}%`,
                      transform: `rotate(${-2 + i * 0.5}deg)`,
                    }}
                  />
                ))}
              </div>

              {/* Contenido de la tarjeta */}
              <div className="relative z-10 flex h-full flex-col justify-between">
                {/* Header: Logo + tipo + Wifi */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-wider drop-shadow-lg">
                      BONOW
                    </h3>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.25em] mt-0.5">
                      Club de Descuentos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider backdrop-blur-sm ${
                        previewCard.cardType === 'PHYSICAL'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {previewCard.cardType === 'PHYSICAL'
                        ? '💳 Física'
                        : '🌐 Digital'}
                    </span>
                    <Wifi className="h-5 w-5 text-white/50 rotate-90" />
                  </div>
                </div>

                {/* Chip EMV */}
                <div className="flex items-center gap-4 my-3">
                  <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-yellow-300/90 via-yellow-400/80 to-yellow-600/70 shadow-inner border border-yellow-400/30 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-px">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-2.5 rounded-[1px] bg-yellow-700/30"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Número de tarjeta */}
                <div>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                    Número de Tarjeta
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-black text-white tracking-[0.15em] font-mono drop-shadow-md">
                      {previewCard.cardNumber}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(previewCard.cardNumber);
                        setCardCopied(true);
                        setTimeout(() => setCardCopied(false), 2000);
                      }}
                      className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition"
                      title="Copiar número"
                    >
                      {cardCopied ? (
                        <CheckCircle className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer: Info del titular + Estado */}
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Titular
                    </p>
                    <p className="text-sm font-black text-white tracking-wide">
                      {previewCard.user
                        ? `${previewCard.user.firstName || ''} ${previewCard.user.lastName || ''}`
                            .trim()
                            .toUpperCase() ||
                          previewCard.user.email.toUpperCase()
                        : 'SIN ASIGNAR'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Estado
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                        previewCard.status === 'REGISTERED'
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : 'bg-sky-400/20 text-sky-200'
                      }`}
                    >
                      {previewCard.status === 'REGISTERED'
                        ? '✓ Registrada'
                        : '● Disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Acciones: Descargar / Imprimir */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => void handleExportImage()}
                disabled={exporting !== null}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
              >
                {exporting === 'image' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileImage className="h-4 w-4" />
                )}
                <span>Imagen PNG</span>
              </button>
              <button
                onClick={() => void handleExportPDF()}
                disabled={exporting !== null}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
              >
                {exporting === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span>PDF</span>
              </button>
              <button
                onClick={() => void handlePrintCard()}
                disabled={exporting !== null}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
              >
                {exporting === 'print' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                <span>Imprimir</span>
              </button>
            </div>

            {/* Info adicional debajo de la tarjeta */}
            <div className="mt-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10 p-5 text-white space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                    Fecha de Creación
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {new Date(previewCard.createdAt).toLocaleDateString(
                      'es-MX',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      },
                    )}
                  </p>
                </div>
                {previewCard.registeredAt && (
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Fecha de Registro
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {new Date(previewCard.registeredAt).toLocaleDateString(
                        'es-MX',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        },
                      )}
                    </p>
                  </div>
                )}
                {previewCard.user && (
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Correo del Titular
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5 truncate">
                      {previewCard.user.email}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                    Tipo de Tarjeta
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {previewCard.cardType === 'PHYSICAL'
                      ? '💳 Tarjeta Física (Imprimible)'
                      : '🌐 Tarjeta 100% Digital'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                    Precio / Pago Mensual
                  </p>
                  <p className="text-sm font-bold text-amber-400 mt-0.5">
                    $
                    {previewCard.price
                      ? Number(previewCard.price).toFixed(2)
                      : '0.00'}{' '}
                    MXN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Categoría Rápida (Inline desde formulario de cupón) */}
      {showInlineCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowInlineCategoryModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-850 dark:bg-zinc-900 space-y-5 animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-850 dark:text-zinc-100 uppercase tracking-wider">
                    Nueva Categoría
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Crea una categoría y selecciónala al instante
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInlineCategoryModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={inlineCategoryName}
                  onChange={(e) => setInlineCategoryName(e.target.value)}
                  placeholder="Ej: Restaurantes, Salud y Belleza, Tecnología..."
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Ícono / Emoji (opcional)
                </label>
                <input
                  type="text"
                  value={inlineCategoryIcon}
                  onChange={(e) => setInlineCategoryIcon(e.target.value)}
                  placeholder="Ej: 🍕 🏥 💻 🎬 🛍️"
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-4 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
                <p className="text-[9px] text-zinc-400 mt-1">
                  Puedes usar emojis del teclado (Win + .) para identificar
                  visualmente la categoría.
                </p>
              </div>

              {/* Categorías existentes */}
              {categories.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                    Categorías Existentes ({categories.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[9px] font-bold text-zinc-600 dark:text-zinc-300"
                      >
                        {cat.icon && <span>{cat.icon}</span>}
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowInlineCategoryModal(false)}
                className="flex-1 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSaveInlineCategory()}
                disabled={!inlineCategoryName.trim() || savingInlineCategory}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 shadow-lg shadow-violet-600/15"
              >
                {savingInlineCategory ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>
                  {savingInlineCategory ? 'Creando...' : 'Crear y Seleccionar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vista Previa de Cupón en Admin (Diseño Moderno & Elegante) */}
      {previewCoupon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewCoupon(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-5 animate-in zoom-in-95 fade-in duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-violet-600 tracking-wider flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faTicketAlt} className="text-violet-500 text-sm" /> Vista Previa del Cupón
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    previewCoupon.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  ● {previewCoupon.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <button
                onClick={() => setPreviewCoupon(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tarjeta Visual del Cupón (Estilo 3D Gradient Moderno) */}
            <div className="rounded-3xl bg-gradient-to-tr from-violet-900 via-indigo-900 to-zinc-900 p-6 text-white shadow-xl relative overflow-hidden space-y-4 border border-violet-500/30">
              {/* Notches laterales ticket */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white dark:bg-zinc-950 z-15" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white dark:bg-zinc-950 z-15" />

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-violet-300 tracking-widest block">
                    {previewCoupon.company?.name || 'BONOW PLATAFORMA'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {previewCoupon.title}
                  </h3>
                </div>
                <span className="rounded-2xl bg-amber-400 px-3.5 py-1.5 text-sm font-black text-zinc-950 shadow-md">
                  {previewCoupon.discount}
                </span>
              </div>

              {previewCoupon.imageUrl && (
                <div className="w-full h-32 rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={previewCoupon.imageUrl}
                    alt={previewCoupon.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-xs text-zinc-300">
                {previewCoupon.description}
              </p>

              {/* QR Code Container */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-dashed border-white/20">
                <div className="space-y-1 text-left w-full sm:w-auto">
                  <span className="text-[9px] font-bold uppercase text-zinc-400 block">
                    Código de Canje
                  </span>
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5">
                    <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
                      {previewCoupon.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(previewCoupon.code);
                        setCouponCopied(true);
                        setTimeout(() => setCouponCopied(false), 2000);
                      }}
                      className="text-zinc-300 hover:text-white transition"
                      title="Copiar Código"
                    >
                      {couponCopied ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    {previewCoupon.type === 'SINGLE_USE'
                      ? '🔒 Uso Único Global / Personal'
                      : '♾️ Reutilizable'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-2xl shadow-inner text-zinc-950 flex flex-col items-center shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(previewCoupon.code)}`}
                    alt="QR Code"
                    className="h-20 w-20 object-contain"
                  />
                  <span className="text-[8px] font-mono font-bold mt-1 text-zinc-600">
                    {previewCoupon.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Condiciones y Sucursales */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Vigencia:
                </span>
                <p className="text-zinc-500">
                  {new Date(previewCoupon.startDate).toLocaleDateString(
                    'es-MX',
                    { day: '2-digit', month: 'short', year: 'numeric' },
                  )}{' '}
                  -{' '}
                  {new Date(previewCoupon.endDate).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {previewCoupon.conditions && (
                <div>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Condiciones y Términos:
                  </span>
                  <p className="text-zinc-500">{previewCoupon.conditions}</p>
                </div>
              )}
            </div>

            {/* Botón Acción en Modal */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPreviewCoupon(null)}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Precio de Tarjeta */}
      {editingCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setEditingCard(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-4 animate-in zoom-in-95 fade-in duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <span className="text-xs font-black uppercase text-violet-600 tracking-wider">
                ✏️ Editar Precio de Tarjeta
              </span>
              <button
                onClick={() => setEditingCard(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Tarjeta Seleccionada:</p>
              <p className="text-sm font-mono font-black text-zinc-800 dark:text-white">
                {editingCard.cardNumber}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Nuevo Precio Mensual ($ MXN):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editingCardPriceValue}
                onChange={(e) => setEditingCardPriceValue(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                placeholder="Ej. 90.00"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingCard(null)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                disabled={updatingCardPrice}
                onClick={handleUpdateCardPrice}
                className="flex-1 rounded-2xl bg-violet-600 py-2.5 text-xs font-black text-white hover:bg-violet-700 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5"
              >
                {updatingCardPrice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Cambio'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminación de Tarjeta */}
      {deletingCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDeletingCard(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-4 animate-in zoom-in-95 fade-in duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-zinc-800 dark:text-white">
                ¿Eliminar Tarjeta?
              </h3>
              <p className="text-xs text-zinc-500">
                Esta acción eliminará de forma permanente el código{' '}
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {deletingCard.cardNumber}
                </span>
                .
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingCard(null)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                disabled={isDeletingCard}
                onClick={handleDeleteCard}
                className="flex-1 rounded-2xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5"
              >
                {isDeletingCard ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Sí, Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Slide de Portada */}
      {showHeroModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowHeroModal(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-4 animate-in zoom-in-95 fade-in duration-200 text-left no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <span className="text-xs font-black uppercase text-violet-600 tracking-wider">
                🖼️{' '}
                {heroForm.id
                  ? 'Editar Slide de Portada'
                  : 'Agregar Nuevo Slide de Portada'}
              </span>
              <button
                onClick={() => setShowHeroModal(false)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Etiqueta / Badge Flotante (ej: ⚡ CLUB DE DESCUENTOS #1)
                </label>
                <input
                  type="text"
                  value={heroForm.badgeText}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, badgeText: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="ej: ⚡ PROMOCIÓN DE VERANO"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Título Principal (usa saltos de línea para destacar en color)
                </label>
                <textarea
                  rows={2}
                  value={heroForm.title}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, title: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="DESCUBRE.&#10;AHORRA.&#10;DISFRUTA."
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Subtítulo / Descripción
                </label>
                <textarea
                  rows={2}
                  value={heroForm.subtitle}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, subtitle: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="Accede a descuentos exclusivos..."
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  URL de Imagen de Fondo (/img/fondo1.jpg o enlace web
                  https://...)
                </label>
                <input
                  type="text"
                  value={heroForm.bgImageUrl}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, bgImageUrl: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-mono text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="/img/fondo1.jpg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Texto del Botón CTA
                </label>
                <input
                  type="text"
                  value={heroForm.ctaText}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, ctaText: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="Explorar Descuentos"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Enlace del Botón CTA (ej: /coupons)
                </label>
                <input
                  type="text"
                  value={heroForm.ctaUrl}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, ctaUrl: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-mono text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="/coupons"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Título Tarjeta Derecha
                </label>
                <input
                  type="text"
                  value={heroForm.cardTitle}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, cardTitle: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="ÚNETE A BONOW+"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Precio / Texto Tarjeta Derecha
                </label>
                <input
                  type="text"
                  value={heroForm.cardPrice}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, cardPrice: e.target.value })
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="Desde $99 MXN / mes"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Características (Viñetas de la Tarjeta Flotante)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={heroForm.feature1}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, feature1: e.target.value })
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Viñeta 1"
                  />
                  <input
                    type="text"
                    value={heroForm.feature2}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, feature2: e.target.value })
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Viñeta 2"
                  />
                  <input
                    type="text"
                    value={heroForm.feature3}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, feature3: e.target.value })
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Viñeta 3"
                  />
                  <input
                    type="text"
                    value={heroForm.feature4}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, feature4: e.target.value })
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Viñeta 4"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={() => setShowHeroModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                disabled={savingHeroSlides}
                onClick={handleSaveHeroSlide}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-xs font-black text-white hover:from-violet-500 hover:to-fuchsia-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5"
              >
                {savingHeroSlides ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Slide de Portada'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminar Categoría 🗑️ */}
      {deletingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDeletingCategory(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-4 animate-in zoom-in-95 fade-in duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-zinc-800 dark:text-white">
                ¿Eliminar Categoría?
              </h3>
              <p className="text-xs text-zinc-500">
                Esta acción eliminará la categoría{' '}
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  "{deletingCategory.name}"
                </span>{' '}
                y ya no estará disponible en el catálogo ni en la portada.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition"
              >
                Cancelar
              </button>
              <button
                disabled={isDeletingCategory}
                onClick={handleDeleteCategoryConfirm}
                className="flex-1 rounded-2xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5"
              >
                {isDeletingCategory ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Sí, Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Plan de Membresía 💎 */}
      {showMembershipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowMembershipModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-4 animate-in zoom-in-95 fade-in duration-200 text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <span className="text-xs font-black uppercase text-violet-600 tracking-wider flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Editar Plan de Membresía: {membershipForm.name}
              </span>
              <button
                onClick={() => setShowMembershipModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Nombre del Plan
                  </label>
                  <input
                    type="text"
                    value={membershipForm.name}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none font-bold"
                    placeholder="Ej. Plan Mensual"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Precio (MXN)
                  </label>
                  <input
                    type="number"
                    value={membershipForm.price}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        price: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none font-black text-violet-600"
                    placeholder="Ej. 149"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Frecuencia / Periodo
                  </label>
                  <input
                    type="text"
                    value={membershipForm.period}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        period: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Ej. MXN / mes"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Insignia / Badge
                  </label>
                  <input
                    type="text"
                    value={membershipForm.badge}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        badge: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Ej. POPULAR, RECOMENDADO"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  value={membershipForm.description}
                  onChange={(e) =>
                    setMembershipForm({
                      ...membershipForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  placeholder="Descripción atractiva del plan..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Beneficios e Incluidos (Viñetas)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={membershipForm.feature1}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        feature1: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Beneficio 1"
                  />
                  <input
                    type="text"
                    value={membershipForm.feature2}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        feature2: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Beneficio 2"
                  />
                  <input
                    type="text"
                    value={membershipForm.feature3}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        feature3: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Beneficio 3"
                  />
                  <input
                    type="text"
                    value={membershipForm.feature4}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        feature4: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Beneficio 4"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={() => setShowMembershipModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                disabled={savingMembershipPlans}
                onClick={handleSaveMembershipPlan}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-xs font-black text-white hover:from-violet-500 hover:to-fuchsia-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savingMembershipPlans ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Plan & Tarifa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configurar Precios de Créditos de Cupones 🎟️ */}
      {showCreditPackagesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowCreditPackagesModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-5 animate-in zoom-in-95 fade-in duration-200 text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3 dark:border-zinc-800">
              <span className="text-xs font-black uppercase text-rose-600 tracking-wider flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Editar Tarifas de Paquetes de Cupones para Empresas
              </span>
              <button
                onClick={() => setShowCreditPackagesModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ajusta los precios de cada paquete de créditos. Cuando las empresas sin membresía pagada quieran publicar un cupón o promoción, podrán comprar estos paquetes al precio configurado aquí.
            </p>

            <div className="space-y-4">
              {adminCreditPackages.map((pkg, idx) => (
                <div
                  key={pkg.id || idx}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Nombre del Paquete
                      </label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => {
                          const updated = [...adminCreditPackages];
                          updated[idx].name = e.target.value;
                          setAdminCreditPackages(updated);
                        }}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Precio ($ MXN)
                      </label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => {
                          const updated = [...adminCreditPackages];
                          updated[idx].price = Number(e.target.value);
                          setAdminCreditPackages(updated);
                        }}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-rose-400 font-black outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Descripción para la Empresa
                    </label>
                    <input
                      type="text"
                      value={pkg.description || ''}
                      onChange={(e) => {
                        const updated = [...adminCreditPackages];
                        updated[idx].description = e.target.value;
                        setAdminCreditPackages(updated);
                      }}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={() => setShowCreditPackagesModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                disabled={savingCreditPackages}
                onClick={handleSaveCreditPackagesAdmin}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 py-2.5 text-xs font-black text-white hover:opacity-95 transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savingCreditPackages ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Precios de Créditos'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALLES COMPLETOS DE LA EMPRESA REGISTRADA 👁️ */}
      {showAdminCompanyDetailModal && selectedAdminCompanyDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowAdminCompanyDetailModal(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-6 text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex justify-between items-start border-b border-zinc-150 pb-4 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase text-red-600 tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    Expediente Comercial y Fiscal de Empresa
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      selectedAdminCompanyDetail.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : selectedAdminCompanyDetail.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {selectedAdminCompanyDetail.status === 'APPROVED'
                      ? '✓ Aprobada'
                      : selectedAdminCompanyDetail.status === 'PENDING'
                        ? '⏳ Pendiente de Aprobación'
                        : '🚫 Suspendida'}
                  </span>
                  {selectedAdminCompanyDetail.isFeatured && (
                    <span className="bg-amber-400/20 text-amber-500 border border-amber-400/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-amber-500" /> Destacada
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                  {selectedAdminCompanyDetail.name}
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  Razón Social: <strong className="text-zinc-800 dark:text-zinc-200">{selectedAdminCompanyDetail.corporateName || 'N/A'}</strong>
                </p>
              </div>

              <button
                onClick={() => setShowAdminCompanyDetailModal(false)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grid 1: Datos Fiscales y de Contacto */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                1. Información Comercial y Contacto Registrado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    RFC Fiscal
                  </span>
                  <span className="font-mono font-black text-violet-600 dark:text-violet-400 text-sm block mt-0.5">
                    {selectedAdminCompanyDetail.rfc || 'Sin RFC'}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Teléfono Comercial
                  </span>
                  <span className="font-black text-zinc-900 dark:text-white text-xs block mt-0.5">
                    {selectedAdminCompanyDetail.phone || 'No registrado'}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Email de Contacto
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs block mt-0.5 truncate">
                    {selectedAdminCompanyDetail.email || 'No registrado'}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Sitio Web
                  </span>
                  {selectedAdminCompanyDetail.website ? (
                    <a
                      href={selectedAdminCompanyDetail.website.startsWith('http') ? selectedAdminCompanyDetail.website : `https://${selectedAdminCompanyDetail.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-violet-600 dark:text-violet-400 text-xs block mt-0.5 hover:underline truncate"
                    >
                      {selectedAdminCompanyDetail.website} ↗
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400 block mt-0.5">Sin sitio web</span>
                  )}
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Facebook Link
                  </span>
                  {selectedAdminCompanyDetail.socialLinks?.facebook ? (
                    <a
                      href={selectedAdminCompanyDetail.socialLinks.facebook.startsWith('http') ? selectedAdminCompanyDetail.socialLinks.facebook : `https://${selectedAdminCompanyDetail.socialLinks.facebook}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 dark:text-blue-400 text-xs block mt-0.5 hover:underline truncate"
                    >
                      {selectedAdminCompanyDetail.socialLinks.facebook} ↗
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400 block mt-0.5">No registrado</span>
                  )}
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Instagram Link
                  </span>
                  {selectedAdminCompanyDetail.socialLinks?.instagram ? (
                    <a
                      href={selectedAdminCompanyDetail.socialLinks.instagram.startsWith('http') ? selectedAdminCompanyDetail.socialLinks.instagram : `https://${selectedAdminCompanyDetail.socialLinks.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-fuchsia-600 dark:text-fuchsia-400 text-xs block mt-0.5 hover:underline truncate"
                    >
                      {selectedAdminCompanyDetail.socialLinks.instagram} ↗
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400 block mt-0.5">No registrado</span>
                  )}
                </div>
              </div>
            </div>

            {/* Grid 2: Descripción y Propietario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Descripción Comercial del Negocio
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {selectedAdminCompanyDetail.description || 'Sin descripción ingresada por la empresa.'}
                </p>
              </div>

              <div className="space-y-2 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Propietario / Titular de la Cuenta
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  {selectedAdminCompanyDetail.owner?.firstName} {selectedAdminCompanyDetail.owner?.lastName}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  {selectedAdminCompanyDetail.owner?.email}
                </p>
                {selectedAdminCompanyDetail.createdAt && (
                  <span className="text-[10px] text-zinc-400 block pt-1">
                    Registrado el: {new Date(selectedAdminCompanyDetail.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Sucursales */}
            {selectedAdminCompanyDetail.branches && selectedAdminCompanyDetail.branches.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  2. Sucursales Registradas en Mapa ({selectedAdminCompanyDetail.branches.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAdminCompanyDetail.branches.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1"
                    >
                      <h4 className="font-bold text-zinc-900 dark:text-white">
                        📍 {b.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500">{b.address}</p>
                      {b.schedules && (
                        <span className="text-[10px] text-zinc-400 block">
                          🕒 {b.schedules}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones de Aprobación del Administrador */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
              {selectedAdminCompanyDetail.status !== 'APPROVED' && (
                <button
                  onClick={async () => {
                    await handleCompanyStatus(selectedAdminCompanyDetail.id, 'APPROVED');
                    setSelectedAdminCompanyDetail((prev: any) => prev ? { ...prev, status: 'APPROVED' } : null);
                  }}
                  className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-black text-white transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Aprobar Empresa</span>
                </button>
              )}

              {selectedAdminCompanyDetail.status !== 'SUSPENDED' && (
                <button
                  onClick={async () => {
                    await handleCompanyStatus(selectedAdminCompanyDetail.id, 'SUSPENDED');
                    setSelectedAdminCompanyDetail((prev: any) => prev ? { ...prev, status: 'SUSPENDED' } : null);
                  }}
                  className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 py-3 text-xs font-black text-white transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Suspender Empresa</span>
                </button>
              )}

              <button
                onClick={async () => {
                  await handleToggleCompanyFeatured(selectedAdminCompanyDetail.id);
                  setSelectedAdminCompanyDetail((prev: any) => prev ? { ...prev, isFeatured: !prev.isFeatured } : null);
                }}
                className={`rounded-2xl px-5 py-3 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedAdminCompanyDetail.isFeatured
                    ? 'bg-amber-400 text-zinc-950 shadow-md hover:bg-amber-500'
                    : 'bg-zinc-800 text-amber-400 border border-amber-500/40 hover:bg-zinc-700'
                }`}
              >
                <Star className={`h-4 w-4 ${selectedAdminCompanyDetail.isFeatured ? 'fill-zinc-950' : ''}`} />
                <span>{selectedAdminCompanyDetail.isFeatured ? '★ Empresa Destacada' : '☆ Destacar Empresa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PROMOCIÓN */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                {promoItemForm.id
                  ? 'Editar Promoción'
                  : 'Nueva Promoción Exclusiva'}
              </h3>
              <button
                onClick={() => setShowPromoModal(false)}
                className="rounded-xl p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Título de la Promoción
                </label>
                <input
                  type="text"
                  value={promoItemForm.title}
                  onChange={(e) =>
                    setPromoItemForm({
                      ...promoItemForm,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="Ej: 2x1 en Platillos Fuertes y Coctelería"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Empresa / Comercio
                  </label>
                  <input
                    type="text"
                    value={promoItemForm.companyName}
                    onChange={(e) =>
                      setPromoItemForm({
                        ...promoItemForm,
                        companyName: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Ej: Cinépolis VIP"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Descuento / Badge (Ej: 2x1, 50% OFF)
                  </label>
                  <input
                    type="text"
                    value={promoItemForm.discount}
                    onChange={(e) =>
                      setPromoItemForm({
                        ...promoItemForm,
                        discount: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Categoría
                </label>
                <select
                  value={promoItemForm.category}
                  onChange={(e) =>
                    setPromoItemForm({
                      ...promoItemForm,
                      category: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                >
                  <option value="Restaurantes">Restaurantes</option>
                  <option value="Cafeterías">Cafeterías</option>
                  <option value="Hoteles">Hoteles</option>
                  <option value="Belleza">Belleza</option>
                  <option value="Gimnasios">Gimnasios</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Salud">Salud</option>
                  <option value="Tiendas">Tiendas</option>
                  <option value="Viajes">Viajes</option>
                  <option value="Más">Más</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={promoItemForm.description}
                  onChange={(e) =>
                    setPromoItemForm({
                      ...promoItemForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none resize-none"
                  placeholder="Condiciones o términos de la promoción..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Imagen de Portada de la Promoción
                </label>
                <input
                  type="file"
                  ref={promoFileInputRef}
                  accept="image/*"
                  onChange={handlePromoFileSelect}
                  className="hidden"
                />

                {promoItemForm.imageUrl ? (
                  <div className="relative mt-2 h-36 w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group">
                    <img
                      src={promoItemForm.imageUrl}
                      alt="Portada"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => promoFileInputRef.current?.click()}
                        className="rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-xs font-bold shadow hover:bg-zinc-100 transition cursor-pointer"
                      >
                        Cambiar Imagen
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPromoItemForm((prev) => ({
                            ...prev,
                            imageUrl: '',
                          }))
                        }
                        className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-bold shadow hover:bg-red-500 transition cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => promoFileInputRef.current?.click()}
                    className="mt-2 border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 transition group"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-1 group-hover:scale-110 transition duration-300">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      Subir Imagen desde PC / Celular
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Haz clic para seleccionar fotos de tu galería o archivos
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
              <button
                onClick={() => setShowPromoModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePromoItem}
                className="flex-1 rounded-2xl bg-amber-500 py-2.5 text-xs font-black text-zinc-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Guardar Promoción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR SUCURSAL (MAPA) */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-violet-600" />
                {branchForm.id
                  ? 'Editar Sucursal en Mapa'
                  : 'Nueva Sucursal en el Mapa'}
              </h3>
              <button
                onClick={() => setShowBranchModal(false)}
                className="rounded-xl p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                  📍 Selecciona Ubicación Exacta en el Mapa (Presiona en el mapa
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
                  Empresa Aliada Pertenece
                </label>
                <select
                  value={branchForm.companyId}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, companyId: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none font-bold cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Nombre de la Sucursal
                </label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-violet-500"
                  placeholder="Ej: Sucursal Polanco / Sucursal Centro"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Categorías de esta Sucursal (Selecciona una o varias)
                </label>
                <div className="mt-1 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  {categories.length > 0 ? (
                    categories.map((cat) => {
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
                  Dirección Completa
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
                    Latitud
                  </label>
                  <input
                    type="text"
                    value={branchForm.latitude}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, latitude: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none"
                    placeholder="Ej: 19.432608"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Longitud
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
                    placeholder="Ej: -99.133209"
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
                onClick={() => setShowBranchModal(false)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={savingBranch}
                onClick={handleSaveBranchAdmin}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-xs font-black text-white hover:from-violet-500 hover:to-purple-500 transition shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savingBranch ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Sucursal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Rechazar Publicación de Cupón con Motivo */}
      {rejectingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <h3 className="text-base font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Rechazar Publicación de Cupón
              </h3>
              <button
                onClick={() => setRejectingCoupon(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Cupón: {rejectingCoupon.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Empresa: <strong className="text-violet-600">{rejectingCoupon.company?.name || 'Comercio'}</strong>
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                  Motivo de Rechazo (Obligatorio)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Ej: El porcentaje de descuento especificado no concuerda con las condiciones o la imagen infringe los términos del servicio..."
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-zinc-400 block mt-1">
                  Este motivo se enviará a las notificaciones del comercio para que pueda corregir el cupón.
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-850">
              <button
                onClick={() => setRejectingCoupon(null)}
                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={submittingRejection}
                onClick={handleConfirmRejectCouponAdmin}
                className="flex-1 rounded-2xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700 transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submittingRejection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirmar Rechazo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
