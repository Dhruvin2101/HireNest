// Small input helpers shared by the controllers.

// Always work with a trimmed string, whatever the client sent (blocks objects/arrays).
export const str = (value) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : "";

export const normaliseEmail = (value) => str(value).toLowerCase();

export const isEmail = (value) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

// 10-15 digits, optional leading +, spaces/dashes allowed while typing
export const normalisePhone = (value) => str(value).replace(/[\s-]/g, "");
export const isPhone = (value) => /^\+?\d{10,15}$/.test(value);

export const PASSWORD_MIN = 8;

export const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
