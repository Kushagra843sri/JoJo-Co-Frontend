// Lazily injects Cloudinary's real upload widget script, caching window.cloudinary
// so repeated calls (preload + the button click) never re-inject it.
export const loadCloudinaryWidget = () => {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) {
      resolve(window.cloudinary);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.onload = () => resolve(window.cloudinary);
    script.onerror = () => reject(new Error('Failed to load Cloudinary upload widget'));
    document.body.appendChild(script);
  });
};
