export const ensureGoogleAdsenseScript = (clientId) =>
  new Promise((resolve, reject) => {
    if (!clientId) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[data-adsense-client="${clientId}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = "anonymous";
    script.dataset.adsenseClient = clientId;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

export const installMetaPixel = (pixelId) => {
  if (!pixelId) {
    return;
  }

  if (!window.fbq) {
    ((f, b, e, v, n, t, s) => {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  }

  if (window.__metaPixelInitialized !== pixelId) {
    window.fbq("init", pixelId);
    window.__metaPixelInitialized = pixelId;
  }
};
