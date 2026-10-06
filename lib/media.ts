// Cloudinary puts videos under /video/upload/, so the URL alone tells us the type.
export function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov)(\?.*)?$/i.test(url);
}

// Small card/list image: use the thumbnail, else the hero if it is an image (never a video).
export function cardImage(thumbnail?: string | null, hero?: string | null) {
  return thumbnail || (hero && !isVideoUrl(hero) ? hero : null);
}
