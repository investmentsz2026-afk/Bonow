import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { AdPosition, AdStatus } from '@prisma/client';

export class CreateAdDto {
  @IsString()
  @IsNotEmpty({ message: 'El título del anuncio es obligatorio' })
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  adType?: string; // BANNER, SPONSORED, NEWS, PROMO

  @IsString()
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  startDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'La fecha de término es obligatoria' })
  endDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'La posición del anuncio es obligatoria' })
  position!: string;

  @IsEnum(AdStatus, { message: 'Estado inválido' })
  @IsOptional()
  status?: AdStatus;

  @IsString()
  @IsOptional()
  companyId?: string;
}
