import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMounted } from './useMounted';

function Probe() {
  const mounted = useMounted();
  return <span data-testid="mounted">{String(mounted)}</span>;
}

describe('useMounted (server snapshot)', () => {
  test('returns false during server render', () => {
    const html = renderToStaticMarkup(<Probe />);
    expect(html).toContain('false');
  });
});
