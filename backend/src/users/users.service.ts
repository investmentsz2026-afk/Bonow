import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MembershipType, MembershipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HashingService } from '../auth/hashing.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        phone: true,
        city: true,
        state: true,
        emailNotifications: true,
        pushNotifications: true,
        accumulatedSavings: true,
        membership: true,
        virtualCard: true,
        favoriteCategories: true,
        roles: { select: { name: true } },
        company: { select: { id: true, name: true, logoUrl: true } },
        createdAt: true,
        _count: {
          select: {
            redemptions: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { favoriteCategories, ...data } = dto;

    const updateData: any = { ...data };

    if (favoriteCategories) {
      // Conectar categorías favoritas por nombre (que es único)
      updateData.favoriteCategories = {
        set: favoriteCategories.map((name) => ({ name })),
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        phone: true,
        city: true,
        state: true,
        favoriteCategories: true,
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isMatch = await this.hashingService.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const newHashedPassword = await this.hashingService.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    return { message: 'Contraseña cambiada exitosamente' };
  }

  async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        emailNotifications: true,
        pushNotifications: true,
      },
    });
    return updated;
  }

  async linkCard(userId: string, cardNumber: string) {
    if (!cardNumber || !cardNumber.trim()) {
      throw new BadRequestException('Por favor ingrese el número de tarjeta');
    }

    const cleanCardNumber = cardNumber.trim();

    const card = await this.prisma.virtualCard.findFirst({
      where: {
        cardNumber: {
          equals: cleanCardNumber,
          mode: 'insensitive',
        },
      },
    });

    if (!card) {
      throw new BadRequestException(
        'El número de tarjeta ingresado no existe o no es válido.',
      );
    }

    if (card.status !== 'AVAILABLE') {
      throw new BadRequestException(
        'Esta tarjeta ya ha sido registrada en otra cuenta o no está disponible.',
      );
    }

    const existingUserCard = await this.prisma.virtualCard.findUnique({
      where: { userId },
    });
    if (existingUserCard) {
      await this.prisma.virtualCard.update({
        where: { id: existingUserCard.id },
        data: { userId: null, status: 'AVAILABLE' },
      });
    }

    const cardPrice = Number(card.price) || 0;
    const updatedCard = await this.prisma.virtualCard.update({
      where: { id: card.id },
      data: {
        status: 'REGISTERED',
        userId,
        registeredAt: new Date(),
      },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const userMembership = await this.prisma.userMembership.upsert({
      where: { userId },
      update: {
        type: MembershipType.MONTHLY,
        price: cardPrice,
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
      },
      create: {
        userId,
        type: MembershipType.MONTHLY,
        price: cardPrice,
        status: MembershipStatus.ACTIVE,
        startDate,
        endDate,
      },
    });

    await this.prisma.membershipTransaction.create({
      data: {
        userId,
        price: cardPrice,
        type: MembershipType.MONTHLY,
        startDate,
        endDate,
      },
    });

    return {
      message: '¡Tarjeta vinculada y membresía activada con éxito!',
      card: updatedCard,
      membership: userMembership,
    };
  }
}
