import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsIn,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName!: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsIn(['USER', 'BUSINESS'], { message: 'El rol debe ser USER o BUSINESS' })
  role!: string;

  @IsString()
  @IsOptional()
  cardNumber?: string;
}
