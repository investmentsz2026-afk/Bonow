import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = req.user.sub as string;
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user.sub as string;
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('link-card')
  async linkCard(@Request() req: any, @Body('cardNumber') cardNumber: string) {
    const userId = req.user.sub as string;
    return this.usersService.linkCard(userId, cardNumber);
  }

  @Put('change-password')
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user.sub as string;
    return this.usersService.changePassword(userId, dto);
  }

  @Put('notifications')
  async updateNotifications(
    @Request() req: any,
    @Body() dto: UpdateNotificationsDto,
  ) {
    const userId = req.user.sub as string;
    return this.usersService.updateNotifications(userId, dto);
  }
}
