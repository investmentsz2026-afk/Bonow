import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserMetrics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteCategories: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const redemptionsCount = await this.prisma.couponRedemption.count({
      where: {
        userId,
        status: 'USED',
      },
    });

    return {
      couponsUsed: redemptionsCount,
      accumulatedSavings: Number(user.accumulatedSavings),
      favoriteCategories: user.favoriteCategories.map((c) => c.name),
    };
  }

  async getBusinessMetrics(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      return {
        couponsUsed: 0,
        uniqueUsers: 0,
        topCoupons: [],
        trends: [],
      };
    }

    const couponsUsed = await this.prisma.couponRedemption.count({
      where: {
        coupon: { companyId: company.id },
        status: 'USED',
      },
    });

    const uniqueUsersGroup = await this.prisma.couponRedemption.groupBy({
      by: ['userId'],
      where: {
        coupon: { companyId: company.id },
        status: 'USED',
      },
    });
    const uniqueUsers = uniqueUsersGroup.length;

    const topCoupons = await this.prisma.coupon.findMany({
      where: { companyId: company.id },
      orderBy: { usageCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        discount: true,
        usageCount: true,
      },
    });

    const redemptions = await this.prisma.couponRedemption.findMany({
      where: {
        coupon: { companyId: company.id },
        status: 'USED',
      },
      select: { redeemedAt: true },
    });

    const monthlyGroups: Record<string, number> = {};
    const monthsName = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthsName[d.getMonth()]} ${String(d.getFullYear()).substring(2)}`;
      monthlyGroups[label] = 0;
    }

    redemptions.forEach((r) => {
      const date = new Date(r.redeemedAt);
      const label = `${monthsName[date.getMonth()]} ${String(date.getFullYear()).substring(2)}`;
      if (monthlyGroups[label] !== undefined) {
        monthlyGroups[label]++;
      }
    });

    const trends = Object.keys(monthlyGroups).map((key) => ({
      label: key,
      value: monthlyGroups[key],
    }));

    return {
      couponsUsed,
      uniqueUsers,
      topCoupons,
      trends,
    };
  }

  async getAdminMetrics() {
    const activeUsers = await this.prisma.user.count({
      where: { status: 'ACTIVE' },
    });

    const companies = await this.prisma.company.count();

    const couponsUsed = await this.prisma.couponRedemption.count({
      where: { status: 'USED' },
    });

    const activeMemberships = await this.prisma.userMembership.count({
      where: { status: 'ACTIVE' },
    });

    const revenueAgg = await this.prisma.membershipTransaction.aggregate({
      _sum: { price: true },
    });
    const totalRevenue = Number(revenueAgg._sum.price || 0);

    const transactions = await this.prisma.membershipTransaction.findMany({
      select: { price: true, paidAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    const monthsName = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthsName[d.getMonth()]} ${String(d.getFullYear()).substring(2)}`;
      monthlyRevenue[label] = 0;
    }

    transactions.forEach((tx) => {
      const date = new Date(tx.paidAt);
      const label = `${monthsName[date.getMonth()]} ${String(date.getFullYear()).substring(2)}`;
      if (monthlyRevenue[label] !== undefined) {
        monthlyRevenue[label] += Number(tx.price);
      }
    });

    const trends = Object.keys(monthlyRevenue).map((key) => ({
      label: key,
      value: monthlyRevenue[key],
    }));

    return {
      activeUsers,
      companies,
      couponsUsed,
      activeMemberships,
      totalRevenue,
      trends,
    };
  }

  async getAdminPlatformReports(query: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    status?: string;
    search?: string;
  }) {
    const searchFilter = query.search ? query.search.toLowerCase().trim() : '';

    // 1. Resumen General
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({ where: { status: 'ACTIVE' } });
    const totalCompanies = await this.prisma.company.count();
    const approvedCompanies = await this.prisma.company.count({ where: { status: 'APPROVED' } });
    const pendingCompanies = await this.prisma.company.count({ where: { status: 'PENDING' } });
    const totalCoupons = await this.prisma.coupon.count();
    const activeCoupons = await this.prisma.coupon.count({ where: { status: 'ACTIVE' } });
    const totalRedemptions = await this.prisma.couponRedemption.count({ where: { status: 'USED' } });

    // Ingresos por Membresías + Créditos
    const membershipRev = await this.prisma.membershipTransaction.aggregate({ _sum: { price: true } });
    const paymentRev = await this.prisma.payment.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true },
    });

    const totalRevenue = Number(membershipRev._sum.price || 0) + Number(paymentRev._sum.amount || 0);
    const activeMemberships = await this.prisma.userMembership.count({ where: { status: 'ACTIVE' } });
    const avgTicket = activeMemberships > 0 ? (totalRevenue / activeMemberships).toFixed(2) : '0.00';

    // 2. Reporte de Empresas
    const companyWhere: any = {};
    if (query.status) companyWhere.status = query.status;
    if (query.categoryId) companyWhere.categoryId = query.categoryId;
    if (searchFilter) {
      companyWhere.OR = [
        { name: { contains: searchFilter, mode: 'insensitive' } },
        { corporateName: { contains: searchFilter, mode: 'insensitive' } },
      ];
    }

    const rawCompanies = await this.prisma.company.findMany({
      where: companyWhere,
      select: {
        id: true,
        name: true,
        corporateName: true,
        status: true,
        isFeatured: true,
        couponCredits: true,
        createdAt: true,
        owner: { select: { email: true, firstName: true, lastName: true } },
        category: { select: { name: true } },
        branches: { select: { id: true } },
        coupons: { select: { id: true, usageCount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const companies = rawCompanies.map((c) => ({
      id: c.id,
      name: c.name,
      corporateName: c.corporateName || c.name,
      ownerEmail: c.owner?.email || 'N/A',
      ownerName: c.owner ? `${c.owner.firstName || ''} ${c.owner.lastName || ''}`.trim() : 'N/A',
      categoryName: c.category?.name || 'General',
      status: c.status,
      isFeatured: c.isFeatured,
      couponCredits: c.couponCredits,
      branchesCount: c.branches.length,
      couponsCount: c.coupons.length,
      totalRedemptions: c.coupons.reduce((sum: number, item: { usageCount: number }) => sum + item.usageCount, 0),
      createdAt: c.createdAt,
    }));

    // 3. Reporte de Usuarios
    const userWhere: any = {};
    if (query.status) userWhere.status = query.status;
    if (searchFilter) {
      userWhere.OR = [
        { firstName: { contains: searchFilter, mode: 'insensitive' } },
        { lastName: { contains: searchFilter, mode: 'insensitive' } },
        { email: { contains: searchFilter, mode: 'insensitive' } },
      ];
    }

    const rawUsers = await this.prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        accumulatedSavings: true,
        createdAt: true,
        roles: { select: { name: true } },
        membership: { select: { type: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const users = rawUsers.map((u) => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      phone: u.phone || 'N/A',
      status: u.status,
      roles: u.roles.map((r) => r.name),
      membershipType: u.membership?.type || 'Ninguna',
      membershipStatus: u.membership?.status || 'INACTIVE',
      accumulatedSavings: Number(u.accumulatedSavings || 0),
      createdAt: u.createdAt,
    }));

    // 4. Reporte de Cupones y Canjes
    const couponWhere: any = {};
    if (query.categoryId) couponWhere.categoryId = query.categoryId;
    if (searchFilter) {
      couponWhere.OR = [
        { title: { contains: searchFilter, mode: 'insensitive' } },
        { company: { name: { contains: searchFilter, mode: 'insensitive' } } },
      ];
    }

    const rawCoupons = await this.prisma.coupon.findMany({
      where: couponWhere,
      select: {
        id: true,
        title: true,
        discount: true,
        type: true,
        status: true,
        usageLimit: true,
        usageCount: true,
        startDate: true,
        endDate: true,
        company: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { usageCount: 'desc' },
      take: 100,
    });

    const coupons = rawCoupons.map((cp) => ({
      id: cp.id,
      title: cp.title,
      discount: cp.discount,
      companyName: cp.company?.name || 'Sistema BONOW',
      categoryName: cp.category?.name || 'General',
      type: cp.type,
      status: cp.status,
      usageLimit: cp.usageLimit,
      usageCount: cp.usageCount,
      startDate: cp.startDate,
      endDate: cp.endDate,
    }));

    // 5. Reporte de Publicidad
    const rawAds = await this.prisma.advertising.findMany({
      select: {
        id: true,
        title: true,
        position: true,
        views: true,
        clicks: true,
        status: true,
        startDate: true,
        endDate: true,
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const ads = rawAds.map((ad) => ({
      id: ad.id,
      title: ad.title,
      companyName: ad.company?.name || 'General',
      position: ad.position,
      impressions: ad.views,
      clicks: ad.clicks,
      status: ad.status,
      startDate: ad.startDate,
      endDate: ad.endDate,
    }));

    // 6. Reporte Financiero / Pagos
    const rawPayments = await this.prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        planType: true,
        provider: true,
        status: true,
        providerTxId: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const transactions = rawPayments.map((p) => ({
      id: p.id,
      userName: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Usuario',
      userEmail: p.user?.email || 'N/A',
      amount: Number(p.amount),
      planType: p.planType,
      provider: p.provider,
      status: p.status,
      providerTxId: p.providerTxId || p.id,
      createdAt: p.createdAt,
    }));

    // Categorías para filtro
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return {
      summary: {
        totalUsers,
        activeUsers,
        totalCompanies,
        approvedCompanies,
        pendingCompanies,
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalRevenue,
        avgTicket,
        activeMemberships,
      },
      companies,
      users,
      coupons,
      ads,
      transactions,
      categories,
    };
  }
}
