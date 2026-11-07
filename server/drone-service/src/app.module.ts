import { Module } from '@nestjs/common';
import { DroneModule } from './drone/drone.Module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),DroneModule],
  providers: [],
})
export class AppModule {}
