const isBrowser = typeof window !== "undefined";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const APP_ORIGIN = isBrowser ? window.location.origin : "";
export const API_ORIGIN = trimTrailingSlash(process.env.REACT_APP_API_URL || APP_ORIGIN);
export const API_BASE = process.env.REACT_APP_API_BASE || "/api";
export const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}${API_BASE}` : API_BASE;

export const resolveApiUrl = (value) => {
  if (!value) {
    return value;
  }

  if (/^(data:|blob:|https?:\/\/)/i.test(value)) {
    return value;
  }

  const baseOrigin = API_ORIGIN || APP_ORIGIN;
  if (!baseOrigin) {
    return value;
  }

  return new URL(value, `${baseOrigin}/`).toString();
};
