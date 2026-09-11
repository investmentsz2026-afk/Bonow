import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ScoredCoupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string | null;
  conditions: string | null;
  type: string;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  branches: {
    name: string;
    city: string;
    latitude: number;
    longitude: number;
  }[];
  score: number;
}

@Injectable()
export class PersonalizationService {
  constructor(private prisma: PrismaService) {}

  // ─── Favoritos de Empresa ───

  async toggleFavoriteCompany(userId: string, companyId: string) {
    const existing = await this.prisma.favoriteCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (existing) {
      await this.prisma.favoriteCompany.delete({
        where: { userId_companyId: { userId, companyId } },
      });
      return { favorited: false };
    }

    await this.prisma.favoriteCompany.create({
      data: { userId, companyId },
    });
    return { favorited: true };
  }

  async getFavoriteCompanies(userId: string) {
    return this.prisma.favoriteCompany.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            description: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isCompanyFavorited(userId: string, companyId: string) {
    const fav = await this.prisma.favoriteCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    return { favorited: !!fav };
  }

  // ─── Favoritos de Cupón ───

  async toggleFavoriteCoupon(userId: string, couponId: string) {
    const existing = await this.prisma.favoriteCoupon.findUnique({
      where: { userId_couponId: { userId, couponId } },
    });

    if (existing) {
      await this.prisma.favoriteCoupon.delete({
        where: { userId_couponId: { userId, couponId } },
      });
      return { favorited: false };
    }

    await this.prisma.favoriteCoupon.create({
      data: { userId, couponId },
    });
    return { favorited: true };
  }

  async getFavoriteCoupons(userId: string) {
    const favorites = await this.prisma.favoriteCoupon.findMany({
      where: { userId },
      include: {
        coupon: {
          include: {
            company: { select: { name: true, logoUrl: true } },
            category: true,
            branches: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.coupon).filter(Boolean);
  }

  async getFavoriteCouponIds(userId: string) {
    const favorites = await this.prisma.favoriteCoupon.findMany({
      where: { userId },
      select: { couponId: true },
    });
    return favorites.map((f) => f.couponId);
  }

  // ─── Historial de Búsquedas ───

  async recordSearch(userId: string, query: string) {
    if (!query || query.trim().length === 0) return;

    return this.prisma.searchHistory.create({
      data: { userId, query: query.trim() },
    });
  }

  async getSearchHistory(userId: string) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: 20,
    });
  }

  // ─── Historial de Visualizaciones ───

  async recordView(userId: string | null, couponId: string) {
    return this.prisma.couponView.create({
      data: { userId, couponId },
    });
  }

  // ─── Motor de Recomendaciones Heurístico ───

  async getRecommendations(
    userId: string,
    lat?: number,
    lng?: number,
  ): Promise<ScoredCoupon[]> {
    if (!userId) return [];

    // 1. Obtener las preferencias del usuario en paralelo
    const [
      favoriteCompanyIds,
      favoriteCategoryIds,
      viewedCategoryIds,
      redeemedCompanyIds,
    ] = await Promise.all([
      // Empresas favoritas
      this.prisma.favoriteCompany
        .findMany({
          where: { userId },
          select: { companyId: true },
        })
        .then((rows) => rows.map((r) => r.companyId)),

      // Categorías favoritas del perfil
      this.prisma.user
        .findUnique({
          where: { id: userId },
          select: { favoriteCategories: { select: { id: true } } },
        })
        .then((u) => u?.favoriteCategories.map((c) => c.id) || []),

      // Categorías visualizadas recientemente (últimos 30 días)
      this.prisma.couponView
        .findMany({
          where: {
            userId,
            viewedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            coupon: { select: { categoryId: true } },
          },
          distinct: ['couponId'],
        })
        .then((rows) =>
          Array.from(new Set(rows.map((r) => r.coupon.categoryId))),
        ),

      // Empresas donde ya redimió cupones
      this.prisma.couponRedemption
        .findMany({
          where: { userId },
          include: {
            coupon: { select: { companyId: true } },
          },
          distinct: ['couponId'],
        })
        .then((rows) =>
          Array.from(new Set(rows.map((r) => r.coupon.companyId))),
        ),
    ]);

    // 2. Obtener cupones activos con sus relaciones
    const activeCoupons = await this.prisma.coupon.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: new Date() },
        startDate: { lte: new Date() },
      },
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true },
        },
        category: {
          select: { id: true, name: true },
        },
        branches: {
          select: { name: true, city: true, latitude: true, longitude: true },
        },
      },
      take: 100,
    });

    // 3. Calcular puntuación para cada cupón
    const scored: ScoredCoupon[] = activeCoupons.map((coupon) => {
      let score = 0;

      // +10 si la empresa está en favoritos
      if (favoriteCompanyIds.includes(coupon.companyId)) {
        score += 10;
      }

      // +5 si la categoría está en favoritas del perfil
      if (favoriteCategoryIds.includes(coupon.categoryId)) {
        score += 5;
      }

      // +3 si la categoría fue visualizada previamente
      if (viewedCategoryIds.includes(coupon.categoryId)) {
        score += 3;
      }

      // +2 si el usuario ya redimió de esta empresa
      if (redeemedCompanyIds.includes(coupon.companyId)) {
        score += 2;
      }

      // +5 si alguna sucursal está dentro de 10km del usuario
      if (lat !== undefined && lng !== undefined) {
        const isNearby = coupon.branches.some((b) => {
          const dist = this.haversineDistance(
            lat,
            lng,
            b.latitude,
            b.longitude,
          );
          return dist <= 10;
        });
        if (isNearby) {
          score += 5;
        }
      }

      return {
        id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        discount: coupon.discount,
        imageUrl: coupon.imageUrl,
        conditions: coupon.conditions,
        type: coupon.type,
        company: coupon.company,
        category: coupon.category,
        branches: coupon.branches,
        score,
      };
    });

    // 4. Ordenar por puntuación descendente y retornar los top 12
    return scored
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }

  // ─── Utilidades ───

  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
