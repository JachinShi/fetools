# FeHelper Worker Tools Design

## Goal

Build a Cloudflare Workers-hosted Vue 3 application that recreates four FeHelper-style browser tools:

- JSON formatter
- JSON comparison
- Information encoding conversion
- Timestamp calculator

The first screen is the tool workspace itself. The project should be lightweight, deployable with Wrangler, and organized so each tool's core behavior can be tested independently from the UI.

## Architecture

Use Vite, Vue 3, and TypeScript for the frontend application. Use Cloudflare Workers as the deployment target for the built static application.

The Worker layer is intentionally thin:

- Serve the built Vue application and static assets.
- Let browser-side code handle all parsing, diffing, encoding, and timestamp calculations.
- Avoid storing user input or sending tool content to a backend.

Expected project structure:

```text
src/
  App.vue
  main.ts
  components/
    AppShell.vue
    ToolNav.vue
  tools/
    JsonFormatter.vue
    JsonDiff.vue
    EncoderDecoder.vue
    TimestampCalculator.vue
  utils/
    json.ts
    jsonDiff.ts
    encoding.ts
    time.ts
  styles/
    base.css
test/
  json.test.ts
  jsonDiff.test.ts
  encoding.test.ts
  time.test.ts
```

## User Interface

Use a dense, practical tool layout rather than a marketing page. Desktop uses a persistent left navigation with the active tool in the main workspace. Smaller screens collapse navigation into a top segmented control.

The visual style should be restrained and focused on repeated use:

- Clear toolbar actions using icon buttons where practical.
- Stable editor panels that do not resize when errors or actions appear.
- Monospace input/output areas for JSON, encoded text, and timestamp values.
- Inline error states near the affected input.
- Copy and clear actions on each tool where useful.

## Tool Behavior

### JSON Formatter

Accept raw JSON text and provide:

- Format with indentation.
- Compress to a single-line JSON string.
- Validate and show parse errors without clearing input.
- Copy formatted output.
- Clear input/output.

The formatter preserves valid JSON values including objects, arrays, strings, numbers, booleans, and null.

### JSON Comparison

Accept left and right JSON inputs and provide:

- Independent format actions for both sides.
- Parse validation for each side.
- Structural comparison after successful parsing.
- Diff output that marks added, removed, changed, and unchanged nodes.

The comparison should use parsed JSON values, not raw string comparison. Object keys should be compared predictably, with sorted keys in diff output for stable results.

### Information Encoding Conversion

Support three conversion families:

- URL encode/decode
- Base64 encode/decode with UTF-8 handling
- HTML entity encode/decode

The tool has a single source input, a selected conversion mode, and a result output. Decode errors should be visible and should not destroy the source input.

### Timestamp Calculator

Provide:

- Current local datetime.
- Current timestamp in seconds and milliseconds.
- Convert seconds or milliseconds timestamp to local datetime and ISO string.
- Convert a local datetime input to seconds and milliseconds timestamp.
- Refresh current time manually.

Conversions should detect seconds versus milliseconds when practical, but explicit fields are preferred for predictable behavior.

## Data Flow

Each Vue tool component owns its input state and calls pure utility functions from `src/utils`.

Utility functions return structured results rather than throwing into components:

```ts
type ToolResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

This keeps error handling consistent and makes unit tests simple.

## Error Handling

JSON parse failures show the native parse message in a user-readable form. Encoding decode failures show a concise conversion error. Timestamp conversion rejects empty, non-numeric, or invalid date values with inline messages.

No tool should erase user input after a failed operation.

## Testing

Use Vitest for utility-level coverage:

- JSON formatting, compression, and invalid JSON errors.
- Structural JSON diff categories for added, removed, changed, and unchanged values.
- URL, Base64, and HTML entity conversion including Unicode text.
- Timestamp conversion between seconds, milliseconds, local date input, and ISO output.

Manual verification:

- `npm run build`
- `npm run test`
- Start the dev server and confirm each tool is usable in a browser.

## Deployment

Use Wrangler static assets configuration for Cloudflare deployment. Vite builds the Vue application into `dist/`, and Wrangler serves that directory as the Worker asset bundle.

The default local development flow is:

```text
npm install
npm run dev
npm run build
npm run preview
```

The Worker remains a static application host; tool computation stays client-side.
