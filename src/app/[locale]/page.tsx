import ResponsiveSplitter from '@/components/ResponsiveSplitter/ResponsiveSplitter';
import SchemaEditor from '@/components/SchemaEditor/SchemaEditor';
import SchemaViewer from '@/components/SchemaViewer/SchemaViewer';

export default function HomePage() {
  return <ResponsiveSplitter leftChild={<SchemaEditor />} rightChild={<SchemaViewer />} />;
}
