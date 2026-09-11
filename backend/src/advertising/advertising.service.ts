import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { AdStatus } from '@prisma/client';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdvertisingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createAd(dto: CreateAdDto) {
    const { companyId, ...data } = dto;

    const startDate = new Date(dto.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dto.endDate);
    endDate.setHours(23, 59, 59, 999);

    const adData: any = {
      ...data,
      startDate,
      endDate,
    };

    if (companyId) {
      adData.company = { connect: { id: companyId } };
    }

    const createdAd = await this.prisma.advertising.create({
      data: adData,
      include: { company: true },
    });

    // Broadcast system notification
    try {
      void this.notificationsService.broadcastNotification(
        `📢 ${createdAd.title}`,
        createdAd.description || '¡Checa la nueva promoción destacada en BONOW!',
        'PROMOTION',
        ['PUSH'],
      );
    } catch {
      // Silencioso
    }

    return createdAd;
  }

  async updateAd(id: string, dto: CreateAdDto) {
    const ad = await this.prisma.advertising.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Anuncio no encontrado.');

    const { companyId, ...data } = dto;

    const startDate = new Date(dto.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dto.endDate);
    endDate.setHours(23, 59, 59, 999);

    const adData: any = {
      ...data,
      startDate,
      endDate,
    };

    if (companyId) {
      adData.company = { connect: { id: companyId } };
    } else {
      adData.company = { disconnect: true };
    }

    return this.prisma.advertising.update({
      where: { id },
      data: adData,
      include: { company: true },
    });
  }

  async deleteAd(id: string) {
    const ad = await this.prisma.advertising.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Anuncio no encontrado.');

    await this.prisma.advertising.delete({ where: { id } });
    return { message: 'Anuncio eliminado con éxito.' };
  }

  async updateAdStatus(id: string, status: AdStatus) {
    const ad = await this.prisma.advertising.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!ad) throw new NotFoundException('Anuncio no encontrado.');

    const updated = await this.prisma.advertising.update({
      where: { id },
      data: { status },
      include: { company: true },
    });

    if (status === AdStatus.ACTIVE && ad.company?.ownerId) {
      try {
        void this.notificationsService.sendNotification(
          ad.company.ownerId,
          '🎉 ¡Tu Promoción ha sido Aprobada!',
          `Tu promoción "${ad.title}" fue aprobada por el Administrador y ya está en vivo en la sección de Promociones.`,
          'PROMOTION_APPROVED',
          ['EMAIL', 'PUSH'],
        );
      } catch {
        // Silencioso
      }
    }

    return updated;
  }

  async toggleAdFeatured(id: string) {
    const ad = await this.prisma.advertising.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Anuncio / Promoción no encontrada.');

    return this.prisma.advertising.update({
      where: { id },
      data: { isFeatured: !ad.isFeatured },
      include: { company: true },
    });
  }

  async getActiveAds() {
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return this.prisma.advertising.findMany({
      where: {
        status: AdStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: startOfToday },
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAds() {
    return this.prisma.advertising.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordClick(id: string) {
    const ad = await this.prisma.advertising.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Anuncio no encontrado.');

    return this.prisma.advertising.update({
      where: { id },
      data: {
        clicks: { increment: 1 },
      },
    });
  }

  async recordViews(ids: string[]) {
    if (ids.length === 0) return { count: 0 };

    return this.prisma.advertising.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        views: { increment: 1 },
      },
    });
  }

  async createBusinessAd(userId: string, dto: any) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });
    if (!company) {
      throw new NotFoundException('Empresa no registrada para este usuario.');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    endDate.setHours(23, 59, 59, 999);

    const createdAd = await this.prisma.advertising.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        imageUrl:
          dto.imageUrl ||
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        linkUrl: dto.linkUrl || '/coupons',
        adType: dto.category || dto.adType || 'PROMO',
        position: dto.position || 'PROMOTIONS_PAGE',
        status: AdStatus.INACTIVE, // Requiere aprobación por admin
        companyId: company.id,
        startDate,
        endDate,
      },
      include: { company: true },
    });

    // Notificar a todos los administradores
    try {
      const admins = await this.prisma.user.findMany({
        where: { roles: { some: { name: 'ADMIN' } } },
        select: { id: true },
      });
      for (const admin of admins) {
        void this.notificationsService.sendNotification(
          admin.id,
          '📢 Promoción de Empresa Pendiente',
          `La empresa "${company.name}" ha enviado la promoción "${dto.title}" para su revisión y aprobación.`,
          'PROMOTION_PENDING',
          ['EMAIL', 'PUSH'],
        );
      }
    } catch {
      // Silencioso
    }

    return createdAd;
  }

  async getBusinessAds(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });
    if (!company) return [];

    return this.prisma.advertising.findMany({
      where: { companyId: company.id },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
