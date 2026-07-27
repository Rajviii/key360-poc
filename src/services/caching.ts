import { IDataProvider } from "./IDataProvider";

interface CacheEntry {
  data: any;
  timestamp: number;
}

export class CachingDataProvider<T = any> implements IDataProvider<T> {
  private provider: IDataProvider<T> | any;
  private cacheKey: string;
  private ttl: number; // in milliseconds
  private static globalCache = new Map<string, CacheEntry>();

  constructor(provider: IDataProvider<T> | any, cacheKey: string, ttlSeconds = 300) {
    this.provider = provider;
    this.cacheKey = cacheKey;
    this.ttl = ttlSeconds * 1000;
  }

  // Clear cache for this provider key
  public clearCache(): void {
    CachingDataProvider.globalCache.delete(this.cacheKey);
  }

  // Clear all caches
  public static clearAll(): void {
    CachingDataProvider.globalCache.clear();
  }

  async getAll(): Promise<any> {
    const cached = CachingDataProvider.globalCache.get(this.cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const data = await this.provider.getAll();
    CachingDataProvider.globalCache.set(this.cacheKey, {
      data,
      timestamp: Date.now(),
    });
    return data;
  }

  async getById(id: string | number): Promise<any | undefined> {
    // For single-item retrieval, we check if the full dataset is cached,
    // otherwise delegate to provider.
    const cached = CachingDataProvider.globalCache.get(this.cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.ttl && Array.isArray(cached.data)) {
      return cached.data.find((item: any) => item.id === id);
    }

    return this.provider.getById(id);
  }

  async create(record: any): Promise<any> {
    this.clearCache();
    return this.provider.create(record);
  }

  async update(id: string | number, updates: any): Promise<any> {
    this.clearCache();
    return this.provider.update(id, updates);
  }

  async delete(id: string | number): Promise<boolean> {
    this.clearCache();
    return this.provider.delete(id);
  }
}

// Memory cache for compiled metadata configs
export class MetadataCache {
  private static cache = new Map<string, any>();

  public static get(moduleId: string): any | undefined {
    return this.cache.get(moduleId);
  }

  public static set(moduleId: string, compiledConfig: any): void {
    this.cache.set(moduleId, compiledConfig);
  }

  public static clear(): void {
    this.cache.clear();
  }
}
