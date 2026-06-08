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
        <h3>输出</h3>
        <button type="button" class="icon-button" title="复制" @click="copyOutput">
          <Copy :size="17" />
        </button>
      </div>
      <textarea v-model="output" class="code-editor" spellcheck="false" readonly />
      <p class="hint-text">{{ status }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Copy, Minimize2, Trash2, Wand2 } from 'lucide-vue-next';
import { compactJson, formatJson } from '../utils/json';

const source = ref('{\n  "name": "FeHelper",\n  "tools": ["json", "diff"]\n}');
const output = ref('');
const error = ref('');
const status = ref('等待处理');

function applyResult(result: ReturnType<typeof formatJson>) {
  if (result.ok) {
    output.value = result.value;
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
</script>
