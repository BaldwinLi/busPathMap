// var $scope;
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
      anchor: "BOTTOM_LEFT",
      type: 'NAVIGATION_CONTROL_LARGE',
      enableGeolocation: true
    }
  }
  // {
  //   plugin: "Geolocation",
  //   option: {
  //     anchor: "BOTTOM_RIGHT"
  //   }
  // }
];

export const coordinatesOffsetList = {
  wgs84: {
    x: 1,
    y: 5
  },
  gcj02: {
    x: 3,
    y: 5
  }
}

let $result, $center;
const finalCallback = function (res) {
  switch ($scope.options.type) {
    case "BUS_STATION":
      // $result = {
      //   pois: []
      // };
      // if (res) {
      //   for (let i = 0; i < res.getCurrentNumPois(); i++) {
      //     const _result = res.getPoi(i);
      //     !$result.title && ($result.title = _result.title);
      //     $result.pois.push(_result);
      //   }
      // }
      res && ($result.name = res.getPoi(0) && res.getPoi(0).title);
      break;
    default:
      res &&
        ($result.name =
          (res.surroundingPois[0] && res.surroundingPois[0].title) ||
          res.business.split(",")[0]);
  }

  $scope.$emit("onGeolocationComplete", $result);
  $scope.updateLoadingStatus({
    isLoading: false
  });
};

const translateCallback = function (data) {
  if (data.status === 0) {
    // 创建标注
    $scope.currentPoint = $result.point = $result.center = $center =
      // data.points[0];
      new BMap.Point(126.63, 45.75);
    const icon = new BMap.Icon(
      "http://api0.map.bdimg.com/images/stop_icon.png",
      new BMap.Size(15, 15), {
        offset: new BMap.Size(10, 25),
        imageOffset: new BMap.Size(0, 0)
      }
    );
    icon.imageSize = new BMap.Size(15, 15);
    const marker = new BMap.Marker($scope.currentPoint, {
      icon
    });
    window["IMap"].centerAndZoom($scope.currentPoint, $scope.zoom);
    window["IMap"].addOverlay(marker);
    window["IMap"].addOverlay(
      new BMap.Circle($scope.currentPoint, 1000, {
        fillColor: "#0099ff",
        strokeWeight: 1,
        fillOpacity: 0.3,
        strokeOpacity: 0.3
      })
    );
    window["IMap"].panTo($scope.currentPoint);
    window["IMap"].enableScrollWheelZoom();
    $scope.initBusline();
    $scope.initRoute();
    $scope.initLocation();
    switch ($scope.options.type) {
      case "BUS_STATION":
        $scope.start.point = $scope.currentPoint;
        if ($.isEmptyObject($scope.$parent.$route.query)) {
          $scope.location.searchNearby('公交', $scope.start.point);
          // this.isHref = true;
        }
        $scope.$emit("onGeolocationComplete", $result);
        break;
      default:
        if (!$result.name) {
          $scope.geoc.getLocation($scope.currentPoint, finalCallback);
        } else {
          // $scope.geoc.getLocation(data.points[0], finalCallback);
          finalCallback();
        }
    }
  }
  // this.location.searchNearby("", this.start.point);
};

export const getCurrentPositionComplete = function (result) {
  // debugger;
  $result = result;

  if (result.type === "wgs84") {
    $center = result.point = result.center = new BMap.Point(
      result.longitude,
      result.latitude
    );
    result.name = "";
    // window["IMap"].addControl(new BMap.NavigationControl());
  } else {
    $center = result.point || result.center;
    // if (result.level === 1) {
    //   center = result.point = result.center = new BMap.Point(
    //     121.618726,
    //     38.919333
    //   );
    if ($scope.isCityPosition) {
      // result.name += "中心";
      $scope.isCityPosition = false;
    }
    // } else
    result.point = result.center = $center;
  }
  //坐标转换完之后的回调函数

  if (["gcj02", "wgs84"].includes(result.type)) {
    setTimeout(() => {
      const convertor = new BMap.Convertor();
      convertor.translate(
        [$center],
        coordinatesOffsetList[result.type].x,
        coordinatesOffsetList[result.type].y,
        translateCallback
      );
    });
  } else {
    translateCallback({
      status: 0,
      points: [$center]
    });
  }
}

export const refreshMap = function (refreshMap) {
  setTimeout(() => {
    $scope.updateLoadingStatus({
      isLoading: true
    });
    $scope.initLocation();
    switch ($scope.options.type) {
      case "DRIVING_SOLUTION":
      case "WALKING_SOLUTION":
      case "TRANSIT_SOLUTION":
        initMapContainer(true);
        window["IMap"].centerAndZoom($scope.currentPoint, $scope.zoom);
        $scope.initRoute();
        const _start = new BMap.Point(
          $scope.start.point && $scope.start.point.lng,
          $scope.start.point && $scope.start.point.lat
        );
        const _end = new BMap.Point(
          $scope.end.point && $scope.end.point.lng,
          $scope.end.point && $scope.end.point.lat
        );
        $scope.transit.search(_start, _end);
        break;
      case "BUS_LINE":
        $scope.initBusline();
        $scope.directSetBusLine = true;
        const numberMatch = $scope.busNum.match(/\d+/);
        if (numberMatch) $scope.busline.getBusList(numberMatch[0]);
        else $scope.updateLoadingStatus({
          isLoading: false
        });
        break;
      case "BUS_STATION":
        if ($scope.start.point) {
          const _start = new BMap.Point(
            $scope.start.point.lng,
            $scope.start.point.lat
          );
          $scope.location.searchNearby(
            ($scope.start.title && $scope.start.title.split("-")[0]) || "",
            _start
          );
        } else $scope.updateLoadingStatus({
          isLoading: false
        });
        break;
    }
  });
};

window["initMapContainer"] = function (unTriggerLoadComplete) {
  // const $scope = this;
  // forEach;
  window["IMap"] = new BMap.Map("map-container");
  $scope.geoc = new BMap.Geocoder();
  // window["IMap"].centerAndZoom(new BMap.Point(121.45, 39.02), 11);
  window["IMap"].addEventListener("click", e => {
    const point = new BMap.Point(e.point.lng, e.point.lat);
    // transit.search(point, point);
    $scope.geoc.getLocation(point, rs => {
      // const stationName = rs.business && rs.business.split(",")[0];

      if (rs.surroundingPois.length > 0) {
        $scope.$vux.confirm.show({
          title: rs.surroundingPois[0].title,
          content: rs.surroundingPois[0].address,
          onConfirm() {
            $scope.$emit("onGetClickPoi", {
              title: rs.surroundingPois[0].title,
              point: rs.surroundingPois[0].point
            });
          }
        });
      }
    });
  });
  $scope.installPlugin();
  !unTriggerLoadComplete && $scope.$emit("onLoadComplete", $scope);
  $($scope.$refs.mapContainer).height(
    $(window).height() + parseInt($scope.height || 0)
  );
  $($scope.$refs.mapContainer).width(
    $(window).width() + parseInt($scope.width || 0)
  );
};

export const initRoute = function (solution) {
  let routeType;
  switch ($scope.options.type) {
    case "TRANSIT_SOLUTION":
      routeType = "TransitRoute";
      // routePolicy = BMAP_TRANSIT_POLICY_RECOMMEND;
      break;
    case "DRIVING_SOLUTION":
      routeType = "DrivingRoute";
      // routePolicy = BMAP_DRIVING_POLICY_LEAST_TIME;
      break;
    case "WALKING_SOLUTION":
      routeType = "WalkingRoute";
      break;
  }
  routeType &&
    ($scope.transit = new BMap[routeType]($scope.currentPoint, {
      renderOptions: {
        map: IMap,
        panel: "path-result"
      },
      policy: solution && solution.advantages[0] && solution.advantages[0].policy,
      onSearchComplete: $scope.onRouteSearchComplete,
      onResultsHtmlSet: $scope.onResultsHtmlSet
    }));
};

export const initBusline = function () {
  $scope.busline = new BMap.BusLineSearch($scope.currentPoint, {
    renderOptions: {
      map: IMap,
      panel: "path-result",
      autoViewport: true
    },
    onGetBusListComplete: $scope.onBusLineSearchComplete,
    onGetBusLineComplete: $scope.onGetBusLineComplete,
    onBusListHtmlSet: $scope.onResultsHtmlSet,
    onMarkersSet: $scope.onMarkersSet
  });
};

export const initLocation = function () {
  $scope.location = new BMap.LocalSearch($scope.currentPoint, {
    renderOptions:
      ($scope.options.type === "BUS_STATION" && {
        map: IMap
        // panel: "path-result"
      }) || {},
    // $scope.options.type === "BUS_STATION" ? 100 :
    pageCapacity: 10,
    onMarkersSet: $scope.onMarkersSet,
    onResultsHtmlSet: $scope.onResultsHtmlSet,
    onSearchComplete: $scope.onLocalSearchComplete
  });
};

export const judgeHasDetail = function () {
  $scope.hasDetailHtml = true;
  setTimeout(() => {
    $($scope.$refs['pathResult']).children('*').length === 0 && ($scope.hasDetailHtml = false);
  });
}
