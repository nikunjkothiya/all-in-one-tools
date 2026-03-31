import config from "../config/env.js";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const getRequestOrigin = (req) => {
  if (config.baseUrl) {
    return trimTrailingSlash(config.baseUrl);
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol || "http").split(",")[0].trim();
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.get("host");

  return host ? `${protocol}://${host}` : "";
};

export const buildPublicUrl = (req, pathname) => {
  if (!pathname) {
    return pathname;
  }

  if (/^https?:\/\//i.test(pathname)) {
    return pathname;
  }

  const origin = getRequestOrigin(req);
  if (!origin) {
    return pathname;
  }

  return new URL(pathname, `${origin}/`).toString();
};
