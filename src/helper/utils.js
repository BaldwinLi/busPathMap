export const storePositionKeyword = (keyword) => {
  const postions = JSON.parse(window.localStorage.getItem('postions_history') || '[]');
  if (keyword) {
    const hasKeyword = postions.length > 0 && postions.some(e => e.title === keyword.title);
    if (!hasKeyword) {
        postions.push({title: keyword.title, point: {lng: keyword.point.lng, lat: keyword.point.lat}});
        window.localStorage.setItem('postions_history', JSON.stringify(postions));
    }
  }
  return postions;
}
