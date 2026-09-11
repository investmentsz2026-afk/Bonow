import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('user')
  @Roles('USER', 'ADMIN')
  async getUserMetrics(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.analyticsService.getUserMetrics(userId);
  }

  @Get('business')
  @Roles('BUSINESS', 'ADMIN')
  async getBusinessMetrics(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.analyticsService.getBusinessMetrics(userId);
  }

  @Get('admin')
  @Roles('ADMIN')
  async getAdminMetrics() {
    return this.analyticsService.getAdminMetrics();
  }

  @Get('admin/reports')
  @Roles('ADMIN')
  async getAdminPlatformReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.analyticsService.getAdminPlatformReports({
      startDate,
      endDate,
      categoryId,
      status,
      search,
    });
  }
}
