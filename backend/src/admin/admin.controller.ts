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
  Request as Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CouponsService } from '../coupons/coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly couponsService: CouponsService,
  ) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getUsers(search, role, status, pageNum, limitNum);
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Post('users/bulk-status')
  async bulkUpdateUserStatus(
    @Body('userIds') userIds: string[],
    @Body('status') status: string,
  ) {
    return this.adminService.bulkUpdateUserStatus(userIds, status);
  }

  @Get('coupons')
  async getCoupons(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getCoupons(
      search,
      categoryId,
      status,
      pageNum,
      limitNum,
    );
  }

  @Post('coupons/bulk-status')
  async bulkUpdateCouponStatus(
    @Body('couponIds') couponIds: string[],
    @Body('status') status: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.adminService.bulkUpdateCouponStatus(couponIds, status);
  }

  @Put('coupons/:id/approve')
  async approveCoupon(
    @Req() req: any,
    @Param('id') couponId: string,
  ) {
    const adminUserId = req.user?.userId || req.user?.sub;
    return this.couponsService.approveCoupon(adminUserId, couponId);
  }

  @Put('coupons/:id/reject')
  async rejectCoupon(
    @Req() req: any,
    @Param('id') couponId: string,
    @Body('reason') reason: string,
  ) {
    const adminUserId = req.user?.userId || req.user?.sub;
    return this.couponsService.rejectCoupon(adminUserId, couponId, reason);
  }

  @Get('memberships')
  async getMemberships(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getMemberships(search, status, pageNum, limitNum);
  }

  @Get('payments')
  async getPayments(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getPayments(search, status, pageNum, limitNum);
  }

  @Post('payments/:id/refund')
  async refundPayment(@Param('id') id: string) {
    return this.adminService.refundPayment(id);
  }

  @Put('payments/:id/status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updatePaymentStatus(id, status);
  }

  // ─── CRUD Categorías ───
  @Get('categories')
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  async createCategory(
    @Body('name') name: string,
    @Body('icon') icon?: string,
  ) {
    return this.adminService.createCategory(name, icon);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('icon') icon?: string,
  ) {
    return this.adminService.updateCategory(id, name, icon);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ─── CRUD Noticias ───
  @Get('news')
  async getNews() {
    return this.adminService.getNews();
  }

  @Post('news')
  async createNews(
    @Body()
    dto: {
      title: string;
      content: string;
      imageUrl?: string;
      author?: string;
      status?: string;
    },
  ) {
    return this.adminService.createNews(dto);
  }

  @Put('news/:id')
  async updateNews(
    @Param('id') id: string,
    @Body()
    dto: {
      title: string;
      content: string;
      imageUrl?: string;
      author?: string;
      status?: string;
    },
  ) {
    return this.adminService.updateNews(id, dto);
  }

  @Delete('news/:id')
  async deleteNews(@Param('id') id: string) {
    return this.adminService.deleteNews(id);
  }

  // ─── CRUD Configuración ───
  @Get('settings')
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Post('settings')
  async updateSetting(
    @Body('key') key: string,
    @Body('value') value: string,
    @Body('description') description?: string,
  ) {
    return this.adminService.updateSetting(key, value, description);
  }

  // ─── Tarjetas Virtuales ───
  @Get('virtual-cards')
  async getVirtualCards(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('cardType') cardType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getVirtualCards(search, status, cardType, pageNum, limitNum);
  }

  @Post('virtual-cards/generate')
  async generateVirtualCards(
    @Body('count') count: number,
    @Body('cardType') cardType?: 'DIGITAL' | 'PHYSICAL',
    @Body('prefix') prefix?: string,
    @Body('price') price?: number,
  ) {
    const countNum = count ? parseInt(count.toString(), 10) : 10;
    const typeStr = cardType || 'DIGITAL';
    const priceNum = price ? parseFloat(price.toString()) : 0.0;
    return this.adminService.generateVirtualCards(countNum, typeStr, prefix, priceNum);
  }

  @Put('virtual-cards/:id/price')
  async updateVirtualCardPrice(
    @Param('id') id: string,
    @Body('price') price: number,
  ) {
    const priceNum = parseFloat(price.toString());
    return this.adminService.updateVirtualCardPrice(id, priceNum);
  }

  @Delete('virtual-cards/:id')
  async deleteVirtualCard(@Param('id') id: string) {
    return this.adminService.deleteVirtualCard(id);
  }

  // ─── CRUD Sucursales / Mapa (Admin) ───
  @Get('branches')
  async getAdminBranches() {
    return this.adminService.getAdminBranches();
  }

  @Post('branches')
  async createAdminBranch(@Body() body: any) {
    return this.adminService.createAdminBranch({
      companyId: body.companyId,
      name: body.name,
      address: body.address,
      state: body.state || 'CDMX',
      city: body.city || 'Ciudad de México',
      latitude: parseFloat(body.latitude) || 19.432608,
      longitude: parseFloat(body.longitude) || -99.133209,
      schedules: body.schedules,
    });
  }

  @Put('branches/:id')
  async updateAdminBranch(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateAdminBranch(id, {
      ...body,
      latitude: body.latitude ? parseFloat(body.latitude) : undefined,
      longitude: body.longitude ? parseFloat(body.longitude) : undefined,
    });
  }

  @Delete('branches/:id')
  async deleteAdminBranch(@Param('id') id: string) {
    return this.adminService.deleteAdminBranch(id);
  }

  // ─── Configuración de Paquetes de Créditos para Empresas ───
  @Get('credit-packages')
  async getAdminCreditPackages() {
    return this.couponsService.getCreditPackages();
  }

  @Put('credit-packages')
  async updateAdminCreditPackages(@Body('packages') packages: any[]) {
    return this.couponsService.updateCreditPackages(packages);
  }
}
