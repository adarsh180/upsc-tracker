// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

export function clearCache(): void {
  cache.clear();
}