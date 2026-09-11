import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStatus } from '@prisma/client';

interface CreateContractDto {
  companyId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  startDate: string;
  endDate: string;
}

// Flujo válido de transiciones de estado
const VALID_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: [ContractStatus.PENDING_REVIEW, ContractStatus.CANCELLED],
  PENDING_REVIEW: [
    ContractStatus.ACTIVE,
    ContractStatus.DRAFT,
    ContractStatus.CANCELLED,
  ],
  ACTIVE: [
    ContractStatus.EXPIRED,
    ContractStatus.CANCELLED,
    ContractStatus.RENEWED,
  ],
  EXPIRED: [ContractStatus.RENEWED],
  CANCELLED: [],
  RENEWED: [ContractStatus.ACTIVE],
};

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async createContract(dto: CreateContractDto, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const contract = await this.prisma.contract.create({
      data: {
        companyId: dto.companyId,
        title: dto.title,
        description: dto.description || null,
        fileUrl: dto.fileUrl || null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: ContractStatus.DRAFT,
      },
      include: {
        company: {
          select: { id: true, name: true, corporateName: true, rfc: true },
        },
      },
    });

    // Registrar en historial
    await this.prisma.contractHistory.create({
      data: {
        contractId: contract.id,
        action: 'CREATED',
        newStatus: ContractStatus.DRAFT,
        notes: `Contrato "${dto.title}" creado para ${company.name}`,
        performedBy: userId,
      },
    });

    return contract;
  }

  async getAllContracts() {
    return this.prisma.contract.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            corporateName: true,
            rfc: true,
            logoUrl: true,
          },
        },
        _count: { select: { history: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContractsByCompany(companyId: string) {
    return this.prisma.contract.findMany({
      where: { companyId },
      include: {
        company: {
          select: { id: true, name: true, corporateName: true },
        },
        _count: { select: { history: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContractsByOwner(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!company) return [];

    return this.getContractsByCompany(company.id);
  }

  async getContractById(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            corporateName: true,
            rfc: true,
            logoUrl: true,
          },
        },
        history: {
          orderBy: { performedAt: 'desc' },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return contract;
  }

  async updateStatus(
    contractId: string,
    newStatus: ContractStatus,
    userId: string,
    notes?: string,
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    const allowedTransitions = VALID_TRANSITIONS[contract.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${contract.status} a ${newStatus}. Transiciones válidas: ${allowedTransitions.join(', ') || 'ninguna'}`,
      );
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: { status: newStatus },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    await this.prisma.contractHistory.create({
      data: {
        contractId,
        action: 'STATUS_CHANGE',
        previousStatus: contract.status,
        newStatus,
        notes: notes || `Estado cambiado de ${contract.status} a ${newStatus}`,
        performedBy: userId,
      },
    });

    return updated;
  }

  async uploadFile(contractId: string, fileUrl: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: { fileUrl },
    });

    await this.prisma.contractHistory.create({
      data: {
        contractId,
        action: 'FILE_UPLOADED',
        notes: `Archivo del contrato actualizado: ${fileUrl}`,
        performedBy: userId,
      },
    });

    return updated;
  }

  async renewContract(
    contractId: string,
    newEndDate: string,
    userId: string,
    notes?: string,
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    if (
      contract.status !== ContractStatus.ACTIVE &&
      contract.status !== ContractStatus.EXPIRED
    ) {
      throw new BadRequestException(
        'Solo se pueden renovar contratos activos o expirados',
      );
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        endDate: new Date(newEndDate),
        status: ContractStatus.ACTIVE,
        renewalNotes: notes || null,
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    await this.prisma.contractHistory.create({
      data: {
        contractId,
        action: 'RENEWED',
        previousStatus: contract.status,
        newStatus: ContractStatus.ACTIVE,
        notes:
          notes ||
          `Contrato renovado. Nueva fecha de vencimiento: ${newEndDate}`,
        performedBy: userId,
      },
    });

    return updated;
  }

  async getContractHistory(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return this.prisma.contractHistory.findMany({
      where: { contractId },
      orderBy: { performedAt: 'desc' },
    });
  }
}
