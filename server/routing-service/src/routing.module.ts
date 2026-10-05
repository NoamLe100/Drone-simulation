import { Module } from '@nestjs/common';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';
import { RouteStateStore } from './state/route-state.store';

@Module({
  controllers: [RoutingController],
  providers: [RoutingService, RouteStateStore],
})
export class RoutingModule {}