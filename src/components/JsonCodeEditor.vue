<template>
  <div class="json-code-editor">
    <pre ref="highlightLayer" class="json-highlight" aria-hidden="true"><span
      v-for="(token, index) in tokens"
      :key="index"
      :class="`json-${token.type}`"
    >{{ token.value }}</span></pre>
    <textarea
      :value="modelValue"
      class="json-code-input"
      spellcheck="false"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @scroll="syncScroll"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { tokenizeJson } from '../utils/jsonHighlight';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const highlightLayer = ref<HTMLElement | null>(null);
const tokens = computed(() => tokenizeJson(props.modelValue || ' '));

function syncScroll(event: Event) {
  if (!highlightLayer.value) {
    return;
  }
  const target = event.target as HTMLTextAreaElement;
  highlightLayer.value.scrollTop = target.scrollTop;
  highlightLayer.value.scrollLeft = target.scrollLeft;
}
</script>
