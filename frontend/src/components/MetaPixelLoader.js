import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { monetizationPublicApi } from "../services/api";
import { ensureGoogleAdsenseScript, installMetaPixel } from "../services/monetizationScripts";

const MetaPixelLoader = () => {
  const location = useLocation();
  const [googleAdsenseClientId, setGoogleAdsenseClientId] = useState("");
  const [googleAdsenseEnabled, setGoogleAdsenseEnabled] = useState(false);
  const [googleAutoAdsEnabled, setGoogleAutoAdsEnabled] = useState(false);
  const [metaPixelId, setMetaPixelId] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    monetizationPublicApi
      .getBootstrap()
      .then((response) => {
        if (!active) {
          return;
        }

        setGoogleAdsenseEnabled(Boolean(response.data.settings.googleAdsenseEnabled));
        setGoogleAdsenseClientId(response.data.settings.googleAdsenseClientId || "");
        setGoogleAutoAdsEnabled(Boolean(response.data.settings.googleAdsenseAutoAds));
        setEnabled(Boolean(response.data.settings.metaPixelEnabled));
        setMetaPixelId(response.data.settings.metaPixelId || "");
      })
      .catch(() => {
        if (active) {
          setGoogleAdsenseEnabled(false);
          setGoogleAdsenseClientId("");
          setGoogleAutoAdsEnabled(false);
          setEnabled(false);
          setMetaPixelId("");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!googleAdsenseEnabled || !googleAutoAdsEnabled || !googleAdsenseClientId) {
      return;
    }

    ensureGoogleAdsenseScript(googleAdsenseClientId).catch(() => {
      // Ignore provider script errors to keep the public UI usable.
    });
  }, [googleAdsenseClientId, googleAdsenseEnabled, googleAutoAdsEnabled]);

  useEffect(() => {
    if (!enabled || !metaPixelId) {
      return;
    }

    installMetaPixel(metaPixelId);
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [enabled, metaPixelId, location.pathname]);

  return null;
};

export default MetaPixelLoader;
