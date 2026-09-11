import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    channels: string[],
  ) {
    // 1. Obtener preferencias del usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        emailNotifications: true,
        pushNotifications: true,
      },
    });

    if (!user) {
      this.logger.error(`Usuario con ID ${userId} no encontrado.`);
      return;
    }

    const activeChannels: string[] = [];

    // 2. Evaluar canales según preferencias del usuario y simular envío
    for (const channel of channels) {
      if (channel === 'EMAIL') {
        if (user.emailNotifications) {
          activeChannels.push('EMAIL');
          this.logger.log(`
            [MOCK EMAIL SENT]
            Para: ${user.email}
            Asunto: ${title}
            Mensaje: ${message}
            ------------------------------------------------
            BONOW - Tu recompensa, ahora. - 2026
          `);
        } else {
          this.logger.warn(
            `Notificaciones por EMAIL desactivadas por el usuario.`,
          );
        }
      }

      if (channel === 'PUSH') {
        if (user.pushNotifications) {
          activeChannels.push('PUSH');
          this.logger.log(`
            [MOCK PUSH SENT]
            Dispositivo de usuario: ${user.id}
            Título: ${title}
            Cuerpo: ${message}
          `);
        } else {
          this.logger.warn(`Notificaciones PUSH desactivadas por el usuario.`);
        }
      }

      if (channel === 'WHATSAPP') {
        // WhatsApp se considera canal crítico o habilitado por defecto si tiene teléfono
        if (user.phone) {
          activeChannels.push('WHATSAPP');
          this.logger.log(`
            [MOCK WHATSAPP SENT]
            Para: +52 ${user.phone}
            Mensaje: 🟢 *${title}* \n${message} \n\n_ BONOW - Tu recompensa, ahora._
          `);
        } else {
          this.logger.warn(
            `No se pudo enviar WHATSAPP: El usuario no tiene teléfono.`,
          );
        }
      }
    }

    // 3. Registrar en base de datos si al menos un canal fue enviado
    if (activeChannels.length > 0) {
      return this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          channels: activeChannels,
          status: 'SENT',
        },
      });
    }
  }

  async getMyNotifications(userId: string) {
    if (!userId) return [];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roles: { select: { name: true } },
      },
    });

    if (!user) return [];

    const userRoles = user.roles.map((r) => r.name);
    const isAdmin = userRoles.includes('ADMIN');
    const adminOnlyTypes = [
      'COUPON_PENDING',
      'PROMOTION_PENDING',
      'COMPANY_PENDING',
    ];

    if (!isAdmin) {
      return this.prisma.notification.findMany({
        where: {
          userId,
          type: { notIn: adminOnlyTypes },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUserNotifications(userId: string) {
    if (!userId) return [];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roles: { select: { name: true } },
      },
    });

    if (!user) return [];

    const userRoles = user.roles.map((r) => r.name);
    const isAdmin = userRoles.includes('ADMIN');
    const adminOnlyTypes = [
      'COUPON_PENDING',
      'PROMOTION_PENDING',
      'COMPANY_PENDING',
    ];

    if (!isAdmin) {
      return this.prisma.notification.findMany({
        where: {
          userId,
          type: { notIn: adminOnlyTypes },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async broadcastNotification(
    title: string,
    message: string,
    type = 'PROMOTION',
    channels: string[] = ['PUSH'],
  ) {
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    if (users.length === 0) return;

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        message,
        type,
        channels,
        status: 'SENT',
      })),
    });
  }

  async markAsRead(id: string, userId: string) {
    if (!userId || !id) return;

    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { status: 'READ' },
    });
  }

  async markAllAsRead(userId: string) {
    if (!userId) return;

    return this.prisma.notification.updateMany({
      where: { userId },
      data: { status: 'READ' },
    });
  }
}
