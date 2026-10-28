import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MapService } from './map.service';
import { MapDto } from '../dto/map.dto';
import { GetMapDto } from '../dto/get-map.dto';


 @Controller("Map") 
 export class MapController{
    constructor(private readonly mapService:MapService) {}
    @Post('CreateMap')
    createMap(@Body () input :MapDto){
    return this.mapService.createMap(input);
    }
    @Get('GetMap')
    getMap(@Body () input:GetMapDto){
    return this.mapService.getMap(input);
    }
    
    @Post('DronseScattering')
    dronseScattering(@Body () input:GetMapDto){
    return this.mapService.dronseScattering(input);
    }
 }

