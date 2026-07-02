export interface LocalizedError {
  key: string;
  values?: Record<string, string | number>;
  fallback?: string;
}
