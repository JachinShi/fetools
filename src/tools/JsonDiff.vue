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
        <textarea v-model="left" class="code-editor" spellcheck="false" />
        <p v-if="leftError" class="error-text">{{ leftError }}</p>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>右侧 JSON</h3>
          <button type="button" class="icon-button" title="格式化右侧" @click="formatSide('right')">
            <Wand2 :size="17" />
          </button>
        </div>
        <textarea v-model="right" class="code-editor" spellcheck="false" />
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
          <pre>{{ entry.value }}</pre>
        </div>
        <p v-if="!entries.length" class="hint-text">运行对比后显示结构差异。</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { GitCompareArrows, Wand2 } from 'lucide-vue-next';
import { formatJson, parseJson } from '../utils/json';
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
    value: valueFor(entry)
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
  const leftResult = parseJson(left.value);
  const rightResult = parseJson(right.value);
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

function valueFor(entry: JsonDiffEntry): string {
  if (entry.type === 'added') {
    return JSON.stringify(entry.right, null, 2);
  }
  if (entry.type === 'removed') {
    return JSON.stringify(entry.left, null, 2);
  }
  return JSON.stringify({ left: entry.left, right: entry.right }, null, 2);
}
</script>
