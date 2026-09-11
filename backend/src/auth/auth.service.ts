import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { HashingService } from './hashing.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MembershipType, MembershipStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // Asegurar que existan los roles base al arrancar la app
    const roles = ['USER', 'BUSINESS', 'ADMIN'];
    for (const roleName of roles) {
      await this.prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName, description: `Rol para ${roleName}` },
      });
    }

    // Crear o actualizar super administrador por defecto
    const adminEmail = 'admin@wynni.com';
    const hashedPassword = await this.hashingService.hash('adminwynni123');

    const adminUser = await this.prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        status: 'ACTIVE',
        roles: {
          connect: { name: 'ADMIN' },
        },
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'BONOW',
        isEmailVerified: true,
        status: 'ACTIVE',
        roles: {
          connect: { name: 'ADMIN' },
        },
      },
    });
    console.log(
      'Super administrador configurado: admin@wynni.com / adminwynni123',
    );

    // Asegurar que la empresa administradora de cupones del sistema exista
    const defaultCompany = await this.prisma.company.upsert({
      where: { ownerId: adminUser.id },
      update: {
        name: 'BONOW',
        corporateName: 'BONOW S.A. de C.V.',
        rfc: 'BON123456789',
        status: 'APPROVED',
      },
      create: {
        name: 'BONOW',
        corporateName: 'BONOW S.A. de C.V.',
        rfc: 'BON123456789',
        status: 'APPROVED',
        ownerId: adminUser.id,
      },
    });
    console.log(
      'Empresa por defecto BONOW creada y vinculada al Administrador.',
    );

    // Asegurar sucursal matriz de BONOW
    const defaultBranch = await this.prisma.branch.findFirst({
      where: { companyId: defaultCompany.id },
    });
    if (!defaultBranch) {
      await this.prisma.branch.create({
        data: {
          companyId: defaultCompany.id,
          name: 'Matriz BONOW CDMX',
          address: 'Av. Paseo de la Reforma 115, CDMX',
          state: 'CDMX',
          city: 'Ciudad de México',
          latitude: 19.432608,
          longitude: -99.133209,
        },
      });
      console.log('Sucursal matriz por defecto para WYNNI creada.');
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const isUserRole = registerDto.role === 'USER' || !registerDto.role;
    const cardNumberToLink = isUserRole ? registerDto.cardNumber : undefined;

    if (cardNumberToLink) {
      const card = await this.prisma.virtualCard.findUnique({
        where: { cardNumber: cardNumberToLink },
      });
      if (!card) {
        throw new BadRequestException('La tarjeta virtual ingresada no existe');
      }
      if (card.status !== 'AVAILABLE') {
        throw new BadRequestException(
          'La tarjeta virtual ingresada ya está registrada o inactiva',
        );
      }
    }

    const hashedPassword = await this.hashingService.hash(registerDto.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Registrar usuario y asociar el rol correspondiente y la tarjeta si existe (solo para usuarios finales)
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        emailVerificationToken: cardNumberToLink
          ? null
          : verificationToken,
        isEmailVerified: cardNumberToLink ? true : false,
        status: 'ACTIVE',
        roles: {
          connect: { name: registerDto.role },
        },
        virtualCard: cardNumberToLink
          ? {
              connect: { cardNumber: cardNumberToLink },
            }
          : undefined,
      },
      include: {
        roles: true,
      },
    });

    if (cardNumberToLink) {
      const card = await this.prisma.virtualCard.findUnique({
        where: { cardNumber: cardNumberToLink },
      });
      
      const cardPrice = card?.price || 0.0;

      await this.prisma.virtualCard.update({
        where: { cardNumber: cardNumberToLink },
        data: {
          status: 'REGISTERED',
          userId: user.id,
          registeredAt: new Date(),
        },
      });

      // Crear membresía activa vinculada al precio de la tarjeta
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Vence en 1 mes

      await this.prisma.userMembership.upsert({
        where: { userId: user.id },
        update: {
          type: MembershipType.MONTHLY,
          price: cardPrice,
          status: MembershipStatus.ACTIVE,
          startDate,
          endDate,
        },
        create: {
          userId: user.id,
          type: MembershipType.MONTHLY,
          price: cardPrice,
          status: MembershipStatus.ACTIVE,
          startDate,
          endDate,
        },
      });

      // Crear transacción inicial en el historial
      await this.prisma.membershipTransaction.create({
        data: {
          userId: user.id,
          type: MembershipType.MONTHLY,
          price: cardPrice,
          startDate,
          endDate,
        },
      });
    }

    return {
      message: registerDto.cardNumber
        ? 'Registro exitoso con tu Tarjeta Virtual. Ya puedes iniciar sesión.'
        : 'Registro exitoso. Por favor verifica tu correo electrónico con el token provisto.',
      emailVerificationToken: registerDto.cardNumber ? null : verificationToken, // Retornado en desarrollo para simular
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.name),
        createdAt: user.createdAt,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException(
        'Tu cuenta ha sido suspendida. Contacta soporte.',
      );
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.roles.map((r) => r.name),
    );
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.name),
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  async refreshTokens(refreshTokenStr: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: { include: { roles: true } } },
    });

    if (
      !tokenRecord ||
      tokenRecord.revoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh Token inválido o expirado');
    }

    // Rotar token: eliminar el viejo y crear nuevos
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.roles.map((r) => r.name),
    );
    return tokens;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: verifyEmailDto.token },
    });

    if (!user) {
      throw new BadRequestException('Token de verificación inválido o vencido');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: 'Correo verificado exitosamente.' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Por seguridad no confirmar que el correo no existe, pero retornamos estado ok mockeado
      return {
        message:
          'Si el correo está registrado, se envió un código de recuperación.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora de validez

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    return {
      message:
        'Si el correo está registrado, se envió un código de recuperación.',
      resetToken, // Retornado para simulación de flujo en desarrollo
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: resetPasswordDto.token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Token de recuperación inválido o expirado.',
      );
    }

    const hashedPassword = await this.hashingService.hash(
      resetPasswordDto.newPassword,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Contraseña restablecida correctamente.' };
  }

  private async generateTokens(userId: string, email: string, roles: string[]) {
    const payload = { sub: userId, email, roles };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        process.env.JWT_SECRET ?? 'super-secret-jwt-key-change-in-production',
      expiresIn: '15m',
    });

    const refreshTokenVal = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenVal,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenVal,
    };
  }
}
