import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { GeolocationService } from '../geolocation/geolocation.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CouponStatus } from '@prisma/client';

@Controller('coupons')
export class CouponsController {
  constructor(
    private readonly couponsService: CouponsService,
    private readonly geolocationService: GeolocationService,
  ) {}

  @Get('credit-balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async getCompanyCreditBalance(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.couponsService.getCompanyCreditBalance(userId);
  }

  @Get('credit-packages')
  async getCreditPackages() {
    return this.couponsService.getCreditPackages();
  }

  @Post('buy-credits')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async buyCreditPackage(@Request() req: any, @Body('packageId') packageId: string) {
    const userId = req.user.sub as string;
    return this.couponsService.buyCreditPackage(userId, packageId);
  }

  // Listar cupones públicos activos
  @Get()
  async getPublicCoupons(
    @Query('categoryId') categoryId?: string,
    @Query('query') query?: string,
  ) {
    return this.couponsService.getPublicCoupons(categoryId, query);
  }

  // Listar categorías públicas para filtrado
  @Get('categories')
  async getCategories() {
    return this.couponsService.getCategories();
  }

  @Get('categories/list')
  async getCategoriesList() {
    return this.couponsService.getCategories();
  }

  // Mapa interactivo de sucursales cercanas
  @Get('branches/map')
  async getBranchesMap(
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
    @Query('radius') radiusStr?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    const lat = latStr ? parseFloat(latStr) : 19.432608;
    const lng = lngStr ? parseFloat(lngStr) : -99.133209;
    const radius = radiusStr ? parseFloat(radiusStr) : 10;

    return this.geolocationService.findNearbyBranches(
      isNaN(lat) ? 19.432608 : lat,
      isNaN(lng) ? -99.133209 : lng,
      isNaN(radius) ? 10 : radius,
      categoryId,
      search,
    );
  }

  // Obtener empresas públicas verificadas (excluye empresa sistema)
  @Get('companies/public')
  async getPublicCompanies() {
    return this.couponsService.getPublicCompanies();
  }

  // Obtener slides públicos de la portada
  @Get('hero-slides')
  async getHeroSlides() {
    return this.couponsService.getHeroSlides();
  }

  // Obtener planes de membresía públicos
  @Get('membership-plans')
  async getMembershipPlans() {
    return this.couponsService.getMembershipPlans();
  }

  // Obtener contenido público de la página Nosotros
  @Get('about-page')
  async getAboutPage() {
    return this.couponsService.getAboutPage();
  }

  // Obtener contenido público de la página Promociones
  @Get('promotions-page')
  async getPromotionsPage() {
    return this.couponsService.getPromotionsPage();
  }

  // Historial de cupones redimidos por el usuario final
  @Get('my-redemptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  async getMyRedemptions(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.couponsService.getMyRedemptions(userId);
  }

  // Listar cupones creados por la empresa
  @Get('business/my-coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async getBusinessCoupons(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.couponsService.getBusinessCoupons(userId);
  }

  // Listar canjes procesados en caja de la empresa
  @Get('business/redemptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async getBusinessRedemptions(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.couponsService.getBusinessRedemptions(userId);
  }

  // Obtener detalle de un cupón específico
  @Get(':couponId')
  async getCouponById(@Param('couponId') couponId: string) {
    return this.couponsService.getCouponById(couponId);
  }

  // Crear cupón
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async createCoupon(@Request() req: any, @Body() dto: CreateCouponDto) {
    const userId = req.user.sub as string;
    return this.couponsService.createCoupon(userId, dto);
  }

  // Editar cupón
  @Put(':couponId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async updateCoupon(
    @Request() req: any,
    @Param('couponId') couponId: string,
    @Body() dto: CreateCouponDto,
  ) {
    const userId = req.user.sub as string;
    return this.couponsService.updateCoupon(userId, couponId, dto);
  }

  // Eliminar cupón
  @Delete(':couponId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async deleteCoupon(@Request() req: any, @Param('couponId') couponId: string) {
    const userId = req.user.sub as string;
    return this.couponsService.deleteCoupon(userId, couponId);
  }

  // Activar/desactivar cupón
  @Put(':couponId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async updateCouponStatus(
    @Request() req: any,
    @Param('couponId') couponId: string,
    @Body('status') status: CouponStatus,
  ) {
    const userId = req.user.sub as string;
    return this.couponsService.updateCouponStatus(userId, couponId, status);
  }

  // Generar código de validación del cupón (Redimir)
  @Post(':couponId/redeem')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  async redeemCoupon(@Request() req: any, @Param('couponId') couponId: string) {
    const userId = req.user.sub as string;
    return this.couponsService.redeemCoupon(userId, couponId);
  }

  // Validar código de cupón en tienda física
  @Post('validate-code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS', 'ADMIN')
  async validateRedemptionCode(
    @Request() req: any,
    @Body('code') code: string,
  ) {
    const userId = req.user.sub as string;
    return this.couponsService.validateRedemptionCode(userId, code);
  }

  // Endpoints de Administración: Obtener cupones para aprobación, aprobar y rechazar
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAdminCoupons(@Query('status') status?: string) {
    return this.couponsService.getAdminCoupons(status);
  }

  @Put('admin/:couponId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async approveCoupon(@Request() req: any, @Param('couponId') couponId: string) {
    const adminUserId = req.user.sub as string;
    return this.couponsService.approveCoupon(adminUserId, couponId);
  }

  @Put('admin/:couponId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async rejectCoupon(
    @Request() req: any,
    @Param('couponId') couponId: string,
    @Body('reason') reason: string,
  ) {
    const adminUserId = req.user.sub as string;
    return this.couponsService.rejectCoupon(adminUserId, couponId, reason);
  }
}
