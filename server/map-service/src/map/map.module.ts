import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';

    @Module({
        imports: [MapController,MapService],
        providers:[MapService]
    })
    export class MapModule {}