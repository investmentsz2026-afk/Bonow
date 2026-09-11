import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  async createTicket(@Req() req: any, @Body() dto: CreateTicketDto) {
    const userId = req.user.sub || req.user.id;
    const roles = req.user.roles || [];
    return this.supportService.createTicket(userId, dto, roles);
  }

  @Get('my-tickets')
  async getMyTickets(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.supportService.getMyTickets(userId);
  }

  @Get('admin/tickets')
  @Roles('ADMIN')
  async getAdminTickets(
    @Query('senderType') senderType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.supportService.getAdminTickets(senderType, status, search);
  }

  @Get('tickets/:id')
  async getTicketById(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub || req.user.id;
    const roles = req.user.roles || [];
    return this.supportService.getTicketById(userId, id, roles);
  }

  @Post('tickets/:id/reply')
  async replyTicket(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
  ) {
    const userId = req.user.sub || req.user.id;
    const roles = req.user.roles || [];
    return this.supportService.replyTicket(userId, id, dto, roles);
  }

  @Patch('admin/tickets/:id/status')
  @Roles('ADMIN')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.supportService.updateTicketStatus(id, status);
  }
}
