import React, { useEffect, useRef, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { monetizationPublicApi } from "../services/api";
import { ensureGoogleAdsenseScript } from "../services/monetizationScripts";

const AdSlot = ({ slotKey, pageKey, sx = {} }) => {
  const adElementRef = useRef(null);
  const [slotPayload, setSlotPayload] = useState({
    slot: null,
    settings: null,
  });

  useEffect(() => {
    let active = true;

    monetizationPublicApi
      .getSlot(slotKey, pageKey)
      .then((response) => {
        if (active) {
          setSlotPayload({
            slot: response.data.slot,
            settings: response.data.settings,
          });
        }
      })
      .catch(() => {
        if (active) {
          setSlotPayload({
            slot: null,
            settings: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [pageKey, slotKey]);

  useEffect(() => {
    const slot = slotPayload.slot;
    const settings = slotPayload.settings;

    if (!slot || !slot.canRender || !settings?.googleAdsenseClientId || !adElementRef.current) {
      return;
    }

    if (adElementRef.current.dataset.rendered === "true") {
      return;
    }

    ensureGoogleAdsenseScript(settings.googleAdsenseClientId)
      .then(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adElementRef.current.dataset.rendered = "true";
        } catch (error) {
          // Swallow Google script re-render errors in dev mode.
        }
      })
      .catch(() => {
        // Ignore script load errors so the app UI stays usable.
      });
  }, [slotPayload]);

  const slot = slotPayload.slot;
  if (!slot) {
    return null;
  }

  if (!slot.canRender && !slot.placeholderEnabled) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: "background.paper",
        ...sx,
      }}
    >
      {slot.canRender ? (
        <Box sx={{ minHeight: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ins
            key={`${slot.id}-${pageKey}-${slot.adUnitId || "unset"}-${slot.format || "auto"}`}
            ref={adElementRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={slotPayload.settings.googleAdsenseClientId}
            data-ad-slot={slot.adUnitId}
            data-ad-format={slot.format || "auto"}
            data-full-width-responsive={slot.fullWidthResponsive ? "true" : "false"}
          />
        </Box>
      ) : (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            textAlign: "center",
            backgroundColor: "rgba(63, 81, 181, 0.03)",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Ad slot ready
          </Typography>
          <Typography variant="body2" color="text.secondary">
            `{slot.name}` is configured but still needs a valid Google AdSense client ID and ad unit ID.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AdSlot;
