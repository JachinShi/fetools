<template>
  <div class="tree-node">
    <div class="tree-line diff-tree-line" :class="highlightClass">
      <button
        v-if="isContainer"
        type="button"
        class="tree-toggle"
        :title="collapsed ? '展开节点' : '折叠节点'"
        @click="collapsed = !collapsed"
      >
        <ChevronRight v-if="collapsed" :size="14" />
        <ChevronDown v-else :size="14" />
      </button>
      <span v-else class="tree-spacer"></span>

      <span v-if="showKey" class="json-key">{{ displayKey }}</span>
      <span v-if="showKey" class="json-punctuation">:</span>
      <span v-if="isContainer" class="json-punctuation">{{ containerOpen }}</span>
      <span v-else :class="valueClass">{{ primitiveText }}</span>
      <span v-if="isContainer && collapsed" class="tree-summary">
        {{ summary }}
        <span class="json-punctuation">{{ containerClose }}</span>
      </span>
    </div>

    <div v-if="isContainer && !collapsed" class="tree-children">
      <JsonDiffTreeNode
        v-for="child in children"
        :key="child.id"
        :node-key="child.key"
        :value="child.value"
        :path="child.path"
        :highlights="highlights"
      />
      <div class="tree-line">
        <span class="tree-spacer"></span>
        <span class="json-punctuation">{{ containerClose }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import type { JsonPath, JsonValue } from '../utils/json';
import type { DiffType } from '../utils/jsonDiff';

type JsonObject = { [key: string]: JsonValue };

const props = defineProps<{
  nodeKey?: string | number;
  value: JsonValue;
  path: JsonPath;
  highlights: Record<string, DiffType>;
}>();

const collapsed = ref(false);

function asObject(value: JsonValue): JsonObject | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : null;
}

function pathKey(path: JsonPath): string {
  return path
    .map((part) => (typeof part === 'number' ? `[${part}]` : part))
    .join('.');
}

const isArray = computed(() => Array.isArray(props.value));
const objectValue = computed(() => asObject(props.value));
const isObject = computed(() => objectValue.value !== null);
const isContainer = computed(() => isArray.value || isObject.value);
const containerOpen = computed(() => (isArray.value ? '[' : '{'));
const containerClose = computed(() => (isArray.value ? ']' : '}'));
const displayKey = computed(() =>
  typeof props.nodeKey === 'number' ? props.nodeKey : `"${props.nodeKey}"`
);
const showKey = computed(() => typeof props.nodeKey === 'string');
const summary = computed(() => {
  if (Array.isArray(props.value)) {
    return `${props.value.length} items`;
  }
  if (isObject.value) {
    return `${Object.keys(objectValue.value ?? {}).length} keys`;
  }
  return '';
});
const children = computed(() => {
  if (Array.isArray(props.value)) {
    return props.value.map((value, index) => ({
      id: String(index),
      key: index,
      value,
      path: [...props.path, index]
    }));
  }

  const object = objectValue.value;
  if (object) {
    return Object.keys(object).map((key) => ({
      id: key,
      key,
      value: object[key],
      path: [...props.path, key]
    }));
  }

  return [];
});
const primitiveText = computed(() => {
  if (typeof props.value === 'string') {
    return `"${props.value}"`;
  }
  return String(props.value);
});
const valueClass = computed(() => ({
  'json-string': typeof props.value === 'string',
  'json-number': typeof props.value === 'number',
  'json-boolean': typeof props.value === 'boolean',
  'json-null': props.value === null
}));
const highlightClass = computed(() => {
  const type = props.highlights[pathKey(props.path)];
  return type ? `diff-bg-${type}` : '';
});
</script>
