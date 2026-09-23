// Delivery URLs for an uploaded Cloudinary video. The stored `secure_url` is
// the original upload (often a 10–30 MB phone .mov); inserting transformations
// after `/upload/` has Cloudinary serve a compressed, width-capped H.264 .mp4
// that plays on every browser, plus a still frame to show before it loads.
const withTransform = (url, transform, extension) =>
  url.replace('/upload/', `/upload/${transform}/`).replace(/\.[a-z0-9]+$/i, `.${extension}`);

export const getVideoDeliveryUrl = (url) => withTransform(url, 'q_auto,vc_h264,w_720,c_limit', 'mp4');

export const getVideoPosterUrl = (url) => withTransform(url, 'so_0,q_auto,w_720,c_limit', 'jpg');
