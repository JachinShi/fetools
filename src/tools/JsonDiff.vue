<template>
  <section class="tool-stack">
    <div class="split-editors">
      <div class="panel">
        <div class="panel-header">
          <h3>左侧 JSON</h3>
          <button type="button" class="icon-button" title="格式化左侧" @click="formatSide('left')">
            <Wand2 :size="17" />
          </button>
        </div>
        <JsonCodeEditor v-model="left" />
        <p v-if="leftError" class="error-text">{{ leftError }}</p>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>右侧 JSON</h3>
          <button type="button" class="icon-button" title="格式化右侧" @click="formatSide('right')">
            <Wand2 :size="17" />
          </button>
        </div>
        <JsonCodeEditor v-model="right" />
        <p v-if="rightError" class="error-text">{{ rightError }}</p>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h3>结构差异</h3>
        <button type="button" class="primary-button" @click="compare">
          <GitCompareArrows :size="17" />
          对比
        </button>
      </div>
      <div class="diff-list">
        <div v-for="entry in displayEntries" :key="entry.key" class="diff-row" :class="entry.type">
          <span class="diff-type">{{ entry.label }}</span>
          <code>{{ entry.path }}</code>
          <JsonTree
            v-if="entry.treeValue !== undefined"
            :value="entry.treeValue"
            :root-label="entry.path"
            readonly
            @copy-node="copyNode"
          />
        </div>
        <p v-if="!entries.length" class="hint-text">运行对比后显示结构差异。</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { GitCompareArrows, Wand2 } from 'lucide-vue-next';
import JsonCodeEditor from '../components/JsonCodeEditor.vue';
import JsonTree from '../components/JsonTree.vue';
import { formatJson, parseJsonInput, type JsonValue } from '../utils/json';
import { diffJsonValues, type DiffType, type JsonDiffEntry } from '../utils/jsonDiff';

const left = ref('{"name":"FeHelper","version":1,"enabled":true}');
const right = ref('{"name":"FeHelper","version":2,"mode":"worker"}');
const leftError = ref('');
const rightError = ref('');
const entries = shallowRef<JsonDiffEntry[]>([]);
const displayEntries = computed(() =>
  entries.value.map((entry, index) => ({
    key: `${entry.path}-${entry.type}-${index}`,
    path: entry.path || '$',
    type: entry.type,
    label: labelFor(entry.type),
    treeValue: valueFor(entry)
  }))
);

function formatSide(side: 'left' | 'right') {
  const target = side === 'left' ? left : right;
  const error = side === 'left' ? leftError : rightError;
  const result = formatJson(target.value);
  if (result.ok) {
    target.value = result.value;
    error.value = '';
  } else {
    error.value = result.error;
  }
}

function compare() {
  const leftResult = parseJsonInput(left.value);
  const rightResult = parseJsonInput(right.value);
  leftError.value = leftResult.ok ? '' : leftResult.error;
  rightError.value = rightResult.ok ? '' : rightResult.error;

  if (leftResult.ok && rightResult.ok) {
    entries.value = diffJsonValues(leftResult.value, rightResult.value);
  }
}

function labelFor(type: DiffType): string {
  return {
    added: '新增',
    removed: '删除',
    changed: '修改',
    unchanged: '相同'
  }[type];
}

function valueFor(entry: JsonDiffEntry): JsonValue {
  if (entry.type === 'added') {
    return entry.right ?? null;
  }
  if (entry.type === 'removed') {
    return entry.left ?? null;
  }
  return { left: entry.left ?? null, right: entry.right ?? null };
}

async function copyNode(value: JsonValue) {
  await navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
}
</script>
