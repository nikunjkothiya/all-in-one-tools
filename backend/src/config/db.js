import bcrypt from "bcrypt";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import config from "./env.js";
import { backendRoot } from "./paths.js";

let dbInstance;

const defaultSlots = [
  {
    key: "global-top",
    name: "Global Top Banner",
    pageKey: "all",
    provider: "google_adsense",
    format: "auto",
    fullWidthResponsive: 1,
    isActive: 0,
    sortOrder: 1,
    notes: "Shown near the top of public pages.",
  },
  {
    key: "home-after-hero",
    name: "Homepage Promo Slot",
    pageKey: "home",
    provider: "google_adsense",
    format: "rectangle",
    fullWidthResponsive: 1,
    isActive: 0,
    sortOrder: 2,
    notes: "Shown after the homepage hero.",
  },
  {
    key: "tool-inline",
    name: "Tool Page Inline Slot",
    pageKey: "tools",
    provider: "google_adsense",
    format: "auto",
    fullWidthResponsive: 1,
    isActive: 0,
    sortOrder: 3,
    notes: "Shown inside tool pages.",
  },
];

const defaultSettings = {
  google_adsense_enabled: false,
  google_adsense_client_id: "",
  google_adsense_auto_ads: false,
  meta_pixel_enabled: false,
  meta_pixel_id: "",
  ads_render_placeholders: true,
};

const now = () => new Date().toISOString();

const resolveDatabasePath = () => {
  if (path.isAbsolute(config.sqlitePath)) {
    return config.sqlitePath;
  }

  return path.join(backendRoot, config.sqlitePath);
};

const createTables = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'super_admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monetization_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ad_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      page_key TEXT NOT NULL DEFAULT 'all',
      provider TEXT NOT NULL DEFAULT 'google_adsense',
      ad_unit_id TEXT,
      format TEXT NOT NULL DEFAULT 'auto',
      full_width_responsive INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (actor_id) REFERENCES admin_users(id)
    );
  `);
};

const seedDefaultSettings = (db) => {
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO monetization_settings (key, value_json, created_at, updated_at)
    VALUES (@key, @valueJson, @createdAt, @updatedAt)
  `);

  Object.entries(defaultSettings).forEach(([key, value]) => {
    insertSetting.run({
      key,
      valueJson: JSON.stringify(value),
      createdAt: now(),
      updatedAt: now(),
    });
  });
};

const seedDefaultSlots = (db) => {
  const insertSlot = db.prepare(`
    INSERT OR IGNORE INTO ad_slots (
      key,
      name,
      page_key,
      provider,
      ad_unit_id,
      format,
      full_width_responsive,
      is_active,
      sort_order,
      notes,
      created_at,
      updated_at
    ) VALUES (
      @key,
      @name,
      @pageKey,
      @provider,
      @adUnitId,
      @format,
      @fullWidthResponsive,
      @isActive,
      @sortOrder,
      @notes,
      @createdAt,
      @updatedAt
    )
  `);

  defaultSlots.forEach((slot) => {
    insertSlot.run({
      key: slot.key,
      name: slot.name,
      pageKey: slot.pageKey,
      provider: slot.provider,
      adUnitId: "",
      format: slot.format,
      fullWidthResponsive: slot.fullWidthResponsive,
      isActive: slot.isActive,
      sortOrder: slot.sortOrder,
      notes: slot.notes,
      createdAt: now(),
      updatedAt: now(),
    });
  });
};

const seedDefaultAdmin = (db) => {
  if (!config.adminSeedEmail || !config.adminSeedPassword) {
    return;
  }

  const existingAdmin = db.prepare("SELECT id FROM admin_users WHERE email = ?").get(config.adminSeedEmail.toLowerCase());
  if (existingAdmin) {
    return;
  }

  const passwordHash = bcrypt.hashSync(config.adminSeedPassword, 10);
  db.prepare(`
    INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, 'super_admin', 1, ?, ?)
  `).run(config.adminSeedEmail.toLowerCase(), passwordHash, config.adminSeedName, now(), now());
};

export const initializeDatabase = () => {
  if (dbInstance) {
    return dbInstance;
  }

  const databasePath = resolveDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  dbInstance = new Database(databasePath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("foreign_keys = ON");

  createTables(dbInstance);
  seedDefaultSettings(dbInstance);
  seedDefaultSlots(dbInstance);
  seedDefaultAdmin(dbInstance);

  return dbInstance;
};

export const getDb = () => {
  if (!dbInstance) {
    return initializeDatabase();
  }

  return dbInstance;
};

export const getSettingMap = () => {
  const rows = getDb().prepare("SELECT key, value_json FROM monetization_settings").all();
  return rows.reduce((accumulator, row) => {
    try {
      accumulator[row.key] = JSON.parse(row.value_json);
    } catch (error) {
      accumulator[row.key] = row.value_json;
    }
    return accumulator;
  }, {});
};

export const setSettingEntries = (entries) => {
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO monetization_settings (key, value_json, created_at, updated_at)
    VALUES (@key, @valueJson, @createdAt, @updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
  `);

  const timestamp = now();
  const transaction = db.transaction((items) => {
    items.forEach(({ key, value }) => {
      statement.run({
        key,
        valueJson: JSON.stringify(value),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });
  });

  transaction(entries);
};

export const writeAuditLog = ({ actorId = null, action, entityType, entityId = null, payload = null }) => {
  getDb()
    .prepare(`
      INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(actorId, action, entityType, entityId, payload ? JSON.stringify(payload) : null, now());
};

export const mapSlotRow = (row) => ({
  id: row.id,
  key: row.key,
  name: row.name,
  pageKey: row.page_key,
  provider: row.provider,
  adUnitId: row.ad_unit_id || "",
  format: row.format,
  fullWidthResponsive: Boolean(row.full_width_responsive),
  isActive: Boolean(row.is_active),
  sortOrder: row.sort_order,
  notes: row.notes || "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
