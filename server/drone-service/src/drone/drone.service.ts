    import {BadRequestException, Injectable} from "@nestjs/common";  
    import { Drone,Location,FullMap } from "../type";
    @Injectable()
    export class DronesService {
        private dronesLocation:Drone[]=[];
        private map:FullMap|null=null;   

        dronseScattering (input:FullMap){  
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
                movingForward: true,
                mode: "Patrol"
            };
            this.dronesLocation.push(drone);
        }
        this.map=this.riskCalculation(input);   
        return {  
            drones:this.getDronesPositions(),
            map:this.map
        };
    }
    createDroneRoute (row:number,column:number,maxRow:number,maxColumn:number):Location[]{
        const location:Location[]=[];
        for(let i =0 ;i<5;i++)
        {
            if (row + i < maxRow && column + i < maxColumn)
            {
                location.push({ row: row + i, column: column + i });
            }
            else if (row - i >= 0 && column - i >= 0)
            {
                location.push({ row: row - i, column: column - i });
            }
            else
            continue;
        }
        return location;
    }
    riskCalculation (map: FullMap): FullMap {
        if(this.dronesLocation.length === 0){
            throw new BadRequestException("No drones available for risk calculation");   
        }

        const cells = map.cells.map((cell) => ({ ...cell, riskLevel: 0 }));
        for (let i = 0; i < this.dronesLocation.length; i++) {
            const drone = this.dronesLocation[i];
            const droneLocarionIndex = this.dronesLocation[i].routeIndex;
            cells[drone.route[droneLocarionIndex].row * map.columns + drone.route[droneLocarionIndex].column].riskLevel += 3;
            for (let j =-1 ; j <= 1 ;j++)
                for(let k =-1 ; k <= 1 ;k++)
            {
                if(j===0&&k===0||drone.route[droneLocarionIndex].row+j<0||drone.route[droneLocarionIndex].row+j>=map.rows||drone.route[droneLocarionIndex].column+k<0||drone.route[droneLocarionIndex].column+k>=map.columns)
                continue;
                else
                cells[(drone.route[droneLocarionIndex].row+j) * map.columns +drone.route[droneLocarionIndex].column+k].riskLevel += 1;
            }
        }
        const updatedFullMap:FullMap = {
            rows:map.rows,
            columns:map.columns,
            cells:cells.map(cell => ({
                row: cell.row,
                column: cell.column,   
                traversalTime: cell.traversalTime,
                riskLevel: cell.riskLevel 
            }))
        };
        return updatedFullMap;
    }
    stepDrones(){
        for (let i = 0; i < this.dronesLocation.length; i++) {
            const drone = this.dronesLocation[i];
            if (drone.routeIndex === drone.route.length - 1) 
                drone.movingForward=false

            else if (drone.routeIndex === 0)
                drone.movingForward=true;

            if (drone.routeIndex < drone.route.length - 1&&drone.movingForward===true) 
                drone.routeIndex++;

            else if (drone.routeIndex > 0&&drone.movingForward===false)
                drone.routeIndex--;
        }
    }

    step(){
        const previousMap=this.map;   
        if(previousMap===null){   
            throw new BadRequestException("Scatter drones first");
        }

        this.stepDrones();
        const newMap=this.riskCalculation(previousMap);   
        const changedCells=[];   
        for (let i = 0; i < newMap.cells.length; i++) {
            if (newMap.cells[i].riskLevel !== previousMap.cells[i].riskLevel)
                changedCells.push(newMap.cells[i]);
        }

        this.map=newMap;  
        return {  
            drones:this.getDronesPositions(),
            changedCells:changedCells
        };
    }

    getDronesPositions(){   
        const positions:Location[]=[];
        for (let i = 0; i < this.dronesLocation.length; i++) {
            const drone = this.dronesLocation[i];
            positions.push(drone.route[drone.routeIndex]);
        }
        return positions;
    }
}