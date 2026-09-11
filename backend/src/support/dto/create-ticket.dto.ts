import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TicketCategory } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEnum(TicketCategory)
  @IsOptional()
  category?: TicketCategory;

  @IsString()
  @IsNotEmpty()
  message: string;
}
