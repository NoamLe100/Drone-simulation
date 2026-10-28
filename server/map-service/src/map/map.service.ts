import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Cell,FullMap} from '../types';
import { MapDto } from '../dto/map.dto';
import { GetMapDto } from '../dto/get-map.dto';

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async createMap(input: MapDto): Promise<FullMap> {
  try {
    return await this.prisma.map.create({
      data: {
        rows: input.rows,
        columns: input.columns,
        cells: {
          create: input.cells,
        },
      },
      include: {
        cells: true,
      },
    });
  } catch (error) {
    console.error('Failed to create map', error);
    throw error;
    }
  }
  async getMap(input: GetMapDto): Promise<FullMap> {
    const data = await this.prisma.map.findUnique({
    where: { id: input.MapId },
    include: { cells: true },
    });
    if(!data){
        throw new Error(`the map ${input.MapId} does not exsiest`);
    }
    return{
        rows:data.rows,
        columns: data.columns,
        cells: data.cells,
    }
  }
  async dronseScattering (input: GetMapDto):Promise<FullMap>{
    const data= await this.prisma.map.fineUnique({
        where :{id:input.MapId},
        include:{cells:true}
    })
    if(!data){
        throw new Error(`the map ${input.MapId} does not exsiest`);
    }
    const randoomeNumofDrons= Math.floor(Math.random()*(50-30+1)+30);
    for(let i =0 ;i<randoomeNumofDrons;i++)
    {
        const randomrow = Math.floor(Math.random()*(data.rows-0+1)+0);
        const randomcolumn = Math.floor(Math.random()*(data.columns-0+1)+0);
        data.cells[randomrow *randomcolumn].drone =true;
    }
    return{
        rows:data.rows,
        columns: data.columns,
        cells: data.cells,
    }
  }
} 
