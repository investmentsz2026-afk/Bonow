import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeolocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearbyBranches(
    lat: number,
    lng: number,
    radiusKm = 10,
    categoryId?: string,
    search?: string,
  ) {
    const whereClause: any = {};

    if (categoryId && categoryId.trim() !== '') {
      whereClause.OR = [
        { categories: { some: { id: categoryId } } },
        { company: { categoryId: categoryId } },
      ];
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      const searchFilter = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { company: { name: { contains: q, mode: 'insensitive' } } },
      ];
      if (whereClause.OR) {
        whereClause.AND = [{ OR: searchFilter }];
      } else {
        whereClause.OR = searchFilter;
      }
    }

    const branches = await this.prisma.branch.findMany({
      where: whereClause,
      include: {
        categories: { select: { id: true, name: true, slug: true } },
        company: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            coupons: {
              where: { status: 'ACTIVE' },
              select: { id: true, title: true, discount: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const calcDistance = (bLat: number, bLng: number) => {
      const R = 6371;
      const dLat = ((bLat - lat) * Math.PI) / 180;
      const dLng = ((bLng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((bLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Number((R * c).toFixed(2));
    };

    let mapped = branches.map((b) => {
      const branchCategories = b.categories || [];
      const mainCategory = b.company?.category;
      const allCategoryNames = Array.from(
        new Set([
          ...branchCategories.map((c) => c.name),
          ...(mainCategory ? [mainCategory.name] : []),
        ]),
      );
      const primaryCategory = allCategoryNames[0] || 'General';

      return {
        id: b.id,
        name: b.name,
        address: b.address,
        state: b.state,
        city: b.city,
        municipality: b.municipality,
        zipCode: b.zipCode,
        latitude: b.latitude,
        longitude: b.longitude,
        schedules: b.schedules,
        companyId: b.companyId,
        companyName: b.company?.name || 'Comercio',
        companyLogo: b.company?.logoUrl || null,
        companyPhone: b.company?.phone || null,
        categoryName: primaryCategory,
        categoryNames: allCategoryNames,
        categories: branchCategories,
        categoryId: mainCategory?.id || (branchCategories[0]?.id ?? null),
        couponsCount: b.company?.coupons?.length || 0,
        coupons: b.company?.coupons || [],
        distance: calcDistance(b.latitude, b.longitude),
      };
    });

    if (radiusKm > 0 && radiusKm < 1000) {
      const withinRadius = mapped.filter((b) => b.distance <= radiusKm);
      if (withinRadius.length > 0) {
        mapped = withinRadius;
      }
    }

    mapped.sort((a, b) => a.distance - b.distance);
    return mapped;
  }
}
