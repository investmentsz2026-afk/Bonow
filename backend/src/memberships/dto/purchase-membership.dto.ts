import { IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { MembershipType } from '@prisma/client';

export class PurchaseMembershipDto {
  @IsEnum(MembershipType, {
    message:
      'El tipo de membresía debe ser MONTHLY, QUARTERLY, SEMESTERLY o ANNUAL',
  })
  @IsNotEmpty({ message: 'El tipo de membresía es obligatorio' })
  type!: MembershipType;

  @IsString()
  @IsNotEmpty({ message: 'El método de pago es obligatorio' })
  paymentMethod!: string;

  @IsString()
  @IsOptional()
  paymentDetails?: string;
}
