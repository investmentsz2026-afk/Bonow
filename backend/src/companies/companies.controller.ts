import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CompanyStatus } from '@prisma/client';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles('BUSINESS', 'ADMIN')
  async createCompany(@Request() req: any, @Body() dto: CreateCompanyDto) {
    const userId = req.user.sub as string;
    return this.companiesService.createCompany(userId, dto);
  }

  @Get('my-company')
  @Roles('BUSINESS', 'ADMIN')
  async getMyCompany(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.companiesService.getMyCompany(userId);
  }

  @Put('my-company')
  @Roles('BUSINESS', 'ADMIN')
  async updateMyCompany(@Request() req: any, @Body() dto: UpdateCompanyDto) {
    const userId = req.user.sub as string;
    return this.companiesService.updateMyCompany(userId, dto);
  }

  @Post('my-company/branches')
  @Roles('BUSINESS', 'ADMIN')
  async createBranch(@Request() req: any, @Body() dto: CreateBranchDto) {
    const userId = req.user.sub as string;
    return this.companiesService.createBranch(userId, dto);
  }

  @Put('my-company/branches/:branchId')
  @Roles('BUSINESS', 'ADMIN')
  async updateBranch(
    @Request() req: any,
    @Param('branchId') branchId: string,
    @Body() dto: CreateBranchDto,
  ) {
    const userId = req.user.sub as string;
    return this.companiesService.updateBranch(userId, branchId, dto);
  }

  @Delete('my-company/branches/:branchId')
  @Roles('BUSINESS', 'ADMIN')
  async deleteBranch(@Request() req: any, @Param('branchId') branchId: string) {
    const userId = req.user.sub as string;
    return this.companiesService.deleteBranch(userId, branchId);
  }

  // Rutas de administración
  @Get()
  @Roles('ADMIN')
  async getAllCompanies() {
    return this.companiesService.getAllCompanies();
  }

  @Put(':companyId/status')
  @Roles('ADMIN')
  async updateCompanyStatus(
    @Param('companyId') companyId: string,
    @Body('status') status: CompanyStatus,
  ) {
    return this.companiesService.updateCompanyStatus(companyId, status);
  }

  @Put(':companyId/toggle-featured')
  @Roles('ADMIN')
  async toggleCompanyFeatured(@Param('companyId') companyId: string) {
    return this.companiesService.toggleCompanyFeatured(companyId);
  }
}
