<template>
  <main class="app-layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">FH</span>
        <div>
          <h1>FeHelper</h1>
          <p>Worker Tools</p>
        </div>
      </div>
      <ToolNav v-model="activeTool" :tools="tools" />
    </aside>

    <section class="workspace">
      <header class="workspace-header">
        <div>
          <p class="eyebrow">工具台</p>
          <h2>{{ activeMeta.label }}</h2>
        </div>
        <p>{{ activeMeta.description }}</p>
      </header>

      <component :is="activeMeta.component" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Braces, Clock3, Code2, SplitSquareHorizontal } from 'lucide-vue-next';
import ToolNav from './ToolNav.vue';
import JsonFormatter from '../tools/JsonFormatter.vue';
import JsonDiff from '../tools/JsonDiff.vue';
import EncoderDecoder from '../tools/EncoderDecoder.vue';
import TimestampCalculator from '../tools/TimestampCalculator.vue';

const tools = [
  {
    id: 'json-format',
    label: 'JSON 美化',
    description: '校验、格式化和压缩 JSON 文本。',
    icon: Braces,
    component: JsonFormatter
  },
  {
    id: 'json-diff',
    label: 'JSON 对比',
    description: '按解析后的结构比较左右 JSON。',
    icon: SplitSquareHorizontal,
    component: JsonDiff
  },
  {
    id: 'encoding',
    label: '编码转换',
    description: 'URL、Base64 和 HTML 实体编码解码。',
    icon: Code2,
    component: EncoderDecoder
  },
  {
    id: 'timestamp',
    label: '时间戳',
    description: '秒、毫秒、ISO 和本地时间互转。',
    icon: Clock3,
    component: TimestampCalculator
  }
] as const;

type ToolId = (typeof tools)[number]['id'];

const activeTool = ref<ToolId>('json-format');
const activeMeta = computed(() => tools.find((tool) => tool.id === activeTool.value) ?? tools[0]);
</script>
