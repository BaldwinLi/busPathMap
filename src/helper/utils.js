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
