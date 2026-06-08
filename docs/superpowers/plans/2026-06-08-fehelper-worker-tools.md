# FeHelper Worker Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + Vue 3 + TypeScript Cloudflare Worker static app with JSON formatter, JSON diff, encoding conversion, and timestamp calculator tools.

**Architecture:** Vite builds a Vue single-page application into `dist/`. Wrangler serves `dist/` as Cloudflare Worker static assets. Tool behavior lives in pure TypeScript utility modules with Vitest coverage; Vue components own local UI state and call those utilities.

**Tech Stack:** Vite, Vue 3, TypeScript, Vitest, Wrangler, lucide-vue-next.

---

## File Structure

- `package.json`: scripts and dependencies.
- `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `wrangler.jsonc`: project, build, test, and Cloudflare configuration.
- `src/main.ts`, `src/App.vue`, `src/styles/base.css`: Vue app bootstrap and global layout styling.
- `src/components/AppShell.vue`, `src/components/ToolNav.vue`: application shell and navigation.
- `src/tools/JsonFormatter.vue`, `src/tools/JsonDiff.vue`, `src/tools/EncoderDecoder.vue`, `src/tools/TimestampCalculator.vue`: feature UI components.
- `src/utils/result.ts`, `src/utils/json.ts`, `src/utils/jsonDiff.ts`, `src/utils/encoding.ts`, `src/utils/time.ts`: pure tool logic.
- `test/json.test.ts`, `test/jsonDiff.test.ts`, `test/encoding.test.ts`, `test/time.test.ts`: Vitest coverage for tool logic.

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `wrangler.jsonc`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/styles/base.css`

- [ ] **Step 1: Create project configuration**

Create `package.json`:

```json
{
  "name": "fehelper-worker-tools",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "wrangler dev",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-vue": "^6.0.1",
    "lucide-vue-next": "^0.468.0",
    "vite": "^7.2.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "vitest": "^4.0.0",
    "vue-tsc": "^3.1.0",
    "wrangler": "^4.0.0"
  }
}
```

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FeHelper Worker Tools</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "jsx": "preserve",
    "types": ["vitest/globals"]
  },
  "include": ["src", "test", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

Create `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "fehelper-worker-tools",
  "compatibility_date": "2026-06-08",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

- [ ] **Step 2: Create minimal Vue entry files**

Create `src/main.ts`:

```ts
import { createApp } from 'vue';
import App from './App.vue';
import './styles/base.css';

createApp(App).mount('#app');
```

Create `src/App.vue`:

```vue
<template>
  <main class="app-shell">
    <h1>FeHelper Worker Tools</h1>
  </main>
</template>
```

Create `src/styles/base.css`:

```css
:root {
  color: #1f2937;
  background: #f6f7f9;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
textarea,
input,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: dependencies installed and `package-lock.json` created.

- [ ] **Step 4: Verify scaffold build**

Run: `npm run build`

Expected: TypeScript check and Vite build complete with exit code 0.

- [ ] **Step 5: Commit scaffold**

Run:

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json wrangler.jsonc src/main.ts src/App.vue src/styles/base.css docs/superpowers/plans/2026-06-08-fehelper-worker-tools.md
git commit -m "chore: scaffold Vue worker tools app"
```

### Task 2: JSON Formatter Utility

**Files:**
- Create: `src/utils/result.ts`
- Create: `src/utils/json.ts`
- Create: `test/json.test.ts`

- [ ] **Step 1: Write failing JSON utility tests**

Create `test/json.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { compactJson, formatJson, parseJson } from '../src/utils/json';

describe('json utilities', () => {
  it('formats valid JSON with two-space indentation', () => {
    const result = formatJson('{"name":"FeHelper","items":[1,true,null]}');

    expect(result).toEqual({
      ok: true,
      value: '{\n  "name": "FeHelper",\n  "items": [\n    1,\n    true,\n    null\n  ]\n}'
    });
  });

  it('compacts valid JSON to one line', () => {
    const result = compactJson('{\n  "b": 2,\n  "a": 1\n}');

    expect(result).toEqual({ ok: true, value: '{"b":2,"a":1}' });
  });

  it('returns parse errors without throwing', () => {
    const result = parseJson('{ bad json');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid JSON');
    }
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- test/json.test.ts`

Expected: FAIL because `src/utils/json` does not exist.

- [ ] **Step 3: Implement JSON utility**

Create `src/utils/result.ts`:

```ts
export type ToolResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

Create `src/utils/json.ts`:

```ts
import type { ToolResult } from './result';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function parseJson(source: string): ToolResult<JsonValue> {
  try {
    return { ok: true, value: JSON.parse(source) as JsonValue };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { ok: false, error: `Invalid JSON: ${message}` };
  }
}

export function formatJson(source: string): ToolResult<string> {
  const parsed = parseJson(source);
  if (!parsed.ok) {
    return parsed;
  }

  return { ok: true, value: JSON.stringify(parsed.value, null, 2) };
}

export function compactJson(source: string): ToolResult<string> {
  const parsed = parseJson(source);
  if (!parsed.ok) {
    return parsed;
  }

  return { ok: true, value: JSON.stringify(parsed.value) };
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm run test -- test/json.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit JSON utility**

Run:

```bash
git add src/utils/result.ts src/utils/json.ts test/json.test.ts
git commit -m "feat: add json formatting utilities"
```

### Task 3: JSON Diff Utility

**Files:**
- Create: `src/utils/jsonDiff.ts`
- Create: `test/jsonDiff.test.ts`

- [ ] **Step 1: Write failing JSON diff tests**

Create `test/jsonDiff.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { diffJsonValues } from '../src/utils/jsonDiff';

describe('json diff utilities', () => {
  it('marks object values as added removed changed and unchanged', () => {
    const diff = diffJsonValues(
      { same: 1, changed: 'old', removed: true },
      { same: 1, changed: 'new', added: null }
    );

    expect(diff).toEqual([
      { path: 'added', type: 'added', right: null },
      { path: 'changed', type: 'changed', left: 'old', right: 'new' },
      { path: 'removed', type: 'removed', left: true },
      { path: 'same', type: 'unchanged', left: 1, right: 1 }
    ]);
  });

  it('uses stable paths for nested arrays and objects', () => {
    const diff = diffJsonValues(
      { user: { roles: ['admin', 'editor'] } },
      { user: { roles: ['admin', 'viewer'] } }
    );

    expect(diff).toContainEqual({
      path: 'user.roles[1]',
      type: 'changed',
      left: 'editor',
      right: 'viewer'
    });
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- test/jsonDiff.test.ts`

Expected: FAIL because `src/utils/jsonDiff` does not exist.

- [ ] **Step 3: Implement JSON diff utility**

Create `src/utils/jsonDiff.ts`:

```ts
import type { JsonValue } from './json';

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export type JsonDiffEntry = {
  path: string;
  type: DiffType;
  left?: JsonValue;
  right?: JsonValue;
};

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isEqual(left: JsonValue, right: JsonValue): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function joinPath(parent: string, key: string): string {
  return parent ? `${parent}.${key}` : key;
}

function joinIndex(parent: string, index: number): string {
  return `${parent}[${index}]`;
}

export function diffJsonValues(
  left: JsonValue,
  right: JsonValue,
  path = ''
): JsonDiffEntry[] {
  if (isEqual(left, right)) {
    return [{ path, type: 'unchanged', left, right }];
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLength = Math.max(left.length, right.length);
    const entries: JsonDiffEntry[] = [];

    for (let index = 0; index < maxLength; index += 1) {
      const childPath = joinIndex(path, index);
      if (index >= left.length) {
        entries.push({ path: childPath, type: 'added', right: right[index] });
      } else if (index >= right.length) {
        entries.push({ path: childPath, type: 'removed', left: left[index] });
      } else {
        entries.push(...diffJsonValues(left[index], right[index], childPath));
      }
    }

    return entries;
  }

  if (isRecord(left) && isRecord(right)) {
    const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
    const entries: JsonDiffEntry[] = [];

    for (const key of keys) {
      const childPath = joinPath(path, key);
      if (!(key in left)) {
        entries.push({ path: childPath, type: 'added', right: right[key] });
      } else if (!(key in right)) {
        entries.push({ path: childPath, type: 'removed', left: left[key] });
      } else {
        entries.push(...diffJsonValues(left[key], right[key], childPath));
      }
    }

    return entries;
  }

  return [{ path, type: 'changed', left, right }];
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm run test -- test/jsonDiff.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit JSON diff utility**

Run:

```bash
git add src/utils/jsonDiff.ts test/jsonDiff.test.ts
git commit -m "feat: add json diff utilities"
```

### Task 4: Encoding Utility

**Files:**
- Create: `src/utils/encoding.ts`
- Create: `test/encoding.test.ts`

- [ ] **Step 1: Write failing encoding tests**

Create `test/encoding.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { convertEncoding } from '../src/utils/encoding';

describe('encoding utilities', () => {
  it('encodes and decodes URL text', () => {
    expect(convertEncoding('a b=中文', 'url-encode')).toEqual({
      ok: true,
      value: 'a%20b%3D%E4%B8%AD%E6%96%87'
    });
    expect(convertEncoding('a%20b%3D%E4%B8%AD%E6%96%87', 'url-decode')).toEqual({
      ok: true,
      value: 'a b=中文'
    });
  });

  it('encodes and decodes Base64 Unicode text', () => {
    const encoded = convertEncoding('FeHelper 中文', 'base64-encode');

    expect(encoded.ok).toBe(true);
    if (encoded.ok) {
      expect(convertEncoding(encoded.value, 'base64-decode')).toEqual({
        ok: true,
        value: 'FeHelper 中文'
      });
    }
  });

  it('encodes and decodes HTML entities', () => {
    expect(convertEncoding('<span title="x">&</span>', 'html-encode')).toEqual({
      ok: true,
      value: '&lt;span title=&quot;x&quot;&gt;&amp;&lt;/span&gt;'
    });
    expect(convertEncoding('&lt;b&gt;Hi&amp;&lt;/b&gt;', 'html-decode')).toEqual({
      ok: true,
      value: '<b>Hi&</b>'
    });
  });

  it('returns decode errors without throwing', () => {
    const result = convertEncoding('%E0%A4%A', 'url-decode');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Unable to decode');
    }
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- test/encoding.test.ts`

Expected: FAIL because `src/utils/encoding` does not exist.

- [ ] **Step 3: Implement encoding utility**

Create `src/utils/encoding.ts`:

```ts
import type { ToolResult } from './result';

export type EncodingMode =
  | 'url-encode'
  | 'url-decode'
  | 'base64-encode'
  | 'base64-decode'
  | 'html-encode'
  | 'html-decode';

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const reversedHtmlEntities = Object.fromEntries(
  Object.entries(htmlEntities).map(([character, entity]) => [entity, character])
);

function encodeBase64(source: string): string {
  const bytes = new TextEncoder().encode(source);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(source: string): string {
  const binary = atob(source);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeHtml(source: string): string {
  return source.replace(/[&<>"']/g, (character) => htmlEntities[character]);
}

function decodeHtml(source: string): string {
  return source.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => reversedHtmlEntities[entity]);
}

export function convertEncoding(source: string, mode: EncodingMode): ToolResult<string> {
  try {
    switch (mode) {
      case 'url-encode':
        return { ok: true, value: encodeURIComponent(source) };
      case 'url-decode':
        return { ok: true, value: decodeURIComponent(source) };
      case 'base64-encode':
        return { ok: true, value: encodeBase64(source) };
      case 'base64-decode':
        return { ok: true, value: decodeBase64(source) };
      case 'html-encode':
        return { ok: true, value: encodeHtml(source) };
      case 'html-decode':
        return { ok: true, value: decodeHtml(source) };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown conversion error';
    return { ok: false, error: `Unable to decode or encode input: ${message}` };
  }
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm run test -- test/encoding.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit encoding utility**

Run:

```bash
git add src/utils/encoding.ts test/encoding.test.ts
git commit -m "feat: add encoding conversion utilities"
```

### Task 5: Time Utility

**Files:**
- Create: `src/utils/time.ts`
- Create: `test/time.test.ts`

- [ ] **Step 1: Write failing time tests**

Create `test/time.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { dateInputToTimestamp, timestampToDateParts } from '../src/utils/time';

describe('time utilities', () => {
  it('converts millisecond timestamps to date parts', () => {
    expect(timestampToDateParts('1704067200000', 'milliseconds')).toEqual({
      ok: true,
      value: {
        milliseconds: 1704067200000,
        seconds: 1704067200,
        iso: '2024-01-01T00:00:00.000Z',
        localInput: '2024-01-01T08:00'
      }
    });
  });

  it('converts second timestamps to date parts', () => {
    const result = timestampToDateParts('1704067200', 'seconds');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.milliseconds).toBe(1704067200000);
      expect(result.value.seconds).toBe(1704067200);
      expect(result.value.iso).toBe('2024-01-01T00:00:00.000Z');
    }
  });

  it('converts local datetime input to timestamps', () => {
    expect(dateInputToTimestamp('2024-01-01T08:00')).toEqual({
      ok: true,
      value: {
        milliseconds: 1704067200000,
        seconds: 1704067200,
        iso: '2024-01-01T00:00:00.000Z',
        localInput: '2024-01-01T08:00'
      }
    });
  });

  it('rejects invalid timestamps', () => {
    const result = timestampToDateParts('abc', 'seconds');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid timestamp');
    }
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `TZ=Asia/Shanghai npm run test -- test/time.test.ts`

Expected: FAIL because `src/utils/time` does not exist.

- [ ] **Step 3: Implement time utility**

Create `src/utils/time.ts`:

```ts
import type { ToolResult } from './result';

export type TimestampUnit = 'seconds' | 'milliseconds';

export type DateParts = {
  milliseconds: number;
  seconds: number;
  iso: string;
  localInput: string;
};

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function toLocalInput(date: Date): string {
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes())
  ].join('');
}

function toDateParts(date: Date): ToolResult<DateParts> {
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid date value' };
  }

  const milliseconds = date.getTime();
  return {
    ok: true,
    value: {
      milliseconds,
      seconds: Math.floor(milliseconds / 1000),
      iso: date.toISOString(),
      localInput: toLocalInput(date)
    }
  };
}

export function timestampToDateParts(
  source: string,
  unit: TimestampUnit
): ToolResult<DateParts> {
  const trimmed = source.trim();
  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: 'Invalid timestamp: enter an integer value' };
  }

  const numeric = Number(trimmed);
  if (!Number.isSafeInteger(numeric)) {
    return { ok: false, error: 'Invalid timestamp: value is outside the safe integer range' };
  }

  const milliseconds = unit === 'seconds' ? numeric * 1000 : numeric;
  return toDateParts(new Date(milliseconds));
}

export function dateInputToTimestamp(source: string): ToolResult<DateParts> {
  const trimmed = source.trim();
  if (!trimmed) {
    return { ok: false, error: 'Invalid date value: choose a date and time' };
  }

  return toDateParts(new Date(trimmed));
}

export function currentDateParts(now = new Date()): DateParts {
  const parts = toDateParts(now);
  if (!parts.ok) {
    throw new Error(parts.error);
  }
  return parts.value;
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `TZ=Asia/Shanghai npm run test -- test/time.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit time utility**

Run:

```bash
git add src/utils/time.ts test/time.test.ts
git commit -m "feat: add timestamp utilities"
```

### Task 6: Vue Tool Interface

**Files:**
- Replace: `src/App.vue`
- Create: `src/components/AppShell.vue`
- Create: `src/components/ToolNav.vue`
- Create: `src/tools/JsonFormatter.vue`
- Create: `src/tools/JsonDiff.vue`
- Create: `src/tools/EncoderDecoder.vue`
- Create: `src/tools/TimestampCalculator.vue`
- Replace: `src/styles/base.css`

- [ ] **Step 1: Implement Vue shell and tool components**

Create UI components that:

- Use the utility APIs already covered by tests.
- Use lucide-vue-next icons for primary buttons.
- Keep editor panels stable and responsive.
- Show inline errors without clearing user input.

- [ ] **Step 2: Run full tests**

Run: `TZ=Asia/Shanghai npm run test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Commit Vue interface**

Run:

```bash
git add src/App.vue src/components src/tools src/styles/base.css
git commit -m "feat: build Vue tool interface"
```

### Task 7: Final Verification

**Files:**
- No required source changes unless verification finds issues.

- [ ] **Step 1: Run all tests**

Run: `TZ=Asia/Shanghai npm run test`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev -- --port 5173`

Expected: Vite prints a local URL and keeps running.

- [ ] **Step 4: Commit any verification fixes**

If Step 1 or Step 2 required fixes, commit them with:

```bash
git add .
git commit -m "fix: resolve verification issues"
```

If no fixes were required, do not create an empty commit.
