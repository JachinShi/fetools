<template>
  <section class="tool-grid two-column">
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
      <textarea v-model="source" class="code-editor" spellcheck="false" placeholder='{"name":"FeHelper"}' />
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h3>解析内容</h3>
        <div class="toolbar">
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
import { ref, shallowRef } from 'vue';
import { Copy, Minimize2, Trash2, Wand2 } from 'lucide-vue-next';
import JsonTree from '../components/JsonTree.vue';
import {
  compactJson,
  deleteJsonPath,
  formatJson,
  parseJsonInput,
  type JsonPath,
  type JsonValue
} from '../utils/json';

const source = ref('{\n  "name": "FeHelper",\n  "tools": ["json", "diff"]\n}');
const output = ref('');
const parsedValue = shallowRef<JsonValue | null>(null);
const error = ref('');
const status = ref('等待处理');

function applyResult(result: ReturnType<typeof formatJson>) {
  if (result.ok) {
    output.value = result.value;
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

async function copyOutput() {
  if (!output.value) {
    status.value = '没有可复制内容';
    return;
  }
  await navigator.clipboard?.writeText(output.value);
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
