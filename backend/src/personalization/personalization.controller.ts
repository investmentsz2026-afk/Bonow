import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PersonalizationService } from './personalization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface JwtPayload {
  userId: string;
}

@Controller('personalization')
@UseGuards(JwtAuthGuard)
export class PersonalizationController {
  constructor(
    private readonly personalizationService: PersonalizationService,
  ) {}

  // ─── Favoritos de Empresa ───

  @Post('favorite/company/:companyId')
  async toggleFavoriteCompany(
    @Req() req: Request,
    @Param('companyId') companyId: string,
  ) {
    const user = req.user as JwtPayload;
    return this.personalizationService.toggleFavoriteCompany(
      user.userId,
      companyId,
    );
  }

  @Get('favorite/companies')
  async getFavoriteCompanies(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.personalizationService.getFavoriteCompanies(user.userId);
  }

  @Get('favorite/company/:companyId')
  async isCompanyFavorited(
    @Req() req: Request,
    @Param('companyId') companyId: string,
  ) {
    const user = req.user as JwtPayload;
    return this.personalizationService.isCompanyFavorited(
      user.userId,
      companyId,
    );
  }

  // ─── Favoritos de Cupón ───

  @Post('favorite/coupon/:couponId')
  async toggleFavoriteCoupon(
    @Req() req: Request,
    @Param('couponId') couponId: string,
  ) {
    const user = req.user as JwtPayload;
    return this.personalizationService.toggleFavoriteCoupon(
      user.userId,
      couponId,
    );
  }

  @Get('favorite/coupons')
  async getFavoriteCoupons(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.personalizationService.getFavoriteCoupons(user.userId);
  }

  @Get('favorite/coupon-ids')
  async getFavoriteCouponIds(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.personalizationService.getFavoriteCouponIds(user.userId);
  }

  // ─── Historial de Búsquedas ───

  @Post('search')
  async recordSearch(@Req() req: Request, @Body('query') query: string) {
    const user = req.user as JwtPayload;
    return this.personalizationService.recordSearch(user.userId, query);
  }

  @Get('search-history')
  async getSearchHistory(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.personalizationService.getSearchHistory(user.userId);
  }

  // ─── Historial de Visualizaciones ───

  @Post('view/:couponId')
  async recordView(@Req() req: Request, @Param('couponId') couponId: string) {
    const user = req.user as JwtPayload;
    return this.personalizationService.recordView(user.userId, couponId);
  }

  // ─── Recomendaciones ───

  @Get('recommendations')
  async getRecommendations(
    @Req() req: Request,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): Promise<unknown[]> {
    const user = req.user as any;
    const userId = user?.userId || user?.sub || '';
    const latNum = lat ? parseFloat(lat) : undefined;
    const lngNum = lng ? parseFloat(lng) : undefined;
    return this.personalizationService.getRecommendations(
      userId,
      latNum,
      lngNum,
    );
  }
}
