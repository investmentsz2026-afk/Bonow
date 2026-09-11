import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MembershipsService } from '../memberships/memberships.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentStatus, MembershipType } from '@prisma/client';
import * as crypto from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipsService: MembershipsService,
    private readonly couponsService: CouponsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getPlanPrice(type: MembershipType): number {
    switch (type) {
      case MembershipType.MONTHLY:
        return 149.0;
      case MembershipType.QUARTERLY:
        return 399.0;
      case MembershipType.SEMESTERLY:
        return 699.0;
      case MembershipType.ANNUAL:
        return 1199.0;
      default:
        return 0.0;
    }
  }

  private getCreditPackageInfo(packageId: string) {
    switch (packageId) {
      case 'basic_5':
        return { name: 'Paquete Básico (5 Cupones)', price: 199.0, credits: 5 };
      case 'pro_10':
        return { name: 'Paquete Emprendedor (10 Cupones)', price: 349.0, credits: 10 };
      case 'enterprise_20':
        return { name: 'Paquete Empresarial (20 Cupones)', price: 599.0, credits: 20 };
      default:
        return { name: 'Paquete Básico (5 Cupones)', price: 199.0, credits: 5 };
    }
  }

  getStripeConfig() {
    const isConfigured = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0,
    );
    return {
      isConfigured,
      publishableKey:
        process.env.STRIPE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
        null,
      currency: 'MXN',
    };
  }

  async createPaymentIntent(userId: string, dto: CreatePaymentDto) {
    const amount = this.getPlanPrice(dto.planType);
    if (amount <= 0) {
      throw new BadRequestException('Plan de membresía inválido.');
    }

    const providerTxId = `TX-${dto.provider.substring(0, 3).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return this.prisma.payment.create({
      data: {
        userId,
        amount,
        planType: dto.planType,
        status: PaymentStatus.PENDING,
        provider: dto.provider,
        providerTxId,
      },
    });
  }

  async createStripeCheckoutSession(
    userId: string,
    dto: CreatePaymentDto,
    origin: string = 'http://localhost:3000',
  ) {
    const amount = this.getPlanPrice(dto.planType);
    if (amount <= 0) {
      throw new BadRequestException('Plan de membresía inválido.');
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        planType: dto.planType,
        status: PaymentStatus.PENDING,
        provider: 'STRIPE',
        providerTxId: `STRIPE_PENDING_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      },
    });

    if (stripeSecretKey && stripeSecretKey.trim().length > 0) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-02-24.acacia' as any,
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'mxn',
                product_data: {
                  name: `Membresía BONOW+ - Plan ${dto.planType}`,
                  description: `Acceso exclusivo a cupones y promociones BONOW+`,
                },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${origin}/dashboard/membership?status=success&session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
          cancel_url: `${origin}/dashboard/membership?status=cancel`,
          metadata: {
            userId,
            paymentId: payment.id,
            planType: dto.planType,
            itemType: 'MEMBERSHIP',
          },
        });

        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { providerTxId: session.id },
        });

        return {
          paymentId: payment.id,
          sessionId: session.id,
          checkoutUrl: session.url,
          isRealStripe: true,
        };
      } catch (err: any) {
        this.logger.error(`Error creando sesión de Stripe Checkout: ${err?.message}`);
      }
    }

    return {
      paymentId: payment.id,
      sessionId: payment.providerTxId,
      checkoutUrl: `/checkout/${payment.id}`,
      isRealStripe: false,
      message:
        'Pasarela Stripe lista. Coloca tu STRIPE_SECRET_KEY en el backend para cobrar directamente en Stripe.',
    };
  }

  async createCreditStripeCheckoutSession(
    userId: string,
    packageId: string,
    origin: string = 'http://localhost:3000',
  ) {
    const pkg = this.getCreditPackageInfo(packageId);
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: pkg.price,
        planType: MembershipType.MONTHLY,
        status: PaymentStatus.PENDING,
        provider: 'STRIPE',
        providerTxId: `STRIPE_CREDITS_${packageId}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      },
    });

    if (stripeSecretKey && stripeSecretKey.trim().length > 0) {
      try {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-02-24.acacia' as any,
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'mxn',
                product_data: {
                  name: `Paquete de Créditos BONOW - ${pkg.name}`,
                  description: `Abona ${pkg.credits} créditos de publicación de cupones para tu empresa`,
                },
                unit_amount: Math.round(pkg.price * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${origin}/dashboard/membership?status=credits_success&payment_id=${payment.id}`,
          cancel_url: `${origin}/dashboard/membership?status=cancel`,
          metadata: {
            userId,
            paymentId: payment.id,
            itemType: 'CREDITS',
            packageId,
          },
        });

        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { providerTxId: session.id },
        });

        return {
          paymentId: payment.id,
          sessionId: session.id,
          checkoutUrl: session.url,
          isRealStripe: true,
        };
      } catch (err: any) {
        this.logger.error(`Error creando sesión de Créditos Stripe: ${err?.message}`);
      }
    }

    return {
      paymentId: payment.id,
      sessionId: payment.providerTxId,
      checkoutUrl: `/checkout/${payment.id}`,
      isRealStripe: false,
    };
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Intención de pago no encontrada.');
    }

    return payment;
  }

  async processWebhook(
    provider: string,
    payload: { providerTxId: string; status: 'APPROVED' | 'REJECTED' },
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerTxId: payload.providerTxId },
    });

    if (!payment || payment.provider.toLowerCase() !== provider.toLowerCase()) {
      throw new NotFoundException('Pago correspondiente no encontrado.');
    }

    if (payment.status === PaymentStatus.APPROVED) {
      return { message: 'Pago ya procesado anteriormente.', payment };
    }

    const nextStatus =
      payload.status === 'APPROVED'
        ? PaymentStatus.APPROVED
        : PaymentStatus.REJECTED;

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: nextStatus },
    });

    if (nextStatus === PaymentStatus.APPROVED) {
      // Verificar si fue una compra de Créditos para Empresa o una Membresía
      const txId = payment.providerTxId || '';
      const isCreditPurchase = txId.includes('CREDITS');

      if (isCreditPurchase) {
        let pkgId = 'basic_5';
        if (txId.includes('pro_10')) pkgId = 'pro_10';
        else if (txId.includes('enterprise_20')) pkgId = 'enterprise_20';

        const creditResult = await this.couponsService.buyCreditPackage(payment.userId, pkgId);
        await this.notificationsService.sendNotification(
          payment.userId,
          '💳 Compra de Créditos con Stripe Confirmada',
          creditResult.message || `Hemos acreditado tus publicaciones en el saldo de tu empresa.`,
          'PAYMENT_SUCCESS',
          ['EMAIL', 'PUSH'],
        );
      } else {
        await this.membershipsService.purchaseMembership(payment.userId, {
          type: payment.planType,
          paymentMethod: payment.provider,
          paymentDetails: `Pasarela TxID: ${txId}`,
        });
        await this.notificationsService.sendNotification(
          payment.userId,
          'Pago Exitoso - Membresía Activa',
          `Hemos confirmado tu pago de $${payment.amount.toString()} MXN. Tu membresía ${payment.planType} ya está activa. ¡A disfrutar de tus cupones!`,
          'PAYMENT_SUCCESS',
          ['EMAIL', 'PUSH'],
        );
      }
    }

    return {
      message: `Pago procesado con éxito. Estado: ${nextStatus}`,
      payment: updatedPayment,
    };
  }

  async handleStripeWebhook(payload: any, sigHeader?: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = payload;

    if (webhookSecret && sigHeader && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-02-24.acacia' as any,
        });
        event = stripe.webhooks.constructEvent(payload, sigHeader, webhookSecret);
      } catch (err: any) {
        this.logger.warn(`Error al verificar firma de Webhook de Stripe: ${err.message}`);
      }
    }

    if (event?.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const itemType = session.metadata?.itemType;
      const packageId = session.metadata?.packageId;

      let payment = null;
      if (paymentId) {
        payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
      } else if (session.id) {
        payment = await this.prisma.payment.findUnique({ where: { providerTxId: session.id } });
      }

      if (payment && payment.status !== PaymentStatus.APPROVED) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.APPROVED, providerTxId: session.id },
        });

        const txId = payment.providerTxId || '';
        if (itemType === 'CREDITS' || txId.includes('CREDITS')) {
          const pkgId = packageId || 'basic_5';
          const creditResult = await this.couponsService.buyCreditPackage(payment.userId, pkgId);
          await this.notificationsService.sendNotification(
            payment.userId,
            '💳 Compra de Créditos con Stripe Confirmada',
            creditResult.message || `Hemos acreditado tus publicaciones en el saldo de tu empresa.`,
            'PAYMENT_SUCCESS',
            ['EMAIL', 'PUSH'],
          );
        } else {
          await this.membershipsService.purchaseMembership(payment.userId, {
            type: payment.planType,
            paymentMethod: 'STRIPE',
            paymentDetails: `Stripe Checkout Session: ${session.id}`,
          });

          await this.notificationsService.sendNotification(
            payment.userId,
            '💳 Pago con Stripe Exitoso - Membresía Activa',
            `Tu pago con Stripe por $${payment.amount} MXN fue procesado correctamente. ¡Membresía BONOW+ activada!`,
            'PAYMENT_SUCCESS',
            ['EMAIL', 'PUSH'],
          );
        }
      }
    }

    return { received: true };
  }
}
