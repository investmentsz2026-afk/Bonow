import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { PurchaseMembershipDto } from './dto/purchase-membership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('active')
  @Roles('USER', 'ADMIN', 'BUSINESS')
  async getActiveMembership(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.membershipsService.getActiveMembership(userId);
  }

  @Post('purchase')
  @Roles('USER', 'ADMIN', 'BUSINESS')
  async purchaseMembership(
    @Request() req: any,
    @Body() dto: PurchaseMembershipDto,
  ) {
    const userId = req.user.sub as string;
    return this.membershipsService.purchaseMembership(userId, dto);
  }

  @Get('history')
  @Roles('USER', 'ADMIN', 'BUSINESS')
  async getTransactionHistory(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.membershipsService.getTransactionHistory(userId);
  }
}
