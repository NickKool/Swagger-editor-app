export interface HistoryRecord {
  id: string;
  userId: string;
  timestamp: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  url: string;
  statusCode: number;
  duration: number;
  requestSize: number;
  responseSize: number;
  errorDetails?: string;
}
