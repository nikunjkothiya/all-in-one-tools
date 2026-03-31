import express from "express";
import { query, validationResult } from "express-validator";
import { getDb, getSettingMap, mapSlotRow } from "../config/db.js";

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }

  return next();
};

const resolvePageKey = (pageKey) => {
  if (!pageKey || pageKey === "/") {
    return "home";
  }

  if (pageKey.startsWith("/")) {
    return pageKey.replace(/^\//, "");
  }

  return pageKey;
};

router.get("/monetization/bootstrap", (req, res) => {
  const settings = getSettingMap();
  return res.json({
    settings: {
      googleAdsenseEnabled: Boolean(settings.google_adsense_enabled),
      googleAdsenseClientId: settings.google_adsense_client_id || "",
      googleAdsenseAutoAds: Boolean(settings.google_adsense_auto_ads),
      metaPixelEnabled: Boolean(settings.meta_pixel_enabled),
      metaPixelId: settings.meta_pixel_id || "",
      adsRenderPlaceholders: settings.ads_render_placeholders !== false,
    },
  });
});

router.get(
  "/monetization/slot",
  [query("slotKey").notEmpty().withMessage("slotKey is required"), query("pageKey").optional().isString()],
  validateRequest,
  (req, res) => {
    const settings = getSettingMap();
    const slotKey = req.query.slotKey.trim();
    const pageKey = resolvePageKey(req.query.pageKey || "all");

    const row = getDb()
      .prepare(`
        SELECT *
        FROM ad_slots
        WHERE key = ?
          AND is_active = 1
          AND page_key IN ('all', ?, 'tools')
        ORDER BY sort_order ASC
        LIMIT 1
      `)
      .get(slotKey, pageKey);

    if (!row) {
      return res.json({ slot: null });
    }

    const slot = mapSlotRow(row);
    const shouldRenderPlaceholder = settings.ads_render_placeholders !== false;
    const googleAdsenseEnabled = Boolean(settings.google_adsense_enabled);
    const googleAdsenseClientId = settings.google_adsense_client_id || "";

    return res.json({
      slot: {
        ...slot,
        canRender: googleAdsenseEnabled && Boolean(googleAdsenseClientId) && Boolean(slot.adUnitId),
        placeholderEnabled: shouldRenderPlaceholder,
      },
      settings: {
        googleAdsenseEnabled,
        googleAdsenseClientId,
      },
    });
  }
);

export default router;
