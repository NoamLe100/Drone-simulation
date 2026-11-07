import { Module } from '@nestjs/common';
import { DroneController } from './drone.controller';
import { DronesService } from './drone.service';
import { ConfigModule } from '@nestjs/config';

@Module ({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    controllers: [DroneController],
    providers: [DronesService],
})
export class DroneModule {}