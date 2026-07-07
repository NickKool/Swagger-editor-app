'use server';

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import type { OpenAPI } from '@scalar/openapi-types';

import { db } from '@/lib/firebase';
import { SchemaDocument, SchemaDocumentServer } from '@/types/schema-document';

export async function fetchSchema(userId: string): Promise<SchemaDocument | null> {
  try {
    const docRef = doc(db, 'schemas', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const firebaseTimestamp = data.updatedAt as Timestamp;
      const formattedDate = firebaseTimestamp?.toDate
        ? firebaseTimestamp.toDate().toISOString()
        : new Date().toISOString();

      return {
        userId: data.userId,
        name: data.name,
        version: data.version,
        formatUsed: data.formatUsed,
        rawText: data.rawText,
        updatedAt: formattedDate,
      } as SchemaDocument;
    }
    return null;
  } catch (error: unknown) {
    console.error('Server Fetch Error:', error);
    return null;
  }
}

interface SaveSchemaParams {
  userId: string;
  spec: string;
  format: string;
  parsedSpec: OpenAPI.Document;
}

export async function saveSchema({
  userId,
  spec,
  format,
  parsedSpec,
}: SaveSchemaParams): Promise<void> {
  const title = parsedSpec.info?.title || 'OpenAPI Spec';
  const version = parsedSpec.info?.version || '1.0.0';

  const schemaDocument: SchemaDocumentServer = {
    userId,
    name: title,
    version,
    formatUsed: format,
    rawText: spec,
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, 'schemas', userId), schemaDocument);
}
