import { gridConfig,toRadian,metersPerDegreeLongitude} from './gridConfig';
import { Rectangle } from 'cesium';
export function createGridRectangle() {
    const {topLeftLatitude ,topLeftLongitude, rows, columns,
          CELL_SIZE_METERS,METERS_PER_DEGREE} =gridConfig;
    const metersSouth = rows * CELL_SIZE_METERS;
    const metersEast = columns* CELL_SIZE_METERS;  
    return new Rectangle(
        toRadian(topLeftLongitude),
        toRadian(topLeftLatitude - metersSouth / METERS_PER_DEGREE),
        toRadian(topLeftLongitude + metersEast / metersPerDegreeLongitude(METERS_PER_DEGREE,topLeftLatitude)),
        toRadian(topLeftLatitude)
    );
}


