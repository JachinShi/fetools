import { describe, expect, it } from 'vitest';
import appShell from '../src/components/AppShell.vue?raw';
import jsonFormatter from '../src/tools/JsonFormatter.vue?raw';

describe('tool component state behavior', () => {
  it('keeps tool component instances alive when switching tools', () => {
    expect(appShell).toContain('<KeepAlive>');
    expect(appShell).toContain('<component :is="activeMeta.component" />');
    expect(appShell).toContain('</KeepAlive>');
  });

  it('uses vertical layout by default for JSON formatter', () => {
    expect(jsonFormatter).toContain(
      "const layoutMode = ref<'horizontal' | 'vertical'>('vertical');"
    );
  });
});
