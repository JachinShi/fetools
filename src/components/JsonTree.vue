<template>
  <div class="json-tree">
    <JsonTreeNode
      :value="value"
      :path="[]"
      :root="true"
      :readonly="readonly"
      @delete-node="$emit('delete-node', $event)"
      @copy-node="$emit('copy-node', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { JsonPath, JsonValue } from '../utils/json';
import JsonTreeNode from './JsonTreeNode.vue';

withDefaults(
  defineProps<{
    value: JsonValue;
    readonly?: boolean;
  }>(),
  {
    readonly: false
  }
);

defineEmits<{
  'delete-node': [path: JsonPath];
  'copy-node': [value: JsonValue];
}>();
</script>
