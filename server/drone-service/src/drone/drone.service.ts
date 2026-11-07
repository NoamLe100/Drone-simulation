    import {Injectable} from "@nestjs/common";
    import { DronseScatteringDto } from "../dto/dronseScattering.dto";
    import { Drone,Location } from "../type";
    @Injectable()
    export class DronesService {
        private dronesLocation:Drone[]=[];
        dronseScattering (dronseScatteringDto:DronseScatteringDto){
        const randomeNumofDrons= Math.floor(Math.random()*(20-15+1)+15);
        this.dronesLocation=[];
        for(let i =0 ;i<randomeNumofDrons;i++)
        {
            const randomRow = Math.floor(Math.random()*((dronseScatteringDto.rows-1)-0+1)+0);
            const randomcolumn = Math.floor(Math.random()*((dronseScatteringDto.columns-1)-0+1)+0);
            const route= this.createDroneRoute(randomRow,randomcolumn,dronseScatteringDto.rows,dronseScatteringDto.columns);
            const drone:Drone = {
                speed: 50,
                route: route,
                routeIndex: 0,
                mode: "Patrol"
            };
            this.dronesLocation.push(drone);
        }
        return this.dronesLocation;
    }
    createDroneRoute (row:number,column:number,maxRow:number=100,maxColumn:number=100):Location[]{
        const location:Location[]=[];
        for(let i =0 ;i<5;i++)
        {
            if (row + i < maxRow && column + i < maxColumn)
            {
                location.push({ row: row + i, column: column + i });
            }
            else 
            {
                location.push({ row: row - i, column: column - i });
            }
        }
        return location;
    }
    }