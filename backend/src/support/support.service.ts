import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketCategory, TicketStatus } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  private generateTicketNumber(): string {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `TKT-${randomNum}`;
  }

  async createTicket(userId: string, dto: CreateTicketDto, roles: string[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isBusiness = roles.includes('BUSINESS');
    const senderType = isBusiness ? 'BUSINESS' : 'USER';
    const companyId = isBusiness && user.company ? user.company.id : undefined;

    let ticketNumber = this.generateTicketNumber();
    let existing = await this.prisma.supportTicket.findUnique({
      where: { ticketNumber },
    });
    while (existing) {
      ticketNumber = this.generateTicketNumber();
      existing = await this.prisma.supportTicket.findUnique({
        where: { ticketNumber },
      });
    }

    const senderName = isBusiness && user.company
      ? user.company.name
      : `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: dto.subject,
        category: dto.category || TicketCategory.GENERAL,
        status: TicketStatus.OPEN,
        senderType,
        userId: user.id,
        companyId,
        messages: {
          create: {
            senderId: user.id,
            senderName,
            senderRole: senderType,
            message: dto.message,
          },
        },
      },
      include: {
        messages: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            corporateName: true,
            logoUrl: true,
          },
        },
      },
    });

    return ticket;
  }

  async getMyTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            corporateName: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  async getTicketById(userId: string, ticketId: string, roles: string[]) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            corporateName: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket de soporte no encontrado');
    }

    const isAdmin = roles.includes('ADMIN');
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver este ticket');
    }

    return ticket;
  }

  async replyTicket(
    userId: string,
    ticketId: string,
    dto: ReplyTicketDto,
    roles: string[],
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true, company: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    const isAdmin = roles.includes('ADMIN');
    const isOwner = ticket.userId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('No tienes permiso para responder este ticket');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    let senderRole = 'USER';
    if (isAdmin) {
      senderRole = 'ADMIN';
    } else if (roles.includes('BUSINESS')) {
      senderRole = 'BUSINESS';
    }

    let senderName = 'Soporte BONOW';
    if (!isAdmin && currentUser) {
      senderName =
        senderRole === 'BUSINESS' && currentUser.company
          ? currentUser.company.name
          : `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
            currentUser.email;
    }

    const newMessage = await this.prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: userId,
        senderName,
        senderRole,
        message: dto.message,
      },
    });

    // Actualizar estado del ticket
    let newStatus: TicketStatus = ticket.status;
    if (dto.status && Object.values(TicketStatus).includes(dto.status as TicketStatus)) {
      newStatus = dto.status as TicketStatus;
    } else if (isAdmin && ticket.status === TicketStatus.OPEN) {
      newStatus = TicketStatus.IN_PROGRESS;
    } else if (!isAdmin && (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED)) {
      newStatus = TicketStatus.OPEN;
    }

    await this.prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    // Notificación automática si responde Admin al Usuario/Empresa
    if (isAdmin && ticket.userId) {
      await this.prisma.notification.create({
        data: {
          userId: ticket.userId,
          title: `Respuesta a tu Ticket ${ticket.ticketNumber}`,
          message: `El equipo de soporte ha respondido a tu consulta: "${ticket.subject}"`,
          type: 'PROMOTION',
          channels: ['PUSH'],
        },
      });
    }

    return newMessage;
  }

  async getAdminTickets(
    senderType?: string,
    status?: string,
    search?: string,
  ) {
    const where: any = {};

    if (senderType === 'USER' || senderType === 'BUSINESS') {
      where.senderType = senderType;
    }

    if (status && Object.values(TicketStatus).includes(status as TicketStatus)) {
      where.status = status as TicketStatus;
    }

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            phone: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            corporateName: true,
            logoUrl: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
      throw new BadRequestException('Estado inválido');
    }

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: status as TicketStatus,
      },
    });
  }
}
