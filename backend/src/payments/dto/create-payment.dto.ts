import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { MembershipType } from '@prisma/client';

export class CreatePaymentDto {
  @IsEnum(MembershipType, {
    message: 'El planType debe ser MONTHLY, QUARTERLY, SEMESTERLY o ANNUAL',
  })
  @IsNotEmpty({ message: 'El tipo de plan es obligatorio' })
  planType!: MembershipType;

  @IsString()
  @IsNotEmpty({ message: 'El proveedor de pagos es obligatorio' })
  provider!: string;
}
