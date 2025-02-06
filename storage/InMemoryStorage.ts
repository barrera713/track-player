import type { IStorer, CacheData } from './interfaces';

export class InMemoryStorage implements IStorer {
  private data: Map<string, CacheData<unknown>> = new Map();

  set<T>(key: string, value: T, durationInMs: number): void {
    const expiresAt = Date.now() + durationInMs;

    this.data.set(key, {
      value,
      expiresAt,
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.data.get(key);

    if (entry && this.isCachedEntryValid(entry)) return entry.value as T;

    return undefined;
  }

  has(key: string): boolean {
    const entry = this.data.get(key);

    if (entry && this.isCachedEntryValid(entry)) return true;

    this.data.delete(key);

    return false;
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  pruneExpiredEntries(): void {
    for (const [key, entry] of this.data) {
      if (!this.isCachedEntryValid(entry)) this.data.delete(key);
    }
  }

  private isCachedEntryValid(entry: CacheData<unknown>): boolean {
    return entry.expiresAt > Date.now();
  }
}
