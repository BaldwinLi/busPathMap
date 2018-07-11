import store from '@/vuex/store';

export let busline;
export let transit;
export let geoc;
export let location;
export let busPoi;
let $onLoadCallback;
let mapOptions;

window['initMapContainer'] = () => {
  window['IMap'] = new BMap.Map('map-container');
  geoc = new BMap.Geocoder();
  window['IMap'].centerAndZoom(new BMap.Point(121.45, 39.02), 11);
  window['IMap'].addEventListener("click", function (e) {
    const point = new BMap.Point(e.point.lng, e.point.lat);
    // transit.search(point, point);
    geoc.getLocation(point, (rs) => {
      const stationName = rs.business && rs.business.split(',')[0];
      alert(stationName);
    });
  });
  // window['IMap'].addEventListener("tilesloaded", () => {
  switch (mapOptions.type) {
    case 'LOCAL_SEARCH':
      location = new BMap.LocalSearch(IMap, {
        renderOptions: {
          map: IMap
        },
        onSearchComplete: onLocalSearchComplete
      });
      break;
    case 'BUS_LINE':
      busline = new BMap.BusLineSearch(IMap, {
        renderOptions: {
          map: IMap,
          panel: "bus-path-result"
        },
        onGetBusListComplete: onBusLineSearchComplete
      });
      break;
    case 'TRANSIT_SOLUTION':
      transit = new BMap.TransitRoute(IMap, {
        renderOptions: {
          map: IMap
        },
        onSearchComplete: onTranitRouteSearchComplete
      });
      break;
  }
  $onLoadCallback(true);
  // });
}

function onLocalSearchComplete(result) {
  if (result) {
    for (var i = 0; i < result.getCurrentNumPois(); i++) {
      const poi = result.getPoi(i);
      if (poi.type == BMAP_POI_TYPE_BUSSTOP) {
        busPoi = poi;
      }
    }
  }
}

function onBusLineSearchComplete(result) {
  if (result) {
    const fstLine = result.getBusListItem(0); //获取第一个公交列表显示到map上
    busline.getBusLine(fstLine);
  }
}

function onTranitRouteSearchComplete(result) {
  if (result) {
    // alert(result)
  }
}

export default (options, onLoadCallback) => {
  mapOptions = options;
  $onLoadCallback = onLoadCallback;
  if (!window['BMap']) {
    const bmapKey = store.getters.isLocal ? '7sOe1hVYh0n2yFCVYkkSLoXY0oQGNbgq' : '7sOe1hVYh0n2yFCVYkkSLoXY0oQGNbgq'
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('type', 'text/javascript');
    scriptEl.setAttribute('src', `http://api.map.baidu.com/api?v=3.0&ak=${bmapKey}&callback=initMapContainer`);
    document.getElementsByTagName('head')[0].appendChild(scriptEl);
    // return new Promise(function (resolve) {
    //   // scriptEl.onload = () => {
    //     initMapContainer(resolve);
    //   // }
    // });
  } else {
    initMapContainer();
  }
  // else {
  // return new Promise(function (resolve) {
  // initMapContainer(resolve);
  // });
  // }
};

const getZoom = (distance) => {
  const zoom = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000] //级别18到3
  return 18 - zoom.findIndex(e => {
    return e - distance > 0
  }) + 1;
}


export const markerMap = (title, longitude, latitude) => {
  // geolocation.getCurrentPosition();
  // AMap.event.addListener(geolocation, "complete", value => {
  //   new AMap.Marker({
  //     position: [value.position.lng, value.position.lat],
  //     title: '当前位置',
  //     map: IMap
  //   });
  // const distance = Math.sqrt(
  //   Math.pow(
  //     longitude - store.state.currentPosition.longitude,
  //     2) +
  //   Math.pow(
  //     latitude - store.state.currentPosition.latitude,
  //     2)
  // ) * 111320;
  const currentPosition = new AMap.LngLat(store.state.currentPosition.longitude, store.state.currentPosition.latitude);
  const targetPosition = new AMap.LngLat(longitude, latitude);
  const distance = currentPosition.distance(targetPosition);
  // 48000/(distance*111320)
  IMap.setZoom(getZoom(distance));
  let cLongitude, cLatitude;
  if (longitude > store.state.currentPosition.longitude) {
    cLongitude = store.state.currentPosition.longitude + (longitude - store.state.currentPosition.longitude) / 2
  } else {
    cLongitude = longitude + (store.state.currentPosition.longitude - longitude) / 2
  }
  if (latitude > store.state.currentPosition.latitude) {
    cLatitude = store.state.currentPosition.latitude + (latitude - store.state.currentPosition.latitude) / 2
  } else {
    cLatitude = latitude + (store.state.currentPosition.latitude - latitude) / 2
  }
  IMap.setCenter([cLongitude, cLatitude]);
  // });
  // IMap.setZoom(10);

  new AMap.Marker({
    position: [store.state.currentPosition.longitude, store.state.currentPosition.latitude],
    title: '当前位置',
    map: IMap
  });
  new AMap.Marker({
    position: [longitude, latitude],
    title,
    content: `<i class="fa fa-map-marker map-mark" aria-hidden="true"></i>`,
    // offset: new AMap.Pixel(-12, -12),
    map: IMap
  });
  return (distance / 1000).toFixed(3);
}
