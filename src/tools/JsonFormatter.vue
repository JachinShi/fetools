<template>
  <section
    class="formatter-layout"
    :class="{ stacked: layoutMode === 'vertical' }"
    :style="layoutStyle"
  >
    <div class="panel">
      <div class="panel-header">
        <h3>输入</h3>
        <div class="toolbar">
          <button type="button" class="icon-button" title="格式化" @click="format">
            <Wand2 :size="17" />
          </button>
          <button type="button" class="icon-button" title="压缩" @click="compact">
            <Minimize2 :size="17" />
          </button>
          <button type="button" class="icon-button" title="清空" @click="clearAll">
            <Trash2 :size="17" />
          </button>
        </div>
      </div>
      <JsonCodeEditor v-model="source" placeholder='{"name":"FeTools"}' />
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>

    <div
      v-if="layoutMode === 'horizontal'"
      class="formatter-resizer"
      role="separator"
      aria-label="调整输入和解析内容宽度"
      aria-orientation="vertical"
      @pointerdown="startResize"
    ></div>

    <div class="panel">
      <div class="panel-header">
        <h3>解析内容</h3>
        <div class="toolbar">
          <button
            type="button"
            class="icon-button"
            :title="layoutMode === 'horizontal' ? '上下排列' : '左右排列'"
            @click="toggleLayout"
          >
            <Rows3 v-if="layoutMode === 'horizontal'" :size="17" />
            <Columns2 v-else :size="17" />
          </button>
          <button type="button" class="icon-button" title="复制 JSON" @click="copyOutput">
            <Copy :size="17" />
          </button>
        </div>
      </div>
      <JsonTree
        v-if="parsedValue !== null"
        :value="parsedValue"
        root-label="$"
        @delete-node="deleteNode"
        @copy-node="copyNode"
      />
      <textarea v-else v-model="output" class="code-editor" spellcheck="false" readonly />
      <p class="hint-text">{{ status }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { Columns2, Copy, Minimize2, Rows3, Trash2, Wand2 } from 'lucide-vue-next';
import JsonCodeEditor from '../components/JsonCodeEditor.vue';
import JsonTree from '../components/JsonTree.vue';
import {
  compactJson,
  deleteJsonPath,
  formatJson,
  parseJsonInput,
  type JsonPath,
  type JsonValue
} from '../utils/json';

const source = ref('{\n  "name": "FeTools",\n  "tools": ["json", "diff"]\n}');
const output = ref('');
const parsedValue = shallowRef<JsonValue | null>(null);
const error = ref('');
const status = ref('等待处理');
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal');
const leftWidth = ref(50);
const layoutStyle = computed(() =>
  layoutMode.value === 'horizontal'
    ? {
        '--formatter-left': `${leftWidth.value}%`,
        '--formatter-right': `${100 - leftWidth.value}%`
      }
    : undefined
);

function applyResult(result: ReturnType<typeof formatJson>) {
  if (result.ok) {
    output.value = result.value;
    source.value = result.value;
    const parsed = parseJsonInput(result.value);
    parsedValue.value = parsed.ok ? parsed.value : null;
    error.value = '';
    status.value = '已生成输出';
  } else {
    error.value = result.error;
    status.value = '输入需要修正';
  }
}

function format() {
  applyResult(formatJson(source.value));
}

function compact() {
  applyResult(compactJson(source.value));
}

function clearAll() {
  source.value = '';
  output.value = '';
  parsedValue.value = null;
  error.value = '';
  status.value = '已清空';
}

function toggleLayout() {
  layoutMode.value = layoutMode.value === 'horizontal' ? 'vertical' : 'horizontal';
}

function startResize(event: PointerEvent) {
  const container = (event.currentTarget as HTMLElement).parentElement;
  if (!container) {
    return;
  }

  const bounds = container.getBoundingClientRect();
  const pointerId = event.pointerId;
  (event.currentTarget as HTMLElement).setPointerCapture(pointerId);

  function move(moveEvent: PointerEvent) {
    const next = ((moveEvent.clientX - bounds.left) / bounds.width) * 100;
    leftWidth.value = Math.min(75, Math.max(25, next));
  }

  function stop() {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
  }

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop, { once: true });
}

async function copyOutput() {
  const latest = parsedValue.value === null ? output.value : JSON.stringify(parsedValue.value, null, 2);
  if (!latest) {
    status.value = '没有可复制内容';
    return;
  }
  await navigator.clipboard?.writeText(latest);
  status.value = '已复制输出';
}

async function copyNode(value: JsonValue) {
  await navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
  status.value = '已复制节点';
}

function deleteNode(path: JsonPath) {
  if (parsedValue.value === null) {
    return;
  }
  parsedValue.value = deleteJsonPath(parsedValue.value, path);
  output.value = JSON.stringify(parsedValue.value, null, 2);
  status.value = '已删除节点';
}
</script>
