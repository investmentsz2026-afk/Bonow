import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContractStatus } from '@prisma/client';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles('ADMIN')
  async createContract(
    @Request() req: any,
    @Body()
    dto: {
      companyId: string;
      title: string;
      description?: string;
      fileUrl?: string;
      startDate: string;
      endDate: string;
    },
  ) {
    const userId = req.user.sub as string;
    return this.contractsService.createContract(dto, userId);
  }

  @Get()
  @Roles('ADMIN')
  async getAllContracts() {
    return this.contractsService.getAllContracts();
  }

  @Get('my-contracts')
  @Roles('BUSINESS')
  async getMyContracts(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.contractsService.getContractsByOwner(userId);
  }

  @Get(':id')
  @Roles('ADMIN', 'BUSINESS')
  async getContractById(@Param('id') id: string) {
    return this.contractsService.getContractById(id);
  }

  @Put(':id/status')
  @Roles('ADMIN')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status: ContractStatus; notes?: string },
  ) {
    const userId = req.user.sub as string;
    return this.contractsService.updateStatus(
      id,
      body.status,
      userId,
      body.notes,
    );
  }

  @Put(':id/upload')
  @Roles('ADMIN')
  async uploadFile(
    @Request() req: any,
    @Param('id') id: string,
    @Body('fileUrl') fileUrl: string,
  ) {
    const userId = req.user.sub as string;
    return this.contractsService.uploadFile(id, fileUrl, userId);
  }

  @Put(':id/renew')
  @Roles('ADMIN')
  async renewContract(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { newEndDate: string; notes?: string },
  ) {
    const userId = req.user.sub as string;
    return this.contractsService.renewContract(
      id,
      body.newEndDate,
      userId,
      body.notes,
    );
  }

  @Get(':id/history')
  @Roles('ADMIN', 'BUSINESS')
  async getContractHistory(@Param('id') id: string) {
    return this.contractsService.getContractHistory(id);
  }
}
