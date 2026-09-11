import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Métricas Globales (Dashboard) ───
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalCompanies,
      pendingCompanies,
      totalCoupons,
      activeCoupons,
      totalRedemptions,
      totalMemberships,
      totalPayments,
      totalEarnings,
      recentRedemptions,
      monthlyMemberships,
      quarterlyMemberships,
      semesterlyMemberships,
      annualMemberships,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: 'PENDING' } }),
      this.prisma.coupon.count(),
      this.prisma.coupon.count({ where: { status: 'ACTIVE' } }),
      this.prisma.couponRedemption.count(),
      this.prisma.userMembership.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.count(),
      this.prisma.payment.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
      this.prisma.couponRedemption.findMany({
        take: 5,
        orderBy: { redeemedAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          coupon: {
            select: { title: true, company: { select: { name: true } } },
          },
        },
      }),
      this.prisma.userMembership.count({ where: { status: 'ACTIVE', type: 'MONTHLY' } }),
      this.prisma.userMembership.count({ where: { status: 'ACTIVE', type: 'QUARTERLY' } }),
      this.prisma.userMembership.count({ where: { status: 'ACTIVE', type: 'SEMESTERLY' } }),
      this.prisma.userMembership.count({ where: { status: 'ACTIVE', type: 'ANNUAL' } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { firstName: true, lastName: true, createdAt: true, email: true },
      }),
    ]);

    // Format real recent activities
    const realActivities: { text: string; desc: string; time: string }[] = [];
    
    // Add redemptions to activity
    recentRedemptions.slice(0, 3).forEach((red) => {
      realActivities.push({
        text: 'Cupón utilizado',
        desc: `${red.user.firstName || ''} ${red.user.lastName || ''}`.trim() || red.user.email,
        time: red.redeemedAt.toISOString(),
      });
    });

    // Add registrations to activity
    recentUsers.slice(0, 3).forEach((u) => {
      realActivities.push({
        text: 'Nuevo usuario registrado',
        desc: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        time: u.createdAt.toISOString(),
      });
    });

    // Sort combined activities by date desc
    realActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return {
      stats: {
        totalUsers,
        activeUsers,
        totalCompanies,
        pendingCompanies,
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalMemberships,
        totalPayments,
        totalEarningsMXN: totalEarnings._sum.amount
          ? Number(totalEarnings._sum.amount)
          : 0,
        plans: {
          monthly: monthlyMemberships,
          quarterly: quarterlyMemberships,
          semesterly: semesterlyMemberships,
          annual: annualMemberships,
        }
      },
      recentRedemptions,
      recentActivities: realActivities.slice(0, 5),
    };
  }

  // ─── Gestión de Usuarios ───
  async getUsers(
    search?: string,
    role?: string,
    status?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.roles = {
        some: {
          name: role,
        },
      };
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          city: true,
          state: true,
          createdAt: true,
          roles: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateUserStatus(userId: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, email: true, status: true },
    });
  }

  async bulkUpdateUserStatus(userIds: string[], status: string) {
    return this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { status },
    });
  }

  // ─── Gestión de Cupones ───
  async getCoupons(
    search?: string,
    categoryId?: string,
    status?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logoUrl: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async bulkUpdateCouponStatus(
    couponIds: string[],
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.prisma.coupon.updateMany({
      where: { id: { in: couponIds } },
      data: { status },
    });
  }

  // ─── Gestión de Membresías ───
  async getMemberships(search?: string, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.userMembership.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userMembership.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ─── Gestión de Pagos ───
  async getPayments(search?: string, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { providerTxId: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async refundPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });
  }

  async updatePaymentStatus(paymentId: string, status: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: status as any },
    });

    if (status === 'APPROVED') {
      try {
        const durationDays =
          payment.planType === 'MONTHLY'
            ? 30
            : payment.planType === 'QUARTERLY'
              ? 90
              : payment.planType === 'SEMESTERLY'
                ? 180
                : 365;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        await this.prisma.userMembership.upsert({
          where: { userId: payment.userId },
          create: {
            userId: payment.userId,
            type: payment.planType,
            price: payment.amount,
            startDate,
            endDate,
            status: 'ACTIVE',
          },
          update: {
            type: payment.planType,
            price: payment.amount,
            startDate,
            endDate,
            status: 'ACTIVE',
          },
        });
      } catch {
        // Silencioso
      }
    }

    return updated;
  }

  // ─── CRUD Categorías ───
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

  async createCategory(name: string, icon?: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return this.prisma.category.create({
      data: { name, slug, icon },
    });
  }

  async updateCategory(id: string, name: string, icon?: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return this.prisma.category.update({
      where: { id },
      data: { name, slug, icon },
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  // ─── CRUD Noticias ───
  async getNews() {
    return this.prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNews(dto: {
    title: string;
    content: string;
    imageUrl?: string;
    author?: string;
    status?: string;
  }) {
    return this.prisma.news.create({
      data: {
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl || null,
        author: dto.author || null,
        status: dto.status || 'DRAFT',
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  async updateNews(
    id: string,
    dto: {
      title: string;
      content: string;
      imageUrl?: string;
      author?: string;
      status?: string;
    },
  ) {
    const updateData: any = {
      title: dto.title,
      content: dto.content,
      imageUrl: dto.imageUrl || null,
      author: dto.author || null,
      status: dto.status || 'DRAFT',
    };
    if (dto.status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }
    return this.prisma.news.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteNews(id: string) {
    return this.prisma.news.delete({ where: { id } });
  }

  // ─── CRUD Configuración ───
  async getSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSetting(key: string, value: string, description?: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value, description },
      update: { value, description },
    });
  }

  // ─── Tarjetas Virtuales ───
  async getVirtualCards(
    search?: string,
    status?: string,
    cardType?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { cardNumber: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (cardType) {
      where.cardType = cardType;
    }

    const [items, total] = await Promise.all([
      this.prisma.virtualCard.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.virtualCard.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async generateVirtualCards(
    count: number,
    cardType: 'DIGITAL' | 'PHYSICAL' = 'DIGITAL',
    prefix?: string,
    price = 0.0,
  ) {
    const actualPrefix = prefix || (cardType === 'PHYSICAL' ? 'BONOW-PHY-' : 'BONOW-DIG-');
    const cards = [];
    for (let i = 0; i < count; i++) {
      const uniqueCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
      const cardNumber = `${actualPrefix}${uniqueCode.slice(0, 4)}-${uniqueCode.slice(4)}`;
      cards.push({
        cardNumber,
        cardType,
        status: 'AVAILABLE',
        price,
      });
    }

    await this.prisma.virtualCard.createMany({
      data: cards,
      skipDuplicates: true,
    });

    return {
      count,
      message: `Se han generado ${count} tarjetas ${cardType === 'PHYSICAL' ? 'físicas' : 'digitales'} con éxito.`,
    };
  }

  async updateVirtualCardPrice(id: string, price: number) {
    const card = await this.prisma.virtualCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('La tarjeta no existe.');
    }

    if (card.status === 'REGISTERED') {
      throw new BadRequestException(
        'No se puede editar el precio de una tarjeta que ya ha sido vendida / registrada.',
      );
    }

    return this.prisma.virtualCard.update({
      where: { id },
      data: { price },
    });
  }

  async deleteVirtualCard(id: string) {
    const card = await this.prisma.virtualCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('La tarjeta no existe.');
    }

    if (card.status === 'REGISTERED') {
      throw new BadRequestException(
        'No se puede eliminar una tarjeta que ya ha sido vendida / registrada.',
      );
    }

    await this.prisma.virtualCard.delete({
      where: { id },
    });

    return { message: 'Tarjeta eliminada exitosamente.' };
  }

  // ─── CRUD Sucursales / Mapa (Admin) ───
  async getAdminBranches() {
    return this.prisma.branch.findMany({
      include: {
        categories: { select: { id: true, name: true, slug: true } },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        coupons: {
          select: { id: true, title: true, discount: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdminBranch(data: {
    companyId: string;
    name: string;
    address: string;
    state: string;
    city: string;
    latitude: number;
    longitude: number;
    schedules?: string;
    categoryIds?: string[];
  }) {
    const company = await this.prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new NotFoundException('La empresa especificada no existe.');
    }

    const { categoryIds, ...branchData } = data;

    return this.prisma.branch.create({
      data: {
        ...branchData,
        schedules: branchData.schedules || null,
        categories: categoryIds && categoryIds.length > 0
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { categories: true, company: true },
    });
  }

  async updateAdminBranch(
    branchId: string,
    data: {
      companyId?: string;
      name?: string;
      address?: string;
      state?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      schedules?: string;
      categoryIds?: string[];
    },
  ) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('La sucursal no existe.');
    }

    const { categoryIds, ...updateData } = data;

    return this.prisma.branch.update({
      where: { id: branchId },
      data: {
        ...updateData,
        categories: categoryIds
          ? { set: categoryIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { categories: true, company: true },
    });
  }

  async deleteAdminBranch(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('La sucursal no existe.');
    }

    await this.prisma.branch.delete({
      where: { id: branchId },
    });

    return { message: 'Sucursal eliminada exitosamente.' };
  }
}
