import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsObject,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre comercial es obligatorio' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  corporateName!: string;

  @IsString()
  @IsNotEmpty({ message: 'El RFC es obligatorio' })
  rfc!: string;

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
}
