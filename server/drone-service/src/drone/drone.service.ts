    import {Injectable} from "@nestjs/common";
    import { DronseScatteringDto } from "../dto/dronseScattering.dto";
    import { Drone,Location,FullMap } from "../type";
    import { riskCalculationDto } from "../dto/riskCalculation.dto";
    @Injectable()
    export class DronesService {
        private dronesLocation:Drone[]=[];
        dronseScattering (input:DronseScatteringDto){
        const randomeNumofDrons= Math.floor(Math.random()*(20-15+1)+15);
        this.dronesLocation=[];
        for(let i =0 ;i<randomeNumofDrons;i++)
        {
            const randomRow = Math.floor(Math.random()*((input.rows-1)-0+1)+0);
            const randomcolumn = Math.floor(Math.random()*((input.columns-1)-0+1)+0);
            const route= this.createDroneRoute(randomRow,randomcolumn,input.rows,input.columns);
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
    riskCalculation (input:riskCalculationDto){
        if(this.dronesLocation.length === 0){
            throw new Error("No drones available for risk calculation");
        }

        const cells = input.cells;
        for (let i = 0; i < this.dronesLocation.length; i++) {
            const drone = this.dronesLocation[i];
            const droneLocarionIndex = this.dronesLocation[i].routeIndex;
            cells[drone.route[droneLocarionIndex].row * input.columns + drone.route[droneLocarionIndex].column].riskLevel += 3;
            for (let j =-1 ; j <= 1 ;j++)
                for(let k =-1 ; k <= 1 ;k++)
            {
                if(j===0&&k===0||drone.route[droneLocarionIndex].row+j<0||drone.route[droneLocarionIndex].row+j>=input.rows||drone.route[droneLocarionIndex].column+k<0||drone.route[droneLocarionIndex].column+k>=input.columns)
                continue;
                else
                cells[(drone.route[droneLocarionIndex].row+j) * input.columns +drone.route[droneLocarionIndex].column+k].riskLevel += 1;
            }
        }
        const updatedullMap:FullMap = {
            rows:input.rows,
            columns:input.columns,
            cells:cells.map(cell => ({
                row: cell.row,
                column: cell.column,   
                traversalTime: cell.traversalTime,
                riskLevel: cell.riskLevel 
            }))
        };
        return updatedullMap;
    }
}