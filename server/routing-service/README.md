# Routing Service

The service listens on port `3004`. All endpoints require a valid JWT in the
`accessToken` cookie. Tokens are verified with `JWT_SECRET`; this service does
not issue tokens or accept credentials.

Cost arrays are flat, row-major arrays of exactly `rows * columns` values. A
cell's normal cost is `traversalTime + riskLevel`. In A*, consuming one
countermeasure changes that cell's cost to `traversalTime + resourcePenalty`.
Movement uses the four orthogonal neighboring cells.

## Plan

`POST /routing/plan`

```json
{
  "runId": "run-123",
  "rows": 2,
  "columns": 2,
  "traversalTimes": [1, 1, 1, 1],
  "riskLevels": [0, 4, 0, 0],
  "resourcePenalty": 1,
  "initialCountermeasures": 1,
  "start": { "row": 0, "column": 0 },
  "goal": { "row": 1, "column": 1 }
}
```

The response contains `path`, the per-step `resourcePlan`, and `totalCost`.
The service initializes D* Lite from the same grid and keeps its state in
memory for the run.

## Replan

`POST /routing/replan`

```json
{
  "runId": "run-123",
  "rows": 2,
  "columns": 2,
  "currentPosition": { "row": 0, "column": 1 },
  "changedCells": [
    { "row": 1, "column": 0, "traversalTime": 2, "riskLevel": 8 }
  ]
}
```

D* Lite updates the changed cells and their affected predecessors, then returns
the route from `currentPosition` to the original goal. Its search state is
process-local and is removed with `DELETE /routing/state/:runId` or lost when
the service restarts.