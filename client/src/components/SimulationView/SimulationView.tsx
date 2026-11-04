import { Cartesian3, Ion, Terrain } from 'cesium';
import { CameraFlyTo, Viewer } from 'resium';
import { cellToCoordinates } from '../../simulation/gridGeo';
import { createMap, createRandomDrones } from '../../simulation/mockMap';
import RiskGridLayer from '../RiskGridLayer/RiskGridLayer';


Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
const drones = createRandomDrones();
const map = createMap(drones);
const terrain = Terrain.fromWorldTerrain();
const gridCenter = cellToCoordinates(50, 50);
const startPosition = Cartesian3.fromDegrees(gridCenter.longitude, gridCenter.latitude, 20000);

function SimulationView() {
    return (
        <Viewer full terrain={terrain}>
            <CameraFlyTo destination={startPosition} duration={0} />
            <RiskGridLayer map={map} />
        </Viewer>
    );
}
export default SimulationView;