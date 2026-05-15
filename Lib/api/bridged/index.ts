export { getRaceResultsBridged, getRaceDetailBridged } from "./races";
export { getDriverCareerBridged, getDriverSeasonBridged } from "./drivers";
export { getSeasonScheduleBridged, getDriverStandingsBridged, getConstructorStandingsBridged } from "./standings";

import * as races from "./races";
import * as drivers from "./drivers";
import * as standings from "./standings";

const _default = {
  ...races,
  ...drivers,
  ...standings,
};

export default _default;
