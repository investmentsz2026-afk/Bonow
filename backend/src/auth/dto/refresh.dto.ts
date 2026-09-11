import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty({ message: 'El refresh token es obligatorio' })
  refreshToken!: string;
}
