export interface IStorer {
    set<T>(key: string, value: T, duration: number): void;
    get<T>(key: string): T | undefined;
    has<T>(key: string): boolean;
    delete<T>(key: string): void;
    pruneExpiredEntries(): void;
}

export interface CacheData<T> {
    value: T;
    expiresAt: number;
}