import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponStatus, CouponType, RedemptionStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createCoupon(userId: string, dto: CreateCouponDto) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true, roles: true },
    });

    const isUserAdmin = user?.roles?.some((r) => r.name === 'ADMIN') ?? false;

    const hasActiveMembership = user?.membership?.status === 'ACTIVE';

    if (!isUserAdmin) {
      if (company.status !== 'APPROVED') {
        throw new ForbiddenException(
          'Tu empresa debe estar activa para poder crear cupones.',
        );
      }

      if (!hasActiveMembership && company.couponCredits <= 0) {
        throw new ForbiddenException(
          'NO_CREDITS: No cuentas con una membresía activa ni créditos disponibles. Por favor adquiere un paquete de créditos para publicar tu cupón.',
        );
      }
    }

    const { branchIds, categoryId, categoryIds, targetCompanyId, allowedCompanyIds, ...data } = dto;

    const allCatIds = Array.isArray(categoryIds) && categoryIds.length > 0
      ? categoryIds
      : (categoryId ? [categoryId] : []);

    if (allCatIds.length === 0) {
      throw new BadRequestException('Debes seleccionar al menos una categoría para el cupón.');
    }

    const primaryCategoryId = allCatIds[0];

    const categoryExists = await this.prisma.category.findUnique({
      where: { id: primaryCategoryId },
    });
    if (!categoryExists) {
      throw new BadRequestException(
        'La categoría seleccionada no existe o no es válida. Por favor selecciona una categoría de la lista.',
      );
    }

    // Determinar la empresa emisora
    let emittingCompanyId = company.id;
    if (isUserAdmin && targetCompanyId) {
      const foundTarget = await this.prisma.company.findUnique({
        where: { id: targetCompanyId },
      });
      if (foundTarget) {
        emittingCompanyId = foundTarget.id;
      }
    }

    // Construir condiciones con categorías y empresas permitidas
    let finalConditions = data.conditions || '';
    if (allCatIds.length > 0) {
      finalConditions = `[CATEGORIES:${allCatIds.join(',')}] ${finalConditions}`.trim();
    }
    if (isUserAdmin && allowedCompanyIds && allowedCompanyIds.length > 0) {
      finalConditions = `[COMPANIES:${allowedCompanyIds.join(',')}] ${finalConditions}`.trim();
    }

    // Generar un código único del cupón
    const couponCode = `BONOW-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const coupon = await this.prisma.coupon.create({
      data: {
        ...data,
        conditions: finalConditions || undefined,
        code: couponCode,
        status: isUserAdmin ? CouponStatus.ACTIVE : CouponStatus.PENDING,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        company: { connect: { id: emittingCompanyId } },
        category: { connect: { id: primaryCategoryId } },
        branches: {
          connect: (branchIds || []).map((id) => ({ id })),
        },
      },
      include: {
        branches: true,
        category: true,
        company: true,
      },
    });

    // Notificar a todos los administradores que hay un nuevo cupón pendiente de aprobación
    try {
      const admins = await this.prisma.user.findMany({
        where: { roles: { some: { name: 'ADMIN' } } },
        select: { id: true },
      });
      for (const admin of admins) {
        void this.notificationsService.sendNotification(
          admin.id,
          'Nuevo Cupón Pendiente de Aprobar',
          `La empresa "${company.name}" ha enviado el cupón "${dto.title}". Ingresa a la plataforma para revisarlo y aprobarlo.`,
          'COUPON_PENDING',
          ['EMAIL', 'PUSH'],
        );
      }
    } catch {
      // Silencioso para no romper la transacción principal
    }

    // Decrementar 1 crédito si la empresa no tiene membresía activa
    if (!hasActiveMembership && company.couponCredits > 0) {
      await this.prisma.company.update({
        where: { id: company.id },
        data: { couponCredits: { decrement: 1 } },
      });
    }

    return coupon;
  }

  async updateCoupon(userId: string, couponId: string, dto: CreateCouponDto) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon || coupon.companyId !== company.id) {
      throw new NotFoundException(
        'El cupón no existe o no pertenece a tu empresa.',
      );
    }

    const { branchIds, categoryId, ...data } = dto;

    if (!categoryId) {
      throw new BadRequestException('Debes seleccionar una categoría para el cupón.');
    }

    const categoryExists = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      throw new BadRequestException(
        'La categoría seleccionada no existe o no es válida. Por favor selecciona una categoría de la lista.',
      );
    }

    const updatedCoupon = await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...data,
        status: CouponStatus.PENDING,
        rejectionReason: null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        category: { connect: { id: categoryId } },
        branches: {
          set: branchIds.map((id) => ({ id })),
        },
      },
      include: {
        branches: true,
        category: true,
      },
    });

    // Notificar a los administradores que el cupón fue modificado y re-enviado para aprobación
    try {
      const admins = await this.prisma.user.findMany({
        where: { roles: { some: { name: 'ADMIN' } } },
        select: { id: true },
      });
      for (const admin of admins) {
        void this.notificationsService.sendNotification(
          admin.id,
          'Cupón Modificado Pendiente de Aprobar',
          `La empresa "${company.name}" ha modificado el cupón "${dto.title}". Por favor revísalo nuevamente.`,
          'COUPON_PENDING',
          ['EMAIL', 'PUSH'],
        );
      }
    } catch {
      // Silencioso
    }

    return updatedCoupon;
  }

  async deleteCoupon(userId: string, couponId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon || coupon.companyId !== company.id) {
      throw new NotFoundException(
        'El cupón no existe o no pertenece a tu empresa.',
      );
    }

    await this.prisma.coupon.delete({
      where: { id: couponId },
    });

    return { message: 'Cupón eliminado exitosamente.' };
  }

  async updateCouponStatus(
    userId: string,
    couponId: string,
    status: CouponStatus,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon || coupon.companyId !== company.id) {
      throw new NotFoundException(
        'El cupón no existe o no pertenece a tu empresa.',
      );
    }

    return this.prisma.coupon.update({
      where: { id: couponId },
      data: { status },
    });
  }

  async getCategories() {
    let categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories.length < 5) {
      const defaultCategories = [
        { name: 'Restaurantes', slug: 'restaurantes', icon: 'UtensilsCrossed' },
        { name: 'Cafeterías', slug: 'cafeterias', icon: 'Coffee' },
        { name: 'Hoteles', slug: 'hoteles', icon: 'Hotel' },
        { name: 'Belleza', slug: 'belleza', icon: 'Sparkle' },
        { name: 'Gimnasios', slug: 'gimnasios', icon: 'Dumbbell' },
        { name: 'Entretenimiento', slug: 'entretenimiento', icon: 'Film' },
        { name: 'Salud', slug: 'salud', icon: 'HeartPulse' },
        { name: 'Tiendas', slug: 'tiendas', icon: 'ShoppingBag' },
        { name: 'Viajes', slug: 'viajes', icon: 'Plane' },
        { name: 'Más', slug: 'mas', icon: 'Plus' },
      ];

      for (const cat of defaultCategories) {
        const exists = categories.some(
          (c) =>
            c.slug === cat.slug ||
            c.name.toLowerCase() === cat.name.toLowerCase(),
        );
        if (!exists) {
          try {
            await this.prisma.category.create({
              data: cat,
            });
          } catch {
            // Silencioso si ya existe
          }
        }
      }

      categories = await this.prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return categories;
  }

  async getHeroSlides() {
    const defaultSlides = [
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

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'HERO_SLIDES' },
    });
    if (!setting) return defaultSlides;
    try {
      const parsed = JSON.parse(setting.value);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : defaultSlides;
    } catch {
      return defaultSlides;
    }
  }

  async getMembershipPlans() {
    const defaultPlans = [
      {
        id: 'monthly',
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

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'MEMBERSHIP_PLANS' },
    });

    if (!setting) return defaultPlans;
    try {
      const parsed = JSON.parse(setting.value);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : defaultPlans;
    } catch {
      return defaultPlans;
    }
  }

  async getAboutPage() {
    const defaultAbout = {
      heroTag: 'Conoce el Club de Descuentos #1 de México',
      title: 'REVOLUCIONANDO EL AHORRO Y EL ESTILO DE VIDA',
      subtitle:
        'BONOW conecta a miles de miembros en todo México con los mejores restaurantes, cafeterías, spas, gimnasios y entretenimiento a precios exclusivos y promociones 2x1 ilimitadas.',
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
          desc: 'Sin necesidad de cupones impresos. Muestra tu membresía digital o código QR directamente en la sucursal desde tu celular.',
        },
      ],
    };

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'ABOUT_PAGE' },
    });

    if (!setting) return defaultAbout;
    try {
      const parsed = JSON.parse(setting.value);
      return parsed && parsed.title ? parsed : defaultAbout;
    } catch {
      return defaultAbout;
    }
  }

  async getPublicCompanies() {
    const companies = await this.prisma.company.findMany({
      where: {
        status: 'APPROVED',
        NOT: [
          { name: { equals: 'BONOW', mode: 'insensitive' } },
          { name: { equals: 'WYNNI', mode: 'insensitive' } },
          { corporateName: { contains: 'BONOW', mode: 'insensitive' } },
          { corporateName: { contains: 'WYNNI', mode: 'insensitive' } },
          { rfc: { equals: 'BON123456789' } },
          { rfc: { equals: 'WYN123456789' } },
        ],
      },
      include: {
        category: true,
        categories: true,
        coupons: {
          where: { status: 'ACTIVE' },
          include: { category: true },
        },
        advertising: {
          where: { status: 'ACTIVE' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return companies.map((c) => {
      const catSet = new Set<string>();
      if (c.categories && c.categories.length > 0) {
        c.categories.forEach((cat) => catSet.add(cat.name));
      }
      if (c.category?.name) {
        catSet.add(c.category.name);
      }
      if (catSet.size === 0) {
        const couponCat = c.coupons.find((cp) => cp.category?.name)?.category?.name;
        if (couponCat) catSet.add(couponCat);
        else catSet.add('Comercio Aliado');
      }

      const catList = Array.from(catSet);

      return {
        id: c.id,
        name: c.name,
        corporateName: c.corporateName,
        logoUrl: c.logoUrl,
        description:
          c.description || 'Comercio aliado oficial verificado por BONOW.',
        phone: c.phone,
        email: c.email,
        website: c.website,
        status: c.status,
        isFeatured: c.isFeatured,
        category: { name: catList[0] },
        categoriesList: catList,
        couponsCount: c.coupons.length,
        coupons: c.coupons.map((cp) => ({
          id: cp.id,
          title: cp.title,
          description: cp.description,
          discount: cp.discount,
          imageUrl: cp.imageUrl,
          conditions: cp.conditions,
          category: cp.category?.name,
        })),
        promotions: c.advertising.map((ad) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          imageUrl: ad.imageUrl,
          category: ad.adType,
          discount: '2X1 / OFERTA',
          isFeatured: ad.isFeatured,
        })),
      };
    });
  }

  async getPromotionsPage() {
    const defaultPromotions = {
      heroTag: '⚡ OFERTAS ESPECIALES 2X1 & DESCUENTOS DESTACADOS',
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
          isFeatured: true,
          description:
            'Válido de lunes a domingo en consumos mínimos de $300 MXN. Presenta tu membresía digital en sucursal.',
          imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        },
        {
          id: 'promo-2',
          title: 'Pass VIP 2x1 en Entradas y Combos Dulces',
          companyName: 'Cinépolis & Cinemex VIP',
          category: 'Entretenimiento',
          discount: '2X1 ENTRADAS',
          isFeatured: true,
          description:
            'Aplica para salas tradicionales y VIP todas las funciones de lunes a viernes.',
          imageUrl:
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
        },
        {
          id: 'promo-3',
          title: '50% de Descuento en Circuito de Spa & Masajes',
          companyName: 'Zenith Luxury Spa',
          category: 'Belleza',
          discount: '50% OFF',
          isFeatured: true,
          description:
            'Incluye masaje relajante de 60 min y circuito de hidroterapia con reserva previa.',
          imageUrl:
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
        },
      ],
    };

    // Obtener promociones activas creadas por empresas registradas
    let companyPromoItems: any[] = [];
    try {
      const activeAds = await this.prisma.advertising.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });

      companyPromoItems = activeAds.map((ad) => ({
        id: ad.id,
        title: ad.title,
        companyName: ad.company?.name || 'Comercio Aliado',
        companyLogo: ad.company?.logoUrl || null,
        category:
          ad.adType && ad.adType !== 'PROMO' && ad.adType !== 'BANNER'
            ? ad.adType
            : 'Restaurantes',
        discount: '2X1 / OFERTA',
        isFeatured: ad.isFeatured,
        description: ad.description || 'Promoción exclusiva para socios BONOW+.',
        imageUrl:
          ad.imageUrl ||
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
      }));
    } catch {
      // Silencioso
    }

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'PROMOTIONS_PAGE' },
    });

    let baseData = defaultPromotions;
    if (setting) {
      try {
        const parsed = JSON.parse(setting.value);
        if (parsed && parsed.title) {
          baseData = { ...defaultPromotions, ...parsed };
        }
      } catch {
        baseData = defaultPromotions;
      }
    }

    const combinedItems = [
      ...companyPromoItems,
      ...(baseData.items || []),
    ];

    return {
      ...baseData,
      items: combinedItems,
      companyItems: companyPromoItems,
    };
  }

  async getPublicCoupons(categoryId?: string, query?: string) {
    const filter: any = {
      status: CouponStatus.ACTIVE,
      endDate: {
        gte: new Date(),
      },
    };

    if (categoryId) {
      filter.OR = [
        { categoryId: categoryId },
        { conditions: { contains: `[CATEGORIES:${categoryId}` } },
        { conditions: { contains: `,${categoryId}` } },
      ];
    }

    if (query) {
      filter.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const rawCoupons = await this.prisma.coupon.findMany({
      where: filter,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
        category: true,
        branches: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Excluir cupones donde usageLimit está definido y el conteo de usos ya alcanzó el límite (agotados)
    return rawCoupons.filter(
      (c) => c.usageLimit === null || c.usageLimit === undefined || c.usageCount < c.usageLimit,
    );
  }

  async getCouponById(couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        company: true,
        category: true,
        branches: true,
      },
    });

    if (!coupon) {
      throw new NotFoundException('El cupón no existe.');
    }

    return coupon;
  }

  async getBusinessCoupons(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    return this.prisma.coupon.findMany({
      where: { companyId: company.id },
      include: {
        category: true,
        branches: true,
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async redeemCoupon(userId: string, couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon || coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException('El cupón no está activo o no existe.');
    }

    if (new Date() > coupon.endDate) {
      throw new BadRequestException('El cupón ya ha expirado.');
    }

    // Verificar si el usuario tiene una membresía activa y vigente
    const userMembership = await this.prisma.userMembership.findUnique({
      where: { userId },
    });
    if (!userMembership || userMembership.status !== 'ACTIVE' || new Date() > userMembership.endDate) {
      throw new ForbiddenException(
        'Debes tener una membresía activa y vigente para poder redimir cupones.',
      );
    }

    // Evitar doble uso si es único
    if (coupon.type === CouponType.SINGLE_USE) {
      const existing = await this.prisma.couponRedemption.findFirst({
        where: {
          userId,
          couponId,
          status: { in: [RedemptionStatus.PENDING, RedemptionStatus.USED] },
        },
      });
      if (existing) {
        throw new BadRequestException(
          'Ya has redimido este cupón anteriormente.',
        );
      }
    }

    // Verificar límites
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException(
        'Este cupón ha alcanzado su límite de usos.',
      );
    }

    const redemptionCode = `BONOW-RED-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Registrar redención
    const redemption = await this.prisma.couponRedemption.create({
      data: {
        userId,
        couponId,
        generatedCode: redemptionCode,
        status: RedemptionStatus.PENDING,
      },
      include: {
        coupon: {
          include: { company: true },
        },
      },
    });

    // Incrementar contador
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    return redemption;
  }

  async getMyRedemptions(userId: string) {
    return this.prisma.couponRedemption.findMany({
      where: { userId },
      include: {
        coupon: {
          include: {
            company: {
              select: { name: true, logoUrl: true },
            },
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
    });
  }

  async validateRedemptionCode(userId: string, code: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const redemption = await this.prisma.couponRedemption.findUnique({
      where: { generatedCode: code },
      include: {
        coupon: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!redemption) {
      throw new NotFoundException('El código de validación es inválido.');
    }

    let isAllowed = redemption.coupon.companyId === company.id;

    if (!isAllowed && redemption.coupon.conditions) {
      const cond = redemption.coupon.conditions;
      if (cond.includes('[COMPANIES:ALL]')) {
        isAllowed = true;
      } else if (cond.includes('[COMPANIES:')) {
        const match = cond.match(/\[COMPANIES:([^\]]+)\]/);
        if (match && match[1]) {
          const allowedIds = match[1].split(',');
          if (allowedIds.includes(company.id) || allowedIds.includes('ALL')) {
            isAllowed = true;
          }
        }
      }
    }

    if (!isAllowed) {
      throw new ForbiddenException(
        'Este cupón no está habilitado para canjearse en tu empresa.',
      );
    }

    if (redemption.status !== RedemptionStatus.PENDING) {
      throw new BadRequestException(
        `Este código ya ha sido ${redemption.status === RedemptionStatus.USED ? 'usado' : 'cancelado'}.`,
      );
    }

    // Cambiar estado a usado
    const updated = await this.prisma.couponRedemption.update({
      where: { id: redemption.id },
      data: { status: RedemptionStatus.USED },
    });

    // Notificar al usuario
    try {
      void this.notificationsService.sendNotification(
        redemption.userId,
        'Cupón Canjeado Exitosamente',
        `Has canjeado el cupón "${redemption.coupon.title}" en ${company.name}. ¡Gracias por ahorrar con BONOW!`,
        'REDEMPTION_CONFIRM',
        ['WHATSAPP', 'PUSH'],
      );
    } catch {
      // Silencioso
    }

    return {
      message: 'Cupón validado con éxito.',
      redemption: updated,
      user: redemption.user,
      coupon: redemption.coupon,
    };
  }

  async getBusinessRedemptions(userId: string) {
    const company = await this.prisma.company.findFirst({
      where: { ownerId: userId },
    });
    if (!company) {
      throw new NotFoundException('No se encontró una empresa asociada a tu cuenta.');
    }

    const redemptions = await this.prisma.couponRedemption.findMany({
      where: {
        coupon: {
          companyId: company.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        coupon: {
          select: {
            id: true,
            title: true,
            discount: true,
          },
        },
      },
      orderBy: {
        redeemedAt: 'desc',
      },
      take: 20,
    });

    return redemptions;
  }

  // Métodos de Administración: Aprobar y Rechazar Cupones
  async getAdminCoupons(statusFilter?: string) {
    const where: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    return this.prisma.coupon.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        category: true,
        branches: true,
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveCoupon(adminUserId: string, couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
      include: { company: true },
    });

    if (!coupon) {
      throw new NotFoundException('El cupón no existe.');
    }

    const updated = await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        status: CouponStatus.ACTIVE,
        rejectionReason: null,
      },
      include: {
        company: true,
        category: true,
        branches: true,
      },
    });

    // Notificar al dueño de la empresa sobre la aprobación
    try {
      void this.notificationsService.sendNotification(
        coupon.company.ownerId,
        '¡Tu cupón ha sido APROBADO!',
        `Tu cupón "${coupon.title}" ha sido aprobado por el administrador y ya está publicado para todos los usuarios.`,
        'COUPON_APPROVED',
        ['EMAIL', 'PUSH'],
      );

      // Notificar a usuarios que tienen la empresa en favoritos
      const favs = await this.prisma.favoriteCompany.findMany({
        where: { companyId: coupon.companyId },
        select: { userId: true },
      });
      for (const fav of favs) {
        void this.notificationsService.sendNotification(
          fav.userId,
          `Nuevo cupón en ${coupon.company.name}`,
          `Tu empresa favorita ha publicado un nuevo descuento: "${coupon.title}". ¡Aprovéchalo!`,
          'FAVORITE_COMPANY',
          ['EMAIL', 'PUSH'],
        );
      }
    } catch {
      // Silencioso
    }

    return updated;
  }

  async rejectCoupon(adminUserId: string, couponId: string, reason: string) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('Debes ingresar el motivo del rechazo.');
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
      include: { company: true },
    });

    if (!coupon) {
      throw new NotFoundException('El cupón no existe.');
    }

    const updated = await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        status: CouponStatus.REJECTED,
        rejectionReason: reason.trim(),
      },
      include: {
        company: true,
        category: true,
        branches: true,
      },
    });

    // Notificar a la empresa especificando el motivo de rechazo
    try {
      void this.notificationsService.sendNotification(
        coupon.company.ownerId,
        'Tu cupón ha sido RECHAZADO',
        `Tu cupón "${coupon.title}" no fue aprobado por la administración. Motivo de rechazo: "${reason.trim()}". Puedes modificarlo y volverlo a enviar.`,
        'COUPON_REJECTED',
        ['EMAIL', 'PUSH'],
      );
    } catch {
      // Silencioso
    }

    return updated;
  }

  async getCreditPackages() {
    const defaultPackages = [
      {
        id: 'pack-5',
        name: 'Paquete Básico (5 Cupones)',
        credits: 5,
        price: 199,
        popular: false,
        description: 'Ideal para pequeñas ofertas y promociones de temporada.',
      },
      {
        id: 'pack-10',
        name: 'Paquete Emprendedor (10 Cupones)',
        credits: 10,
        price: 349,
        popular: true,
        description: 'La opción recomendada para mantener ofertas activas todo el mes.',
      },
      {
        id: 'pack-20',
        name: 'Paquete Empresarial (20 Cupones)',
        credits: 20,
        price: 599,
        popular: false,
        description: 'Máximo valor y volumen para cadenas y marcas con alto catálogo.',
      },
    ];

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'COUPON_CREDIT_PACKAGES' },
    });

    if (!setting) return defaultPackages;
    try {
      const parsed = JSON.parse(setting.value);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultPackages;
    } catch {
      return defaultPackages;
    }
  }

  async updateCreditPackages(packages: any[]) {
    await this.prisma.systemSetting.upsert({
      where: { key: 'COUPON_CREDIT_PACKAGES' },
      update: { value: JSON.stringify(packages) },
      create: { key: 'COUPON_CREDIT_PACKAGES', value: JSON.stringify(packages) },
    });
    return packages;
  }

  async getCompanyCreditBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true },
    });

    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    const hasActiveMembership = user?.membership?.status === 'ACTIVE';
    const couponCredits = company?.couponCredits || 0;
    const packages = await this.getCreditPackages();

    return {
      hasActiveMembership,
      couponCredits,
      packages,
      isBusiness: !!company,
    };
  }

  async buyCreditPackage(userId: string, packageId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('Empresa no registrada.');
    }

    const packages = await this.getCreditPackages();
    const pkg = packages.find((p: any) => p.id === packageId) || packages[0];
    const creditsToAdd = pkg.credits || 5;

    const updated = await this.prisma.company.update({
      where: { id: company.id },
      data: {
        couponCredits: { increment: creditsToAdd },
      },
    });

    return {
      success: true,
      message: `¡Has adquirido con éxito el ${pkg.name}! Se han acreditado ${creditsToAdd} cupones/promociones a tu saldo.`,
      newBalance: updated.couponCredits,
    };
  }
}
