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
        <h3>对比结果</h3>
        <button type="button" class="primary-button" @click="compare">
          <GitCompareArrows :size="17" />
          对比
        </button>
      </div>
      <div v-if="leftParsed && rightParsed" class="diff-inline-grid">
        <div>
          <h4>左侧</h4>
          <JsonDiffTree :value="leftParsed" :highlights="leftHighlights" />
        </div>
        <div>
          <h4>右侧</h4>
          <JsonDiffTree :value="rightParsed" :highlights="rightHighlights" />
        </div>
      </div>
      <p v-else class="hint-text">运行对比后在 JSON 内容上用底色标识差异。</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { GitCompareArrows, Wand2 } from 'lucide-vue-next';
import JsonCodeEditor from '../components/JsonCodeEditor.vue';
import JsonDiffTree from '../components/JsonDiffTree.vue';
import { formatJson, parseJsonInput, type JsonValue } from '../utils/json';
import { diffJsonValues, type DiffType, type JsonDiffEntry } from '../utils/jsonDiff';

const left = ref('{"name":"FeHelper","version":1,"enabled":true}');
const right = ref('{"name":"FeHelper","version":2,"mode":"worker"}');
const leftError = ref('');
const rightError = ref('');
const leftParsed = shallowRef<JsonValue | null>(null);
const rightParsed = shallowRef<JsonValue | null>(null);
const leftHighlights = ref<Record<string, DiffType>>({});
const rightHighlights = ref<Record<string, DiffType>>({});

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
    leftParsed.value = leftResult.value;
    rightParsed.value = rightResult.value;
    const entries = diffJsonValues(leftResult.value, rightResult.value);
    leftHighlights.value = buildHighlights(entries, 'left');
    rightHighlights.value = buildHighlights(entries, 'right');
  }
}

function buildHighlights(entries: JsonDiffEntry[], side: 'left' | 'right'): Record<string, DiffType> {
  return Object.fromEntries(
    entries
      .filter((entry) => entry.type !== 'unchanged')
      .filter((entry) => !(side === 'left' && entry.type === 'added'))
      .filter((entry) => !(side === 'right' && entry.type === 'removed'))
      .map((entry) => [entry.path, entry.type])
  );
}
</script>
