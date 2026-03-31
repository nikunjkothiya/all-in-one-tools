import axios from "axios";
import { API_BASE, API_BASE_URL, resolveApiUrl } from "../config/runtime";

const isBrowser = typeof window !== "undefined";

export const getAdminToken = () => (isBrowser ? window.localStorage.getItem("admin_token") : null);
export const setAdminToken = (token) => {
  if (isBrowser) {
    window.localStorage.setItem("admin_token", token);
  }
};
export const clearAdminToken = () => {
  if (isBrowser) {
    window.localStorage.removeItem("admin_token");
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((request) => {
  const token = getAdminToken();
  if (token && request.url?.startsWith("/admin")) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

const postMultipart = (url, formData) =>
  api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Text Tools API
export const textToolsApi = {
  convertCase: (text, caseType) => api.post("/text/case-converter", { text, caseType }),
  compareText: (text1, text2, mode) => api.post("/text/diff", { text1, text2, mode }),
  testRegex: (text, pattern, flags = "g") => api.post("/text/regex", { text, pattern, flags }),
  generateLoremIpsum: (count, type = "paragraphs") => api.get(`/text/lorem-ipsum?count=${count}&type=${type}`),
  previewMarkdown: (markdown) => api.post("/text/markdown", { markdown }),
};

// PDF Tools API
export const pdfToolsApi = {
  splitPDF: async (formData) => {
    const response = await postMultipart("/pdf/split", formData);
    return response.data;
  },

  mergePDF: async (formData) => {
    const response = await postMultipart("/pdf/merge", formData);
    return response.data;
  },

  editPDF: async (formData) => {
    const response = await postMultipart("/pdf/edit", formData);
    return response.data;
  },

  protectPdf: async (formData) => {
    const response = await postMultipart("/pdf/protect", formData);
    return response.data;
  },

  addText: async (formData) => {
    const response = await postMultipart("/pdf/add-text", formData);
    return response.data;
  },

  addSignature: async (formData) => {
    const response = await postMultipart("/pdf/add-signature", formData);
    return response.data;
  },

  handleMetadata: async (formData) => {
    const response = await postMultipart("/pdf/metadata", formData);
    return response.data;
  },

  downloadPdf: async (url, filename) => {
    const response = await fetch(resolveApiUrl(url), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download PDF");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export const imageProcessingApi = {
  resizeImage: async (formData) => {
    const response = await postMultipart("/image/resize", formData);
    return response.data;
  },
  compressImage: async (formData) => {
    const response = await postMultipart("/image/compress", formData);
    return response.data;
  },
  convertImage: async (formData) => {
    const response = await postMultipart("/image/convert", formData);
    return response.data;
  },
  watermarkImage: async (formData) => {
    const response = await postMultipart("/image/watermark", formData);
    return response.data;
  },
  removeExif: async (formData) => {
    const response = await postMultipart("/image/remove-exif", formData);
    return response.data;
  },
};

// File Tools API
export const fileToolsApi = {
  compressFile: (formData) =>
    api.post("/file/compress", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  encryptFile: (formData) =>
    api.post("/file/encrypt", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  decryptFile: (formData) =>
    api.post("/file/decrypt", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Media Tools API
export const mediaToolsApi = {
  convertMedia: (formData) =>
    api.post("/media/convert", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  compressMedia: (formData) =>
    api.post("/media/compress", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  trimMedia: (formData) =>
    api.post("/media/trim", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  changeSpeed: (formData) =>
    api.post("/media/speed", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Web Tools API
export const webToolsApi = {
  shortenUrl: (url) => api.post("/web/shorten", { url }),
  takeScreenshot: (url) => api.post("/web/screenshot", { url }),
  analyzeWebsite: (url) => api.post("/web/analyze", { url }),
  scrapeMetadata: (url) => api.post("/web/scrape-metadata", { url }),
  analyzePerformance: (url) => api.post("/web/analyze-performance", { url }),
  checkSsl: (url) => api.post("/web/check-ssl", { url }),
  parseRobots: (url) => api.post("/web/parse-robots", { url }),
  analyzeSeo: (url) => api.post("/web/seo", { url }),
  checkLinks: (url) => api.post("/web/check-links", { url }),
};

// Data Tools API
export const dataToolsApi = {
  convertData: (data, format, targetFormat) => api.post("/data/convert", { data, format, targetFormat }),
  validateData: (data, format) => api.post("/data/validate", { data, format }),
  transformData: (data, format) => api.post("/data/transform", { data, format }),
};

// Privacy Tools API
export const privacyToolsApi = {
  hashPassword: (password, algorithm) => api.post("/privacy/hash", { password, algorithm }),
  verifyPassword: (password, hashed, algorithm) => api.post("/privacy/verify", { password, hashed, algorithm }),
  encryptText: (text, algorithm, key) => api.post("/privacy/encrypt", { text, algorithm, key }),
  decryptText: (text, key, algorithm, iv, authTag) => api.post("/privacy/decrypt", { text, key, algorithm, iv, authTag }),
  anonymizeData: (data, fields) => api.post("/privacy/anonymize-data", { data, fields }),
  maskData: (data, fields, maskChar = "*") => api.post("/privacy/mask-data", { data, fields, maskChar }),
};

// Loader Tools API
export const loaderToolsApi = {
  downloadAsSVG: (options) =>
    api.post("/loader/downloadAsSVG", options, {
      responseType: "blob",
    }),
  convertToGif: (options) =>
    api.post("/loader/convertToGif", options, {
      responseType: "blob",
    }),
};

export const developerToolsApi = {
  formatCode: (code, format) => api.post("/developer/format", { code, format }),
  minifyCode: (code, format) => api.post("/developer/minify", { code, format }),
  validateCode: (code, format) => api.post("/developer/validate", { code, format }),
};

// Admin and monetization API
export const adminApi = {
  login: (email, password) => api.post("/admin/auth/login", { email, password }),
  getMe: () => api.get("/admin/auth/me"),
  getDashboard: () => api.get("/admin/dashboard"),
  getMonetizationSettings: () => api.get("/admin/monetization/settings"),
  updateMonetizationSettings: (payload) => api.put("/admin/monetization/settings", payload),
  getSlots: () => api.get("/admin/monetization/slots"),
  updateSlot: (id, payload) => api.put(`/admin/monetization/slots/${id}`, payload),
  getAudit: (limit = 25) => api.get(`/admin/audit?limit=${limit}`),
};

export const monetizationPublicApi = {
  getBootstrap: () => api.get("/public/monetization/bootstrap"),
  getSlot: (slotKey, pageKey) =>
    api.get("/public/monetization/slot", {
      params: {
        slotKey,
        pageKey,
      },
    }),
};

export { API_BASE, API_BASE_URL, resolveApiUrl };

export default api;
