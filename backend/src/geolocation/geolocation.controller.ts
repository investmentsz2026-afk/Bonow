import { Controller, Get, Query } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('nearby')
  async getNearby(
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
    @Query('radius') radiusStr?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    const lat = latStr ? parseFloat(latStr) : 19.432608;
    const lng = lngStr ? parseFloat(lngStr) : -99.133209;
    const radius = radiusStr ? parseFloat(radiusStr) : 10;

    return this.geolocationService.findNearbyBranches(
      isNaN(lat) ? 19.432608 : lat,
      isNaN(lng) ? -99.133209 : lng,
      isNaN(radius) ? 10 : radius,
      categoryId,
      search,
    );
  }
}
