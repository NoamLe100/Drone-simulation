import { gridConfig, metersPerDegreeLongitude } from './gridConfig';

const METERS_PER_DEGREE= 111320;


export function cellToCoordinates(row: number, column: number) {
    if (row < 0 || row >= gridConfig.rows || column < 0 || column >= gridConfig.columns) {
        throw new Error(`Invalid row or column: (${row}, ${column})`);
    }
    const { topLeftLatitude, topLeftLongitude, CELL_SIZE_METERS } = gridConfig;
    const metersSouth = (row+0.50) * CELL_SIZE_METERS;
    const metersEast = (column+0.50) * CELL_SIZE_METERS;
    const latitude = topLeftLatitude - metersSouth / METERS_PER_DEGREE;
    const longitude = topLeftLongitude + metersEast /metersPerDegreeLongitude(METERS_PER_DEGREE,topLeftLatitude);
    return {latitude,longitude}
}