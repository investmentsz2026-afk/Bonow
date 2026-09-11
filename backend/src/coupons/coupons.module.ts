import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { AuthModule } from '../auth/auth.module';
import { GeolocationModule } from '../geolocation/geolocation.module';

@Module({
  imports: [AuthModule, GeolocationModule],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
