import bcrypt from "bcrypt";
import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { getDb, getSettingMap, mapSlotRow, setSettingEntries, writeAuditLog } from "../config/db.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";
import { createAdminToken } from "../utils/adminToken.js";

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }

  return next();
};

const mapAdminUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  isActive: Boolean(row.is_active),
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildDashboard = () => {
  const db = getDb();
  const settings = getSettingMap();
  const slotCounts = db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active
      FROM ad_slots
    `)
    .get();

  const providerBreakdown = db
    .prepare(`
      SELECT provider, COUNT(*) AS count
      FROM ad_slots
      GROUP BY provider
      ORDER BY provider ASC
    `)
    .all()
    .map((row) => ({
      provider: row.provider,
      count: row.count,
    }));

  const recentAudit = db
    .prepare(`
      SELECT audit_logs.id, audit_logs.action, audit_logs.entity_type, audit_logs.entity_id, audit_logs.created_at, admin_users.email AS actor_email
      FROM audit_logs
      LEFT JOIN admin_users ON admin_users.id = audit_logs.actor_id
      ORDER BY audit_logs.id DESC
      LIMIT 10
    `)
    .all()
    .map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      actorEmail: row.actor_email,
      createdAt: row.created_at,
    }));

  return {
    providers: {
      googleAdsenseEnabled: Boolean(settings.google_adsense_enabled),
      googleAdsenseClientId: settings.google_adsense_client_id || "",
      googleAdsenseAutoAds: Boolean(settings.google_adsense_auto_ads),
      metaPixelEnabled: Boolean(settings.meta_pixel_enabled),
      metaPixelId: settings.meta_pixel_id || "",
    },
    slots: {
      total: slotCounts.total || 0,
      active: slotCounts.active || 0,
      breakdown: providerBreakdown,
    },
    recentAudit,
  };
};

router.post(
  "/auth/login",
  [body("email").isEmail().withMessage("Valid email is required"), body("password").notEmpty().withMessage("Password is required")],
  validateRequest,
  async (req, res) => {
    const db = getDb();
    const email = req.body.email.trim().toLowerCase();
    const admin = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email);

    if (!admin || !admin.is_active) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(req.body.password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    db.prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?").run(new Date().toISOString(), new Date().toISOString(), admin.id);
    writeAuditLog({
      actorId: admin.id,
      action: "login",
      entityType: "admin_user",
      entityId: String(admin.id),
    });

    return res.json({
      token: createAdminToken(admin),
      user: mapAdminUser(admin),
      dashboard: buildDashboard(),
    });
  }
);

router.get("/auth/me", requireAdminAuth, (req, res) => {
  return res.json({
    user: req.admin,
  });
});

router.get("/dashboard", requireAdminAuth, (req, res) => {
  return res.json(buildDashboard());
});

router.get("/monetization/settings", requireAdminAuth, (req, res) => {
  return res.json({
    settings: getSettingMap(),
  });
});

router.put(
  "/monetization/settings",
  [
    body("googleAdsenseEnabled").optional().isBoolean(),
    body("googleAdsenseClientId").optional().isString(),
    body("googleAdsenseAutoAds").optional().isBoolean(),
    body("metaPixelEnabled").optional().isBoolean(),
    body("metaPixelId").optional().isString(),
    body("adsRenderPlaceholders").optional().isBoolean(),
  ],
  validateRequest,
  requireAdminAuth,
  (req, res) => {
    const currentSettings = getSettingMap();
    const getBooleanSetting = (fieldName, settingKey) => (fieldName in req.body ? Boolean(req.body[fieldName]) : Boolean(currentSettings[settingKey]));
    const getStringSetting = (fieldName, settingKey) => (fieldName in req.body ? req.body[fieldName]?.trim() || "" : currentSettings[settingKey] || "");

    const settingsPayload = [
      { key: "google_adsense_enabled", value: getBooleanSetting("googleAdsenseEnabled", "google_adsense_enabled") },
      { key: "google_adsense_client_id", value: getStringSetting("googleAdsenseClientId", "google_adsense_client_id") },
      { key: "google_adsense_auto_ads", value: getBooleanSetting("googleAdsenseAutoAds", "google_adsense_auto_ads") },
      { key: "meta_pixel_enabled", value: getBooleanSetting("metaPixelEnabled", "meta_pixel_enabled") },
      { key: "meta_pixel_id", value: getStringSetting("metaPixelId", "meta_pixel_id") },
      { key: "ads_render_placeholders", value: getBooleanSetting("adsRenderPlaceholders", "ads_render_placeholders") },
    ];

    setSettingEntries(settingsPayload);
    writeAuditLog({
      actorId: req.admin.id,
      action: "update",
      entityType: "monetization_settings",
      payload: req.body,
    });

    return res.json({
      settings: getSettingMap(),
    });
  }
);

router.get("/monetization/slots", requireAdminAuth, (req, res) => {
  const rows = getDb().prepare("SELECT * FROM ad_slots ORDER BY sort_order ASC, id ASC").all();
  return res.json({
    slots: rows.map(mapSlotRow),
  });
});

router.put(
  "/monetization/slots/:id",
  [
    param("id").isInt({ min: 1 }),
    body("adUnitId").optional().isString(),
    body("format").optional().isIn(["auto", "horizontal", "vertical", "rectangle"]),
    body("fullWidthResponsive").optional().isBoolean(),
    body("isActive").optional().isBoolean(),
    body("sortOrder").optional().isInt({ min: 0 }),
    body("notes").optional().isString(),
  ],
  validateRequest,
  requireAdminAuth,
  (req, res) => {
    const db = getDb();
    const existingSlot = db.prepare("SELECT * FROM ad_slots WHERE id = ?").get(Number(req.params.id));

    if (!existingSlot) {
      return res.status(404).json({ error: "Ad slot not found" });
    }

    db.prepare(`
        UPDATE ad_slots
        SET
          ad_unit_id = ?,
          format = ?,
          full_width_responsive = ?,
          is_active = ?,
          sort_order = ?,
          notes = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        req.body.adUnitId?.trim() ?? existingSlot.ad_unit_id ?? "",
        req.body.format || existingSlot.format || "auto",
        req.body.fullWidthResponsive === undefined ? existingSlot.full_width_responsive : req.body.fullWidthResponsive === false ? 0 : 1,
        req.body.isActive === undefined ? existingSlot.is_active : req.body.isActive === false ? 0 : 1,
        req.body.sortOrder === undefined ? existingSlot.sort_order : Number(req.body.sortOrder || 0),
        req.body.notes?.trim() ?? existingSlot.notes ?? "",
        new Date().toISOString(),
        Number(req.params.id)
      );

    const slot = db.prepare("SELECT * FROM ad_slots WHERE id = ?").get(Number(req.params.id));
    writeAuditLog({
      actorId: req.admin.id,
      action: "update",
      entityType: "ad_slot",
      entityId: String(req.params.id),
      payload: req.body,
    });

    return res.json({
      slot: mapSlotRow(slot),
    });
  }
);

router.get(
  "/audit",
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  requireAdminAuth,
  (req, res) => {
    const limit = Number(req.query.limit || 25);
    const rows = getDb()
      .prepare(`
        SELECT audit_logs.id, audit_logs.action, audit_logs.entity_type, audit_logs.entity_id, audit_logs.payload_json, audit_logs.created_at, admin_users.email AS actor_email
        FROM audit_logs
        LEFT JOIN admin_users ON admin_users.id = audit_logs.actor_id
        ORDER BY audit_logs.id DESC
        LIMIT ?
      `)
      .all(limit)
      .map((row) => ({
        id: row.id,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        actorEmail: row.actor_email,
        payload: row.payload_json ? JSON.parse(row.payload_json) : null,
        createdAt: row.created_at,
      }));

    return res.json({
      logs: rows,
    });
  }
);

export default router;
