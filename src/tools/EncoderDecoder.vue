<template>
  <section class="tool-grid two-column">
    <div class="panel">
      <div class="panel-header">
        <h3>源文本</h3>
        <button type="button" class="icon-button" title="清空" @click="clearAll">
          <Trash2 :size="17" />
        </button>
      </div>
      <textarea v-model="source" class="code-editor" spellcheck="false" />
      <div class="form-row">
        <label for="encoding-mode">转换方式</label>
        <select id="encoding-mode" v-model="mode">
          <option value="url-encode">URL Encode</option>
          <option value="url-decode">URL Decode</option>
          <option value="base64-encode">Base64 Encode</option>
          <option value="base64-decode">Base64 Decode</option>
          <option value="html-encode">HTML Entity Encode</option>
          <option value="html-decode">HTML Entity Decode</option>
        </select>
      </div>
      <button type="button" class="primary-button" @click="convert">
        <ArrowRightLeft :size="17" />
        转换
      </button>
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h3>结果</h3>
        <button type="button" class="icon-button" title="复制" @click="copyResult">
          <Copy :size="17" />
        </button>
      </div>
      <textarea v-model="result" class="code-editor" spellcheck="false" readonly />
      <p class="hint-text">{{ status }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRightLeft, Copy, Trash2 } from 'lucide-vue-next';
import { convertEncoding, type EncodingMode } from '../utils/encoding';

const source = ref('FeHelper 中文 & tools');
const mode = ref<EncodingMode>('url-encode');
const result = ref('');
const error = ref('');
const status = ref('等待转换');

function convert() {
  const converted = convertEncoding(source.value, mode.value);
  if (converted.ok) {
    result.value = converted.value;
    error.value = '';
    status.value = '已生成结果';
  } else {
    error.value = converted.error;
    status.value = '转换失败';
  }
}

function clearAll() {
  source.value = '';
  result.value = '';
  error.value = '';
  status.value = '已清空';
}

async function copyResult() {
  if (!result.value) {
    status.value = '没有可复制内容';
    return;
  }
  await navigator.clipboard?.writeText(result.value);
  status.value = '已复制结果';
}
</script>
