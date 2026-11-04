import { useMemo } from 'react';
import { ImageMaterialProperty } from 'cesium';
import { Entity } from 'resium';
import type { FullMap } from '../../simulation/types';
import { droneConfig } from '../../simulation/droneConfig';
import { createGridRectangle } from '../../simulation/gridRectangle';

const PIXELS_PER_CELL = 8;
const gridRectangle = createGridRectangle();

interface RiskGridLayerProps {
  map: FullMap;
}

function riskColor(riskLevel: number): string {
  if (riskLevel <= 0) {
    return 'rgba(0, 0, 0, 0)';
  }
  const ratio = Math.min(riskLevel / droneConfig.maxRiskLevel, 1);
  const green = Math.round(220 * (1 - ratio));
  const alpha = 0.3 + 0.5 * ratio;
  return `rgba(255, ${green}, 0, ${alpha})`;
}

function buildRiskCanvas(map: FullMap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = map.columns * PIXELS_PER_CELL;
  canvas.height = map.rows * PIXELS_PER_CELL;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not supported');
  }

  for (const cell of map.cells) {
    context.fillStyle = riskColor(cell.riskLevel);
    context.fillRect(
      cell.column * PIXELS_PER_CELL,
      cell.row * PIXELS_PER_CELL,
      PIXELS_PER_CELL,
      PIXELS_PER_CELL,
    );
  }

  return canvas;
}

function RiskGridLayer({ map }: RiskGridLayerProps) {
  const material = useMemo(
    () => new ImageMaterialProperty({ image: buildRiskCanvas(map), transparent: true }),
    [map],
  );

  return <Entity rectangle={{ coordinates: gridRectangle, material }} />;
}

export default RiskGridLayer;