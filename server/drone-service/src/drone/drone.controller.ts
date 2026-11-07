import { Body, Controller, Post } from "@nestjs/common";
import { DronesService } from "./drone.service";
import { DronseScatteringDto } from "../dto/dronseScattering.dto";
import { riskCalculationDto } from "../dto/riskCalculation.dto";

@Controller('drone')
export class DroneController {
  constructor(private readonly dronesService: DronesService) {}

    @Post('scatter')
     dronseScattering(@Body() input: DronseScatteringDto) {
     return this.dronesService.dronseScattering(input);
  }
    @Post ('risk')
     riskCalculation(@Body() input: riskCalculationDto) {
     return this.dronesService.riskCalculation(input);
  }
}