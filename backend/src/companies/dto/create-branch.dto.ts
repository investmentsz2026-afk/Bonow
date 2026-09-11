import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address!: string;

  @IsString()
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  state!: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city!: string;

  @IsString()
  @IsOptional()
  municipality?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'La latitud es obligatoria' })
  latitude!: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La longitud es obligatoria' })
  longitude!: number;

  @IsString()
  @IsOptional()
  schedules?: string;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];
}
