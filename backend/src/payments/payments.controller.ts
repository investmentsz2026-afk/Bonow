import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('stripe/config')
  getStripeConfig() {
    return this.paymentsService.getStripeConfig();
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN', 'BUSINESS')
  async createPaymentIntent(
    @Request() req: any,
    @Body() dto: CreatePaymentDto,
  ) {
    const userId = req.user.sub as string;
    return this.paymentsService.createPaymentIntent(userId, dto);
  }

  @Post('stripe/create-checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN', 'BUSINESS')
  async createStripeCheckoutSession(
    @Request() req: any,
    @Body() dto: CreatePaymentDto,
  ) {
    const userId = req.user.sub as string;
    const origin = req.headers.origin || 'http://localhost:3000';
    return this.paymentsService.createStripeCheckoutSession(userId, dto, origin);
  }

  @Post('stripe/create-credit-checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN', 'BUSINESS')
  async createCreditStripeCheckoutSession(
    @Request() req: any,
    @Body('packageId') packageId: string,
  ) {
    const userId = req.user.sub as string;
    const origin = req.headers.origin || 'http://localhost:3000';
    return this.paymentsService.createCreditStripeCheckoutSession(userId, packageId, origin);
  }

  @Get(':paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN', 'BUSINESS')
  async getPaymentById(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPaymentById(paymentId);
  }

  @Post('webhook/stripe')
  async handleStripeWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.paymentsService.handleStripeWebhook(payload, signature);
  }

  // Webhook público para recibir confirmación de pagos de Stripe
  @Post('webhook/:provider')
  async processWebhook(
    @Param('provider') provider: string,
    @Body() payload: { providerTxId: string; status: 'APPROVED' | 'REJECTED' },
  ) {
    return this.paymentsService.processWebhook(provider, payload);
  }
}
