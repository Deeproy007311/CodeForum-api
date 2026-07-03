import crypto from "crypto";

export const createCacheKey = (feature: string, data: unknown): string => {
  const normalizedData = JSON.stringify(data);

  const hash = crypto.createHash("sha256").update(normalizedData).digest("hex");

  return `ai:${feature}:${hash}`;
};
