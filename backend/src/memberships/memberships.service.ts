import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseMembershipDto } from './dto/purchase-membership.dto';
import { MembershipType, MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  private getPlanDetails(type: MembershipType) {
    switch (type) {
      case MembershipType.MONTHLY:
        return { price: 149.0, months: 1 };
      case MembershipType.QUARTERLY:
        return { price: 399.0, months: 3 };
      case MembershipType.SEMESTERLY:
        return { price: 699.0, months: 6 };
      case MembershipType.ANNUAL:
        return { price: 1199.0, months: 12 };
      default:
        return { price: 0.0, months: 0 };
    }
  }

  async getActiveMembership(userId: string) {
    const membership = await this.prisma.userMembership.findUnique({
      where: { userId },
    });

    if (!membership) {
      return {
        membership: null,
        daysRemaining: 0,
        alertDays: null,
        isExpired: true,
      };
    }

    const now = new Date();
    const endDate = new Date(membership.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    // Determinar alertas
    let alertDays: number | null = null;
    if (daysRemaining <= 30 && daysRemaining > 0) {
      alertDays = daysRemaining;
    }

    const isExpired = now > endDate;

    // Auto-crear notificación si le quedan 5 días o menos
    if (daysRemaining <= 5 && daysRemaining > 0) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existingNotification = await this.prisma.notification.findFirst({
        where: {
          userId,
          type: 'MEMBERSHIP_EXPIRING',
          createdAt: { gte: startOfDay },
        },
      });

      if (!existingNotification) {
        try {
          await this.prisma.notification.create({
            data: {
              userId,
              title: 'Membresía por vencer ⚠️',
              message: `Tu membresía BONOW+ vencerá en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}. Recuerda realizar tu pago de ${membership.price} MXN para no perder tus beneficios.`,
              type: 'MEMBERSHIP_EXPIRING',
              channels: ['EMAIL', 'PUSH'],
              status: 'SENT',
            },
          });
        } catch (err) {
          console.error('Error al auto-crear notificación de vencimiento:', err);
        }
      }
    }

    return {
      membership,
      daysRemaining,
      alertDays,
      isExpired,
    };
  }

  async purchaseMembership(userId: string, dto: PurchaseMembershipDto) {
    const { price, months } = this.getPlanDetails(dto.type);

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // Consultar si tiene membresía activa actualmente
    const existing = await this.prisma.userMembership.findUnique({
      where: { userId },
    });

    if (existing && new Date(existing.endDate) > now) {
      // Extender a partir de la fecha de término existente
      startDate = new Date(existing.endDate);
      endDate = new Date(existing.endDate);
      endDate.setMonth(endDate.getMonth() + months);
    } else {
      // Comienza hoy
      endDate.setMonth(endDate.getMonth() + months);
    }

    // Crear o actualizar la membresía del usuario
    const membership = await this.prisma.userMembership.upsert({
      where: { userId },
      update: {
        type: dto.type,
        price,
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
      },
      create: {
        userId,
        type: dto.type,
        price,
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
      },
    });

    // Guardar transacción en el historial
    await this.prisma.membershipTransaction.create({
      data: {
        userId,
        type: dto.type,
        price,
        startDate,
        endDate,
      },
    });

    return membership;
  }

  async getTransactionHistory(userId: string) {
    return this.prisma.membershipTransaction.findMany({
      where: { userId },
      orderBy: { paidAt: 'desc' },
    });
  }
}
