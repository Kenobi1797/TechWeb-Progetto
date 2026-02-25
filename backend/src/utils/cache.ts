/**
 * Utility per gestione cache con TTL
 * Usato da GeoapifyService e altri servizi
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheManager<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Rate limiter con delay tra richieste
 */
export class RateLimiter {
  private lastRequestTime = 0;
  private readonly delayMs: number;

  constructor(delayMs: number = 1000) {
    this.delayMs = delayMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.delayMs) {
      await new Promise(resolve => 
        setTimeout(resolve, this.delayMs - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  reset(): void {
    this.lastRequestTime = 0;
  }
}
