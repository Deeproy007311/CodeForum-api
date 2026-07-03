import NodeCache from "node-cache";

const aiCache = new NodeCache({
  stdTTL: 60 * 60 * 24,
  checkperiod: 60 * 10,
  useClones: false,
});

export const getCachedAIResponse = <T>(key: string): T | undefined => {
  return aiCache.get<T>(key);
};

export const setCachedAIResponse = <T>(
  key: string,
  value: T,
  ttlInSeconds: number,
): void => {
  aiCache.set(key, value, ttlInSeconds);
};

export const deleteCachedAIResponse = (key: string): void => {
  aiCache.del(key);
};
