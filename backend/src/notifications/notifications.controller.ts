import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface JwtPayload {
  sub?: string;
  userId?: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Req() req: Request) {
    const user = req.user as JwtPayload;
    const userId = user.sub || user.userId || '';
    return this.notificationsService.getMyNotifications(userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const user = req.user as JwtPayload;
    const userId = user.sub || user.userId || '';
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    const userId = user.sub || user.userId || '';
    return this.notificationsService.markAsRead(id, userId);
  }
}
