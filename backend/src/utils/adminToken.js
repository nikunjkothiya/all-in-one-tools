import crypto from "crypto";
import config from "../config/env.js";

const base64UrlEncode = (value) =>
  Buffer.from(typeof value === "string" ? value : JSON.stringify(value))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const base64UrlDecode = (value) => {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalizedValue.length % 4;
  const paddedValue = padding ? normalizedValue + "=".repeat(4 - padding) : normalizedValue;
  return Buffer.from(paddedValue, "base64").toString("utf8");
};

const parseExpiryToSeconds = (input) => {
  if (!input) {
    return 24 * 60 * 60;
  }

  if (/^\d+$/.test(String(input))) {
    return Number(input);
  }

  const matchedValue = String(input).trim().match(/^(\d+)([smhdw])$/i);
  if (!matchedValue) {
    return 24 * 60 * 60;
  }

  const [, rawAmount, rawUnit] = matchedValue;
  const amount = Number(rawAmount);
  const unit = rawUnit.toLowerCase();
  const units = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
    w: 7 * 24 * 60 * 60,
  };

  return amount * (units[unit] || units.h);
};

const sign = (value) => base64UrlEncode(crypto.createHmac("sha256", config.jwtSecret).update(value).digest());

export const createAdminToken = (adminUser) => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresInSeconds = parseExpiryToSeconds(config.jwtExpiresIn);

  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    iat: nowSeconds,
    exp: nowSeconds + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyAdminToken = (token) => {
  if (!token) {
    throw new Error("Missing token");
  }

  const [encodedHeader, encodedPayload, providedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !providedSignature) {
    throw new Error("Malformed token");
  }

  const signedValue = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = sign(signedValue);

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < nowSeconds) {
    throw new Error("Token expired");
  }

  return payload;
};
