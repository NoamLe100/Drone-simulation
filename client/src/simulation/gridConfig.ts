export const gridConfig = {
  topLeftLatitude: 30.71316,
  topLeftLongitude: 34.89586,
  rows: 100,
  columns: 100,
  CELL_SIZE_METERS: 100,
  METERS_PER_DEGREE : 111320,
};
export function toRadian(degree: number): number {
    return degree * (Math.PI / 180);
}
export function toDegree(radian: number): number {
    return radian * (180 / Math.PI);
}
export function metersPerDegreeLongitude(METERS_PER_DEGREE:number,Latitude:number){
    return METERS_PER_DEGREE * Math.cos(Latitude * Math.PI / 180)
}

