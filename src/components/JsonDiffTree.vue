<template>
  <div class="json-tree">
    <JsonDiffTreeNode :value="value" :path="[]" :highlights="highlights" />
  </div>
</template>

<script setup lang="ts">
import type { JsonValue } from '../utils/json';
import type { DiffType } from '../utils/jsonDiff';
import JsonDiffTreeNode from './JsonDiffTreeNode.vue';

defineProps<{
  value: JsonValue;
  highlights: Record<string, DiffType>;
}>();
</script>
