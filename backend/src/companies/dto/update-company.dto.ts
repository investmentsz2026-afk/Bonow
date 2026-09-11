import { IsString, IsOptional, IsEmail, IsObject } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  corporateName?: string;

  @IsString()
  @IsOptional()
  rfc?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'El email comercial no es válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: any;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsOptional()
  categoryIds?: string[];
}
