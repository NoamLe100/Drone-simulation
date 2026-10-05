import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { PlanRouteDto } from './dto/plan-route.dto';
import { ReplanRouteDto } from './dto/replan-route.dto';
import { RoutingService } from './routing.service';

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Post('plan')
  plan(@Body() input: PlanRouteDto) {
    return this.routingService.plan(input);
  }

  @Post('replan')
  replan(@Body() input: ReplanRouteDto) {
    return this.routingService.replan(input);
  }

  @Delete('state/:runId')
  deleteState(@Param('runId') runId: string) {
    return this.routingService.deleteState(runId);
  }
}