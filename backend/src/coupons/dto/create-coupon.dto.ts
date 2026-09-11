import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
} from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty({ message: 'El título del cupón es obligatorio' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'El descuento es obligatorio' })
  discount!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(CouponType, { message: 'El tipo debe ser SINGLE_USE o REUSABLE' })
  @IsNotEmpty({ message: 'El tipo de uso es obligatorio' })
  type!: CouponType;

  @IsInt()
  @IsOptional()
  usageLimit?: number;

  @IsString()
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  startDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'La fecha final es obligatoria' })
  endDate!: string;

  @IsString()
  @IsOptional()
  conditions?: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Debes seleccionar al menos una sucursal' })
  branchIds!: string[];

  @IsString()
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  categoryId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsString()
  @IsOptional()
  targetCompanyId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedCompanyIds?: string[];
}
