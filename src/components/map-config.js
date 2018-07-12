// export const TRANSIT_POLICY = {
//   RECOMMEND: BMAP_TRANSIT_POLICY_RECOMMEND,
//   LEAST_TIME: BMAP_TRANSIT_POLICY_LEAST_TIME,
//   LEAST_TRANSFER: BMAP_TRANSIT_POLICY_LEAST_TRANSFER,
//   LEAST_WALKING: BMAP_TRANSIT_POLICY_LEAST_WALKING,
//   AVOID_SUBWAYS: BMAP_TRANSIT_POLICY_AVOID_SUBWAYS,
//   FIRST_SUBWAYS: BMAP_TRANSIT_POLICY_FIRST_SUBWAYS
// }

export const commonPluginOptions = [{
    plugin: "Scale",
    option: {
      anchor: "BOTTOM_LEFT",
      offset: undefined
    }
  }, {
    plugin: "Navigation",
    option: {
      anchor: "TOP_LEFT",
      type: 'NAVIGATION_CONTROL_LARGE',
      enableGeolocation: true
    }
  },{
    plugin: "Geolocation",
    option: {
      anchor: "BOTTOM_RIGHT"
    }
  }
];
