<template>
  <section class="tool-stack">
    <div class="panel">
      <div class="panel-header">
        <h3>源文本</h3>
        <button type="button" class="icon-button" title="清空" @click="clearAll">
          <Trash2 :size="17" />
        </button>
      </div>
      <textarea v-model="source" class="code-editor compact-editor" spellcheck="false" />

      <div class="mode-tabs" role="tablist" aria-label="转换类型">
        <button
          type="button"
          class="mode-tab"
          :class="{ active: activeGroup === 'encode' }"
          @click="setGroup('encode')"
        >
          加密/编码
        </button>
        <button
          type="button"
          class="mode-tab"
          :class="{ active: activeGroup === 'decode' }"
          @click="setGroup('decode')"
        >
          解密/解码
        </button>
      </div>

      <div class="operation-grid">
        <button
          v-for="operation in operations"
          :key="operation.mode"
          type="button"
          class="operation-button"
          :class="{ active: mode === operation.mode }"
          @click="mode = operation.mode"
        >
          {{ operation.label }}
        </button>
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
      <textarea v-model="result" class="code-editor compact-editor" spellcheck="false" readonly />
      <p class="hint-text">{{ status }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowRightLeft, Copy, Trash2 } from 'lucide-vue-next';
import {
  convertEncoding,
  decodeOperations,
  encodeOperations,
  type EncodingMode
} from '../utils/encoding';

const source = ref('FeTools 中文 & tools');
const activeGroup = ref<'encode' | 'decode'>('encode');
const mode = ref<EncodingMode>('url-encode');
const result = ref('');
const error = ref('');
const status = ref('等待转换');
const operations = computed(() => (activeGroup.value === 'encode' ? encodeOperations : decodeOperations));

function setGroup(group: 'encode' | 'decode') {
  activeGroup.value = group;
  mode.value = operations.value[0].mode;
}

async function convert() {
  const converted = await convertEncoding(source.value, mode.value);
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
