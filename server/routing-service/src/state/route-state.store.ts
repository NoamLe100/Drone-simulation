import { Injectable } from '@nestjs/common';
import { DStarLiteState } from '../algorithms/dstarLite';

@Injectable()
export class RouteStateStore {
  private readonly states = new Map<string, DStarLiteState>();

  get(runId: string): DStarLiteState | undefined {
    const state = this.states.get(runId);
    return state ? structuredClone(state) : undefined;
  }

  set(runId: string, state: DStarLiteState): void {
    this.states.set(runId, structuredClone(state));
  }

  delete(runId: string): boolean {
    return this.states.delete(runId);
  }
}