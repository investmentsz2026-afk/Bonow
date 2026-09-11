import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CompanyStatus } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(userId: string, dto: CreateCompanyDto) {
    // Verificar si el usuario ya es dueño de alguna empresa
    const existing = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });
    if (existing) {
      throw new BadRequestException(
        'Este usuario ya tiene una empresa registrada.',
      );
    }

    const { categoryId, ...data } = dto;

    const companyData: any = {
      ...data,
      owner: { connect: { id: userId } },
      status: CompanyStatus.PENDING,
    };

    if (categoryId) {
      companyData.category = { connect: { id: categoryId } };
    }

    return this.prisma.company.create({
      data: companyData,
      include: { category: true },
    });
  }

  async getMyCompany(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        branches: {
          include: { categories: true },
          orderBy: { createdAt: 'desc' },
        },
        category: true,
        categories: true,
        owner: {
          select: {
            id: true,
            email: true,
            membership: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    return company;
  }

  async updateMyCompany(userId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const { categoryId, categoryIds, ...data } = dto as any;

    const updateData: any = { ...data };

    if (categoryIds && Array.isArray(categoryIds)) {
      updateData.categories = { set: categoryIds.map((id: string) => ({ id })) };
      if (categoryIds.length > 0) {
        updateData.category = { connect: { id: categoryIds[0] } };
      }
    } else if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    } else if (categoryId === null) {
      updateData.category = { disconnect: true };
    }

    return this.prisma.company.update({
      where: { id: company.id },
      data: updateData,
      include: { category: true, categories: true },
    });
  }

  async createBranch(userId: string, dto: CreateBranchDto) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    if (company.status !== CompanyStatus.APPROVED) {
      throw new ForbiddenException(
        'Tu empresa debe estar Aprobada para registrar sucursales.',
      );
    }

    const { categoryIds, ...data } = dto;

    return this.prisma.branch.create({
      data: {
        ...data,
        companyId: company.id,
        categories: categoryIds && categoryIds.length > 0
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { categories: true },
    });
  }

  async updateBranch(userId: string, branchId: string, dto: CreateBranchDto) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== company.id) {
      throw new NotFoundException(
        'La sucursal no existe o no pertenece a tu empresa.',
      );
    }

    const { categoryIds, ...data } = dto;

    return this.prisma.branch.update({
      where: { id: branchId },
      data: {
        ...data,
        categories: categoryIds
          ? { set: categoryIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { categories: true },
    });
  }

  async deleteBranch(userId: string, branchId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new NotFoundException('No tienes ninguna empresa registrada.');
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== company.id) {
      throw new NotFoundException(
        'La sucursal no existe o no pertenece a tu empresa.',
      );
    }

    await this.prisma.branch.delete({
      where: { id: branchId },
    });

    return { message: 'Sucursal eliminada exitosamente' };
  }

  // Métodos de Administración (General)
  async getAllCompanies() {
    return this.prisma.company.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        categories: true,
        branches: {
          include: { categories: true },
        },
        _count: {
          select: { branches: true, coupons: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCompanyStatus(companyId: string, status: CompanyStatus) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada.');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: { status },
    });
  }

  async toggleCompanyFeatured(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa no encontrada.');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: { isFeatured: !company.isFeatured },
    });
  }
}
