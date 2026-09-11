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
import { AdvertisingService } from './advertising.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdStatus } from '@prisma/client';

@Controller('advertising')
export class AdvertisingController {
  constructor(private readonly advertisingService: AdvertisingService) {}

  // Listar anuncios activos y programados
  @Get('active')
  async getActiveAds() {
    return this.advertisingService.getActiveAds();
  }

  // Registrar clic
  @Post(':id/click')
  async recordClick(@Param('id') id: string) {
    return this.advertisingService.recordClick(id);
  }

  // Registrar impresiones/vistas masivas
  @Post('view-bulk')
  async recordViews(@Body('ids') ids: string[]) {
    return this.advertisingService.recordViews(ids || []);
  }

  // Rutas administrativas
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllAds() {
    return this.advertisingService.getAllAds();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createAd(@Body() dto: CreateAdDto) {
    return this.advertisingService.createAd(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateAd(@Param('id') id: string, @Body() dto: CreateAdDto) {
    return this.advertisingService.updateAd(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteAd(@Param('id') id: string) {
    return this.advertisingService.deleteAd(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateAdStatus(
    @Param('id') id: string,
    @Body('status') status: AdStatus,
  ) {
    return this.advertisingService.updateAdStatus(id, status);
  }

  @Put(':id/toggle-featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async toggleAdFeatured(@Param('id') id: string) {
    return this.advertisingService.toggleAdFeatured(id);
  }

  // Rutas para perfil de empresa (BUSINESS)
  @Post('business/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async createBusinessAd(@Request() req: any, @Body() dto: any) {
    const userId = req.user.sub as string;
    return this.advertisingService.createBusinessAd(userId, dto);
  }

  @Get('business/my-ads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async getBusinessAds(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.advertisingService.getBusinessAds(userId);
  }
}
