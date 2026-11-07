import { Module } from '@nestjs/common';
import { DroneController } from './drone/drone.controller';
import { DronesService } from './drone/drone.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [DroneController],
  providers: [DronesService],
})
export class AppModule {}
