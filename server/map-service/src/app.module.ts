import { Module } from '@nestjs/common';
import { MapController } from './map/map.controller'
import { MapService } from './map/map.service';

@Module({
  imports: [],
  controllers: [MapController,MapService],
  providers: [MapService],
})
export class AppModule {}
