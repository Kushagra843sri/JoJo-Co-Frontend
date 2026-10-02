// Every distinct photo of a product, in order. Older products stored photos in
// per-shade groups; they're all just photos of the product now.
export const getProductPhotos = (product) => {
  const urls = [];
  (product?.images || []).forEach((group) =>
    (group.urls || []).forEach((url) => {
      if (url && !urls.includes(url)) urls.push(url);
    })
  );
  return urls;
};

// Photos of the clothes only — the admin can flag some photos as size charts,
// which belong on the product page but not on the home strip or as a cover.
export const getShowcasePhotos = (product) => {
  const charts = product?.sizeChartUrls || [];
  return getProductPhotos(product).filter((url) => !charts.includes(url));
};

// The photo used on cards and in the cart: the first non-chart photo (falling
// back to any photo if every one is flagged as a chart).
export const getCoverPhoto = (product) => getShowcasePhotos(product)[0] || getProductPhotos(product)[0];
