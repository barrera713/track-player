export interface IStorer {
  set<T>(key: string, value: T, duration: number): void;
  get<T>(key: string): T | undefined;
  has(key: string): boolean;
  delete(key: string): void;
  pruneExpiredEntries(): void;
}

export interface CacheData<T> {
  value: T;
  expiresAt: number;
}
