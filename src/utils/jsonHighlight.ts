export type JsonToken =
  | { type: 'key'; value: string }
  | { type: 'string'; value: string }
  | { type: 'number'; value: string }
  | { type: 'boolean'; value: string }
  | { type: 'null'; value: string }
  | { type: 'punctuation'; value: string }
  | { type: 'plain'; value: string };

const tokenPattern =
  /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?=\s*:)|"(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}[\]:,])/g;

function tokenType(value: string): JsonToken['type'] {
  if (/^".*"(?=\s*$)/.test(value)) {
    return 'string';
  }
  if (/^-?\d/.test(value)) {
    return 'number';
  }
  if (value === 'true' || value === 'false') {
    return 'boolean';
  }
  if (value === 'null') {
    return 'null';
  }
  if (/^[{}[\]:,]$/.test(value)) {
    return 'punctuation';
  }
  return 'plain';
}

export function tokenizeJson(source: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(tokenPattern)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: 'plain', value: source.slice(lastIndex, index) });
    }

    const isKey = value.startsWith('"') && source.slice(index + value.length).match(/^\s*:/);
    tokens.push({ type: isKey ? 'key' : tokenType(value), value });
    lastIndex = index + value.length;
  }

  if (lastIndex < source.length) {
    tokens.push({ type: 'plain', value: source.slice(lastIndex) });
  }

  return tokens;
}
