import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { aStar } from './algorithms/astar';
import { buildCostGrid } from './algorithms/costGrid';
import { DStarLite } from './algorithms/dstarLite';
import { Cell, ChangedCell } from './algorithms/types';
import { PlanRouteDto } from './dto/plan-route.dto';
import { ReplanRouteDto } from './dto/replan-route.dto';
import { PrismaService } from './prisma/prisma.service';
import { RouteStateStore } from './state/route-state.store';

@Injectable()
export class RoutingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateStore: RouteStateStore,
  ) {}

  async plan(input: PlanRouteDto) {
    try {
      const costGrid = buildCostGrid(input);
      const result = aStar(costGrid, input.start, input.goal, input.initialCountermeasures);
      if (!result) throw new NotFoundException('No route exists between start and goal');

      const dstar = new DStarLite();
      dstar.initialize(costGrid, input.start, input.goal);
      dstar.computeShortestPath();

      await this.prisma.routePlan.create({
        data: {
          runId: input.runId,
          type: 'INITIAL',
          path: result.path as unknown as Prisma.InputJsonValue,
        },
      });
      this.stateStore.set(input.runId, dstar.getState());
      return result;
    } catch (error) {
      this.rethrowInputError(error);
    }
  }

  async replan(input: ReplanRouteDto) {
    const stored = this.stateStore.get(input.runId);
    if (!stored) throw new NotFoundException(`No route state found for runId ${input.runId}`);
    if (input.rows !== stored.costGrid.rows || input.columns !== stored.costGrid.columns) {
      throw new BadRequestException('Grid dimensions do not match the stored route state');
    }

    try {
      const dstar = new DStarLite(stored);
      dstar.updateChangedCosts(input.changedCells as ChangedCell[]);
      dstar.moveStart(input.currentPosition as Cell);
      dstar.computeShortestPath();
      const path = dstar.getPath();
      if (!path) throw new NotFoundException('No route exists from the current position to the goal');

      await this.prisma.routePlan.create({
        data: {
          runId: input.runId,
          type: 'REPLAN',
          path: path as unknown as Prisma.InputJsonValue,
        },
      });
      this.stateStore.set(input.runId, dstar.getState());
      return { path, totalCost: dstar.getState().g[input.currentPosition.row * input.columns + input.currentPosition.column] };
    } catch (error) {
      this.rethrowInputError(error);
    }
  }

  deleteState(runId: string): { deleted: boolean } {
    return { deleted: this.stateStore.delete(runId) };
  }

  private rethrowInputError(error: unknown): never {
    if (error instanceof RangeError) throw new BadRequestException(error.message);
    throw error;
  }
}