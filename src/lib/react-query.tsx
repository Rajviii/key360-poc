"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface CacheEntry<T = any> {
  data: T | undefined;
  error: Error | null;
  timestamp: number;
  promise: Promise<T> | null;
  subscribers: Set<() => void>;
}

export class QueryClient {
  private cache = new Map<string, CacheEntry>();
  private defaultStaleTime: number;

  constructor(config?: { defaultOptions?: { queries?: { staleTime?: number } } }) {
    this.defaultStaleTime = config?.defaultOptions?.queries?.staleTime ?? 300000; // 5 minutes default
  }

  private getKey(queryKey: any[]): string {
    return JSON.stringify(queryKey);
  }

  public getQueryData<T>(queryKey: any[]): T | undefined {
    const key = this.getKey(queryKey);
    return this.cache.get(key)?.data as T | undefined;
  }

  public setQueryData<T>(queryKey: any[], data: T): void {
    const key = this.getKey(queryKey);
    let entry = this.cache.get(key);
    if (!entry) {
      entry = { data: undefined, error: null, timestamp: 0, promise: null, subscribers: new Set() };
      this.cache.set(key, entry);
    }
    entry.data = data;
    entry.timestamp = Date.now();
    entry.error = null;
    entry.subscribers.forEach((cb) => cb());
  }

  public invalidateQueries(filters?: { queryKey?: any[] }): void {
    if (!filters?.queryKey) {
      this.cache.clear();
      return;
    }
    const targetKey = this.getKey(filters.queryKey);
    const entry = this.cache.get(targetKey);
    if (entry) {
      entry.timestamp = 0; // Mark as stale immediately
      entry.subscribers.forEach((cb) => cb());
    }
  }

  public async fetchQuery<T>(options: { queryKey: any[]; queryFn: () => Promise<T>; staleTime?: number }): Promise<T> {
    const key = this.getKey(options.queryKey);
    const staleTime = options.staleTime ?? this.defaultStaleTime;
    let entry = this.cache.get(key);

    if (!entry) {
      entry = { data: undefined, error: null, timestamp: 0, promise: null, subscribers: new Set() };
      this.cache.set(key, entry);
    }

    const isStale = Date.now() - entry.timestamp > staleTime;

    if (entry.data !== undefined && !isStale) {
      return entry.data;
    }

    if (entry.promise) {
      return entry.promise;
    }

    entry.promise = options.queryFn()
      .then((data) => {
        entry!.data = data;
        entry!.timestamp = Date.now();
        entry!.error = null;
        entry!.promise = null;
        entry!.subscribers.forEach((cb) => cb());
        return data;
      })
      .catch((err) => {
        entry!.error = err instanceof Error ? err : new Error(String(err));
        entry!.promise = null;
        entry!.subscribers.forEach((cb) => cb());
        throw err;
      });

    return entry.promise;
  }

  public subscribe(queryKey: any[], callback: () => void): () => void {
    const key = this.getKey(queryKey);
    let entry = this.cache.get(key);
    if (!entry) {
      entry = { data: undefined, error: null, timestamp: 0, promise: null, subscribers: new Set() };
      this.cache.set(key, entry);
    }
    entry.subscribers.add(callback);
    return () => {
      entry?.subscribers.delete(callback);
    };
  }
}

const QueryClientContext = createContext<QueryClient | null>(null);

export function QueryClientProvider({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  return <QueryClientContext.Provider value={client}>{children}</QueryClientContext.Provider>;
}

export function useQueryClient(): QueryClient {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }
  return client;
}

export interface UseQueryOptions<TData = any, TError = Error> {
  queryKey: any[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  select?: (data: TData) => any;
}

export interface UseQueryResult<TData = any, TError = Error> {
  data: TData | undefined;
  isLoading: boolean;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  error: TError | null;
  refetch: () => Promise<void>;
}

export function useQuery<TData = any, TError = Error>(options: UseQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const queryClient = useQueryClient();
  const { queryKey, queryFn, staleTime = 300000, enabled = true, select } = options;

  const [state, setState] = useState(() => {
    const initialData = queryClient.getQueryData<TData>(queryKey);
    return {
      data: initialData !== undefined && select ? select(initialData) : initialData,
      isLoading: initialData === undefined && enabled,
      isFetching: false,
      isError: false,
      error: null as TError | null,
    };
  });

  const isMounted = useRef(true);

  const executeFetch = useCallback(async () => {
    if (!enabled) return;
    try {
      setState((prev) => ({ ...prev, isFetching: true, isLoading: prev.data === undefined }));
      const rawData = await queryClient.fetchQuery({ queryKey, queryFn, staleTime });
      if (isMounted.current) {
        const processedData = select ? select(rawData) : rawData;
        setState({
          data: processedData,
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
        });
      }
    } catch (err) {
      if (isMounted.current) {
        setState({
          data: undefined,
          isLoading: false,
          isFetching: false,
          isError: true,
          error: err as TError,
        });
      }
    }
  }, [queryClient, JSON.stringify(queryKey), enabled, staleTime, select]);

  useEffect(() => {
    isMounted.current = true;

    executeFetch();

    const unsubscribe = queryClient.subscribe(queryKey, () => {
      if (isMounted.current) {
        const rawData = queryClient.getQueryData<TData>(queryKey);
        const processedData = rawData !== undefined && select ? select(rawData) : rawData;
        setState({
          data: processedData,
          isLoading: rawData === undefined,
          isFetching: false,
          isError: false,
          error: null,
        });
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [JSON.stringify(queryKey), executeFetch]);

  return {
    ...state,
    isPending: state.isLoading,
    refetch: executeFetch,
  };
}
