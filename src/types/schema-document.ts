import { FieldValue } from 'firebase/firestore';

interface BaseSchemaDocument {
  userId: string;
  name: string;
  version: string;
  formatUsed: string;
  rawText: string;
}

export interface SchemaDocumentServer extends BaseSchemaDocument {
  updatedAt: FieldValue;
}

export interface SchemaDocument extends BaseSchemaDocument {
  updatedAt: string;
}
