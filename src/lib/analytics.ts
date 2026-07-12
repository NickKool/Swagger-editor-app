import { db, auth } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { HistoryRecord } from '@/types/analytics';
import { toast } from 'sonner';

type TranslationFn = (key: string) => string;

interface LogRequestParams {
  method: HistoryRecord['method'];
  url: string;
  statusCode: number;
  duration: number;
  requestBody?: string | null;
  responseBody?: string | null;
  errorDetails?: string;
  t: TranslationFn;
}

export async function logApiRequest({
  method,
  url,
  statusCode,
  duration,
  requestBody,
  responseBody,
  errorDetails,
  t,
}: LogRequestParams): Promise<void> {
  const currentUser = auth.currentUser;

  if (!currentUser) return;

  try {
    const encoder = new TextEncoder();

    const requestSize = requestBody ? encoder.encode(requestBody).length : 0;
    const responseSize = responseBody ? encoder.encode(responseBody).length : 0;

    const analyticsData: Omit<HistoryRecord, 'id'> = {
      userId: currentUser.uid,
      timestamp: Date.now(),
      method,
      url,
      statusCode,
      duration,
      requestSize,
      responseSize,
      ...(errorDetails ? { errorDetails } : {}),
    };

    await addDoc(collection(db, 'history'), analyticsData);
  } catch {
    toast.error(t('toastErrorTitle'), {
      description: t('toastErrorDesc'),
      position: 'top-center',
    });
  }
}
