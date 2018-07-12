export const storePositionKeyword = (keyword) => {
  const postions = JSON.parse(window.localStorage.getItem('postions_history') || '[]');
  if (keyword) {
    const hasKeyword = postions.length > 0 && postions.some(e => e.title === keyword.title);
    if (!hasKeyword) {
      postions.push({
        title: keyword.title,
        point: {
          lng: keyword.point.lng,
          lat: keyword.point.lat
        }
      });
      window.localStorage.setItem('postions_history', JSON.stringify(postions));
    }
  }
  return postions;
}

export const storeBusLineKeyword = (keyword) => {
  const buslines = JSON.parse(window.localStorage.getItem('busline_history') || '[]');
  if (keyword) {
    const hasKeyword = buslines.length > 0 && buslines.some(e => e.forward === keyword.forword);
    if (!hasKeyword) {
      buslines.push(keyword);
      window.localStorage.setItem('busline_history', JSON.stringify(buslines));
    }
  }
  return buslines;
}

export const storeBusStationKeyword = (keyword) => {
  const busstations = JSON.parse(window.localStorage.getItem('busstation_history') || '[]');
  if (keyword) {
    const hasKeyword = busstations.length > 0 && busstations.some(e => e.title === keyword.title);
    if (!hasKeyword) {
      busstations.push(keyword);
      window.localStorage.setItem('busstation_history', JSON.stringify(busstations));
    }
  }
  return busstations;
}