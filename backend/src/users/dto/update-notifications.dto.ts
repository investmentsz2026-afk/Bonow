import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationsDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;
}
